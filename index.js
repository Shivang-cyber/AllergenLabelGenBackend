require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const http = require("http");
const cors = require("cors");

const globalErrorHandler = require("./controller/errorController");
const catchAsync = require("./utils/catchAsync");
const uploadRoutes = require("./routes/uploadRoutes");
const setupWebSocket = require("./webSocket");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/upload", uploadRoutes);

setupWebSocket(server);

app.use(
  "*",
  catchAsync(async (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  })
);

app.use(globalErrorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
