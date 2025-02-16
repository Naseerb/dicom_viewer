# DICOM Viewer Full Stack Application

A full stack application that allows users to upload, process, and view DICOM files. A preview video that shows the application running can be found in the root folder

## Features

- **Multiple File Upload:**  
  Drag-and-drop interface for uploading one or more DICOM files.

- **DICOM Processing:**  
  A Python script (using pydicom, Pillow, and NumPy) extracts metadata and image data from DICOM files.

- **Data Storage:**  
  Processed data is stored in MongoDB for efficient querying and retrieval.

- **Flexible API:**  
  Express with GraphQL is used to query and manage stored data.

- **Modern UI:**  
  A React frontend using Material-UI with subtle GSAP animations and a dynamic sparkle background.

## Build & Run with Docker

1. **Prerequisites:**  
   Make sure [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) are installed.

2. **Build and Run:**  
   From the project root, run:

   ```bash
   docker-compose up --build
