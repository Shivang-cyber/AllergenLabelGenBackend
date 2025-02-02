const express = require("express");
const upload = require("../middleware/upload");
const { uploadHandler } = require("../controller/uploadController");

const router = express.Router();

router.post("/", upload.single("file"), uploadHandler);

module.exports = router;
