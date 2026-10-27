const multer = require('multer');
const path = require('path');
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.png', '.jpg', '.jpeg'];

  if (!allowed.includes(ext)) {
    const err = new Error('only images allowed: .png, .jpg, .jpeg');
    err.status = 400;
    return cb(err, false);
  }
  cb(null, true);
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const MB = 1024 * 1024;
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * MB },
});

module.exports = { upload };