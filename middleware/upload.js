const multer = require("multer");

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

module.exports = upload;