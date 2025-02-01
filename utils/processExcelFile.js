const xlsx = require("xlsx");
const getAllergenDataBatch = require("./getAllergenData");

const groupedData = (data) => {
  return data.reduce((acc, { Product, Ingredients }) => {
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
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const grouped = groupedData(data);

  let caching = new Map();

  for (let row of grouped) {
    const recipeName = row["Product"];
    const ingredients = row["Ingredients"].map((i) => i.trim());

    let allergens = new Set();
    let flaggedIngredients = {};
    let unrecognizedIngredients = [];

    const filteredIngredients = ingredients.filter((ingredient) => {
      return !caching.has(ingredient);
    });

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
        if (!result.error) {
          caching.set(ingredient, {
            allergens: ingredientAllergens,
            flagged,
          });
        }
      } else {
        unrecognizedIngredients.push(ingredient);
        caching.set(ingredient, { allergens: [], flagged });
      }
    }

    client.send(
      JSON.stringify({
        recipe_name: recipeName,
        allergens: Array.from(allergens),
        flagged_ingredients: flaggedIngredients,
        unrecognized_ingredients: unrecognizedIngredients,
        message:
          unrecognizedIngredients.length > 0
            ? "Some ingredients were not recognized."
            : "Processed successfully.",
      })
    );
  }
};

module.exports = processExcelFile;
