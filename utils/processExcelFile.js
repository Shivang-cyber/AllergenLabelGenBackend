const xlsx = require("xlsx");
const getAllergenDataBatch = require("./getAllergenData");
const AppError = require("./appError");

const groupedData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new AppError("No valid data found in the file", 400);
  }

  return data.reduce((acc, { Product, Ingredients }) => {
    if (!Product || !Ingredients) {
      throw new AppError(
        "Missing required fields: Product or Ingredients",
        400
      );
    }

    const existing = acc.find((item) => item.Product === Product);
    if (existing) {
      existing.Ingredients.push(Ingredients);
    } else {
      acc.push({ Product, Ingredients: [Ingredients] });
    }
    return acc;
  }, []);
};

const processExcelFile = async (filePath, client) => {
  if (!filePath) {
    throw new AppError("File path is required", 400);
  }

  const workbook = xlsx.readFile(filePath);
  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new AppError("Invalid Excel file or missing sheets", 400);
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new AppError("Excel sheet not found", 400);
  }

  const data = xlsx.utils.sheet_to_json(sheet);
  const grouped = groupedData(data);

  let caching = new Map();

  for (let row of grouped) {
    const recipeName = row["Product"];
    const ingredients = row["Ingredients"].map((i) => i.trim());

    if (!ingredients.length) {
      throw new AppError(
        `No ingredients found for product: ${recipeName}`,
        400
      );
    }

    let allergens = new Set();
    let flaggedIngredients = {};
    let unrecognizedIngredients = [];

    const filteredIngredients = ingredients.filter((ingredient) => {
      return !caching.has(ingredient);
    });

    try {
      const batchResults = await getAllergenDataBatch(filteredIngredients);

      for (const result of batchResults) {
        const {
          ingredient,
          allergens: ingredientAllergens,
          flagged,
          error,
        } = result;

        if (!error) {
          allergens = new Set([...allergens, ...ingredientAllergens]);
          flaggedIngredients[ingredient] = ingredientAllergens;
          caching.set(ingredient, { allergens: ingredientAllergens, flagged });
        } else {
          unrecognizedIngredients.push(ingredient);
          caching.set(ingredient, { allergens: [], flagged });
        }
      }
    } catch (err) {
      throw new AppError("Failed to process allergen data", 500);
    }

    const resultant = {
      recipe_name: recipeName,
      allergens: Array.from(allergens),
      flagged_ingredients: flaggedIngredients,
      unrecognized_ingredients: unrecognizedIngredients,
      message:
        unrecognizedIngredients.length > 0
          ? "Some ingredients were not recognized."
          : "Processed successfully.",
    };

    console.log(resultant);

    client.send(JSON.stringify(resultant));
  }

  console.log("Processing complete");
  return;
};

module.exports = processExcelFile;
