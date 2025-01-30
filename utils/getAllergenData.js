const axios = require("axios");

const getAllergenData = async (ingredient) => {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${ingredient}&search_simple=1&action=process&json=1`
    );
    if (response.data.products.length === 0) {
      return { allergens: [], flagged: [] };
    }

    const product = response.data.products[0];
    return {
      allergens: product.allergens ? product.allergens.split(",") : [],
      flagged: product.ingredients_analysis_tags || [],
    };
  } catch (error) {
    // console.error(`Error fetching data for ${ingredient}:`, error);
    return { allergens: [], flagged: [] };
  }
};

module.exports = getAllergenData;
