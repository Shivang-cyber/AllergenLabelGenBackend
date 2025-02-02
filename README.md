# Allergen Label Generator

This project is designed to generate allergen labels by fetching data from the Open Food Facts API and sending it over WebSocket (WSS).

## Setup

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd AllergenLabelGen
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up the `.env` file with the following variables:
    ```
    OPEN_FOOD_FACT_API=https://world.openfoodfacts.org/cgi/search.pl
    BATCH_SIZE=3
    INITIAL_DELAY=2000
    PORT=3000
    NODE_ENV=production
    ```

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. Get the front end from [gitlink](<https://github.com/Shivang-cyber/AllergenFront>).

3. Open your browser and navigate to [link](<http://localhost:3001>).

4. Upload the file of the selected type and get the result asynchronously.

## Notes

- Ensure that the server is running and the front end is properly set up to communicate over WSS.
- The application is configured to run in production mode by default.
