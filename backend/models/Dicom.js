
const mongoose = require('mongoose');

const dicomSchema = new mongoose.Schema({
  PatientName: String,
  PatientBirthDate: String,
  SeriesDescription: String,
  image: String,    
  metadata: Object, 
});

module.exports = mongoose.model('Dicom', dicomSchema);
