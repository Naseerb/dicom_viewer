const { spawn } = require('child_process');
const path = require('path');


const processFile = (file) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../uploads', file.filename);
    console.log("Processing file:", filePath);
    const pythonProcess = spawn('python3', ['python/process_dicom.py', filePath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error("Python stderr:", data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process for ${file.filename} exited with code ${code}`);
      if (code !== 0) {
        return reject(errorOutput || `Process exited with code ${code}`);
      }
      try {
        const data = JSON.parse(output);
        data.fileName = file.originalname;
        resolve(data);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.toString());
        reject(parseError.toString());
      }
    });
  });
};

// Controller function to handle multiple file uploads
const uploadDicom = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    // Process each uploaded file concurrently
    const processingPromises = req.files.map(file => processFile(file));
    const results = await Promise.all(processingPromises);
    
    // Return an object with a results array
    res.status(201).json({ results });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: error.toString() });
  }
};

module.exports = { uploadDicom };
