const express = require("express");
const multer = require("multer");
const processExcelFile = require("./utils/processExcelFile");

const app = express();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const result = await processExcelFile(req.file.path);
  res.json(result);
});

app.listen(3000, () => console.log("Server running on port 3000"));
