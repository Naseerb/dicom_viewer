import sys
import json
import pydicom
from pydicom.pixel_data_handlers.util import apply_modality_lut
import base64
from PIL import Image
import numpy as np
from io import BytesIO  

def dicom_to_json(file_path):
    try:
        # Read the DICOM file
        dicom = pydicom.dcmread(file_path)

        # Helper function to safely extract DICOM attributes
        def get_dicom_attr(attr):
            value = dicom.get(attr, "Unknown")
            return str(value) if isinstance(value, (pydicom.valuerep.PersonName, str)) else value

        # Extract metadata
        metadata = {
            "PatientName": get_dicom_attr("PatientName"),
            "PatientBirthDate": get_dicom_attr("PatientBirthDate"),
            "SeriesDescription": get_dicom_attr("SeriesDescription"),
        }

        # Extract pixel data and convert it to an image
        if hasattr(dicom, "PixelData"):
            pixel_array = apply_modality_lut(dicom.pixel_array, dicom)
            image = Image.fromarray((pixel_array / np.max(pixel_array) * 255).astype(np.uint8))
            
            # Convert image to base64
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            image_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        else:
            image_base64 = None

        # Construct JSON output
        output = {
            "metadata": metadata,
            "image": image_base64,
        }

        return json.dumps(output)

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    print(dicom_to_json(file_path))
