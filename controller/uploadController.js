const processExcelFile = require("../utils/processExcelFile");
let client = new Map();

const uploadHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = req.file.path;
  const clientId = req.body.clientId;
  if (!clientId) {
    return res.status(400).json({ error: "No clientId provided" });
  }
  const clientsId = client.get(clientId);
  processExcelFile(filePath, clientsId);
  res.json({ status: "success" });
};

module.exports = { uploadHandler, client };
