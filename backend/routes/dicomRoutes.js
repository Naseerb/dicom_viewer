const express = require('express');
const multer = require('multer');
const path = require('path');
const dicomController = require('../controllers/dicomController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Updated to accept multiple files (up to 10) using the key 'dicomFiles'
router.post('/upload-dicom', upload.array('dicomFiles', 10), dicomController.uploadDicom);

module.exports = router;
