const WebSocket = require("ws");
const { client } = require("./controller/uploadController");

module.exports = function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
      const clientId = Math.random().toString(36).substring(2, 9);
    console.log("New client connected. Client ID:", clientId);

    client.set(clientId, ws);
    ws.send(JSON.stringify({ type: "connected", clientId }));

    ws.on("close", () => {
      console.log("Client disconnected");
      client.delete(clientId);
    });
  });
};
