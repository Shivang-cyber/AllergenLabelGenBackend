const multer = require("multer");
const AppError = require("../utils/appError");
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return cb(new AppError("Invalid file type", 400));
    }
    cb(null, true);
  },
});

module.exports = upload;