import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import gsap from 'gsap';
import SparkleBackground from './SparkleBackground';


const WaveText = ({ text }) => (
  <span className="wave-text" style={{ display: 'inline-block' }}>
    {text.split('').map((char, index) => {
      if (char === ' ') {
        return (
          <span key={index} style={{ display: 'inline-block', width: '0.5em' }}>
            &nbsp;
          </span>
        );
      }
      return (
        <span key={index} style={{ display: 'inline-block', color: '#aaa' }}>
          {char}
        </span>
      );
    })}
  </span>
);


const DicomDropZone = () => {
  const [dicomData, setDicomData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedDicom, setSelectedDicom] = useState(null);
  const titleRef = useRef(null);
  const dropMessageRef = useRef(null);

  useEffect(() => {
    // Animate the title
    gsap.from(titleRef.current, { duration: 1.5, y: -50, opacity: 0, ease: 'power2.out' });
   
    gsap.to('.wave-text span', {
      duration: 0.5,
      color: '#fff',
      repeat: -1,
      yoyo: true,
      stagger: 0.1,
      ease: 'power1.inOut',
    });
  }, []);

  // Handle file drop event
  const handleDrop = async (event) => {
    event.preventDefault();
    setUploading(true);
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('dicomFiles', files[i]);
    }
    try {
      const response = await axios.post('http://localhost:5005/api/upload-dicom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('DICOM Data Response:', response.data);
      // Append new files to the list
      setDicomData(prevData => [...prevData, ...response.data.results]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  // Prevent default drag-over behaviour
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Open preview modal for a selected record
  const handlePreview = (dicom) => {
    setSelectedDicom(dicom);
    setOpenPreview(true);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setOpenPreview(false);
    setSelectedDicom(null);
  };

  // Handle individual file download
  const handleDownload = (fileName) => {
    const downloadUrl = `http://localhost:5005/uploads/${fileName}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete an upload from the UI
  const handleDelete = (index) => {
    setDicomData(prevData => prevData.filter((_, i) => i !== index));
  };
  let waveText = 'Drag and drop DICOM files here (up to 10 at a time)';
  return (
    <Box sx={{ position: 'relative', zIndex: 1, p: 2 }}>
      <SparkleBackground />

      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography ref={titleRef} variant="h3" sx={{ fontWeight: 'bold', color: '#fff' }}>
          DICOM Viewer Full Stack Application
        </Typography>
      </Box>

      {/* Drag and Drop Area */}
      <Paper
        sx={{
          p: 2,
          border: '2px dashed #555',
          textAlign: 'center',
          backgroundColor: '#222',
          color: '#fff',
          mt: 4,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Typography ref={dropMessageRef} variant="h6">
          <WaveText text={waveText}/>
        </Typography>
        {uploading && <Typography variant="body1">Uploading...</Typography>}
      </Paper>

      {/* Table of Uploaded Files */}
      {dicomData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#fff' }}>
            Uploaded DICOM Files
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#333', color: '#fff' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}><strong>Patient Name</strong></TableCell>
                  <TableCell sx={{ color: '#fff' }}><strong>Patient Birth Date</strong></TableCell>
                  <TableCell sx={{ color: '#fff' }}><strong>Series Description</strong></TableCell>
                  <TableCell sx={{ color: '#fff' }}><strong>Preview</strong></TableCell>
                  <TableCell sx={{ color: '#fff' }}><strong>Download</strong></TableCell>
                  <TableCell sx={{ color: '#fff' }}><strong>Delete</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dicomData.map((dicom, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: '#fff' }}>{dicom.metadata?.PatientName || 'N/A'}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{dicom.metadata?.PatientBirthDate || 'N/A'}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{dicom.metadata?.SeriesDescription || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handlePreview(dicom)}>
                        Preview
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => handleDownload(dicom.fileName)}>
                        Download
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="text" color="error" onClick={() => handleDelete(index)}>
                        X
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Preview Modal */}
      <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#222', color: '#fff' }}>
          DICOM File Preview
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#222' }}>
          {selectedDicom && (
            <>
              <DialogContentText sx={{ color: '#fff' }}>
                <strong>Patient Name:</strong> {selectedDicom.metadata?.PatientName || 'N/A'} <br />
                <strong>Patient Birth Date:</strong> {selectedDicom.metadata?.PatientBirthDate || 'N/A'} <br />
                <strong>Series Description:</strong> {selectedDicom.metadata?.SeriesDescription || 'N/A'} <br />
              </DialogContentText>
              {selectedDicom.image && (
                <img
                  src={`data:image/png;base64,${selectedDicom.image}`}
                  alt="DICOM Preview"
                  style={{ width: '100%', marginTop: '16px' }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#222' }}>
          <Button onClick={handleClosePreview} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DicomDropZone;
