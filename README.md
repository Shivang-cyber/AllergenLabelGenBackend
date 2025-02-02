Allergen Label Generator - WebSocket Based API

This project provides a WebSocket-based API for processing Excel files that contain product ingredient data. The backend extracts allergen information and sends it asynchronously to connected clients.

Features

Upload an Excel file with product ingredients.

Process ingredients in batches using an external API.

Identify allergens and flag unknown ingredients.

Send results asynchronously via WebSocket.

Setup Instructions

1️⃣ Prerequisites

Ensure you have the following installed:

Node.js (v20+)

npm (comes with Node.js)

2️⃣ Clone the Repository

git clone <your-repo-link>
cd allergen-label-generator

3️⃣ Install Dependencies

npm install

4️⃣ Setup Environment Variables

Create a .env file in the root directory and add the following:

OPEN_FOOD_FACT_API=https://world.openfoodfacts.org/cgi/search.pl
BATCH_SIZE=3
INITIAL_DELAY=2000
PORT=3000
NODE_ENV=production

5️⃣ Start the Server

npm start

The server will start on http://localhost:3000/.

How to Use

📌 WebSocket Connection

The backend uses WebSocket (wss://) for real-time communication.

Clients connect to the WebSocket server to receive updates.

Each upload triggers batch processing of ingredients.

Results are sent asynchronously over WebSocket.

📌 Uploading an Excel File

Get the frontend from:

git clone git@gitlink.git

Open the frontend in a browser (link).

Upload a .xlsx file containing ingredient data.

The server will process the file and send real-time results.

📌 Expected Response (WebSocket)

Once processing is done, the client will receive:

{
  "recipe_name": "Product Name",
  "allergens": ["Milk", "Nuts"],
  "flagged_ingredients": { "Milk": ["Lactose"] },
  "unrecognized_ingredients": ["Xylooligosaccharide"],
  "message": "Processed successfully."
}

Troubleshooting

❌ Error: Error.capturesStackTrace is not a function

Solution: Use this fixed appError.js:

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
module.exports = AppError;

❌ Invalid File Type Error

Ensure the uploaded file is an .xlsx file.

License

MIT License © 2025