require("dotenv").config({ path: `${process.cwd()}/.env` });
const express = require("express");
const globalErrorHandler = require("./controller/errorController");
const catchAsync = require("./utils/catchAsync");
const upload = require("./middleware/upload");
const {uploadHandler, client} = require("./controller/uploadController");
const WebSocket = require('ws');
const http = require('http');
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.get("/", (req, res) => {
  res.send("Hello World!");
});

wss.on('connection', (ws) => {
  console.log('New client connected');

  const clientId = Math.random().toString(36).substring(2,9);
  client.set(clientId, ws);
  ws.send(JSON.stringify({ type: "connected" ,clientId }));

  ws.on('close', () => {
    console.log('Client disconnected');
    client.delete(clientId);
  });
});

app.post("/upload", upload.single("file"), uploadHandler);

app.use(
  "*",
  catchAsync(async (req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  })
);

app.use(globalErrorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;