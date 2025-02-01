require("dotenv").config({ path: `${process.cwd()}/.env` });
const axios = require("axios");
const API_URL = process.env.OPEN_FOOD_FACT_API;
const BATCH_SIZE = process.env.BATCH_SIZE || 10; 
const INITIAL_DELAY = process.env.INITIAL_DELAY || 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (ingredient, retries = 3, delayTime = INITIAL_DELAY) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    search_terms: ingredient,
                    search_simple: 1,
                    action: "process",
                    json: 1,
                },
            });
            
            if (!response.data.products || response.data.products.length === 0) {
              return { ingredient, allergens: [], flagged: [], error: "No products found" };
            }

            const product = response.data.products[0];
            return {
                ingredient,
                allergens: product.allergens ? product.allergens.split(",") : [],
                flagged: product.ingredients_analysis_tags || [],
                error: null
            };
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${ingredient}. Retrying in ${delayTime}ms...`);
            await delay(delayTime);
            delayTime *= 2;
        }
    }
    return { ingredient, allergens: [], flagged: [], error: "Failed after multiple attempts" };
};

const getAllergenDataBatch = async (ingredientsArray) => {
    
    let results = [];
    
    for (let i = 0; i < ingredientsArray.length; i += BATCH_SIZE) {
        const batch = ingredientsArray.slice(i, i + BATCH_SIZE);

        console.log(`Processing batch ${Math.ceil(i / BATCH_SIZE) + 1}...`);

        const batchResults = await Promise.all(
            batch.map((ingredient) => fetchWithRetry(ingredient))
        );

        results = results.concat(batchResults);

        if (i + BATCH_SIZE < ingredientsArray.length) {
            await delay(2000);
        }
    }

    return results;
};

module.exports = getAllergenDataBatch;