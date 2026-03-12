const multer = require('multer');
const path = require('path');

// Store in memory for streaming parse (files up to 100MB)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.txt', '.zip'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos CSV e TXT de DNA são aceitos.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = upload;
