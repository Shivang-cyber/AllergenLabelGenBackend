const xlsx = require("xlsx");
const getAllergenData = require("./getAllergenData");

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

const processExcelFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  let results = [];

  const grouped = groupedData(data);

  let caching = new Map();

  for (const row of grouped) {
    const recipeName = row["Product"];
    const ingredients = row["Ingredients"].map((i) => i.trim());

    let allergens = new Set();
    let flaggedIngredients = {};
    let unrecognizedIngredients = [];

    for (const ingredient of ingredients) {

      if (caching.has(ingredient)) {
        const { allergens: ingredientAllergens, flagged } =
          caching.get(ingredient);

        if (ingredientAllergens.length > 0) {
          allergens = new Set([...allergens, ...ingredientAllergens]);
          flaggedIngredients[ingredient] = ingredientAllergens;
        } else {
          unrecognizedIngredients.push(ingredient);
        }
        continue;
      }
      const { allergens: ingredientAllergens, flagged } = await getAllergenData(
        ingredient
      );
      if (ingredientAllergens.length > 0) {
        allergens = new Set([...allergens, ...ingredientAllergens]);
        flaggedIngredients[ingredient] = ingredientAllergens;
        caching.set(ingredient, { allergens: ingredientAllergens, flagged });
      } else {
        unrecognizedIngredients.push(ingredient);
        caching.set(ingredient, { allergens: [], flagged });
      }
    }

    results.push({
      recipe_name: recipeName,
      allergens: Array.from(allergens),
      flagged_ingredients: flaggedIngredients,
      unrecognized_ingredients: unrecognizedIngredients,
      message:
        unrecognizedIngredients.length > 0
          ? "Some ingredients were not recognized."
          : "Processed successfully.",
    });
  }
  return { recipes: results };
};

module.exports = processExcelFile;
