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

        # Helper function to safely extract and clean DICOM attributes
        def clean_dicom_value(value):
            if isinstance(value, (pydicom.valuerep.PersonName, str)):
                return str(value)
            elif isinstance(value, bytes):
                # Try to decode bytes, excluding null bytes
                try:
                    return value.decode('utf-8', 'ignore').strip()
                except:
                    return None
            elif isinstance(value, (pydicom.sequence.Sequence)):
                return [clean_dicom_dataset(item) for item in value]
            elif isinstance(value, (pydicom.dataset.Dataset)):
                return clean_dicom_dataset(value)
            elif isinstance(value, (np.ndarray)):
                return value.tolist()
            elif isinstance(value, (float, int, bool)):
                return value
            return str(value)

        def clean_dicom_dataset(dataset):
            cleaned_data = {}
            for elem in dataset:
                if elem.tag != (0x7FE0, 0x0010):  # Skip pixel data
                    if hasattr(elem, 'name') and elem.name:
                        key = elem.name
                    else:
                        key = f"{elem.tag}"
                    
                    if elem.VM > 1:
                        cleaned_data[key] = [clean_dicom_value(x) for x in elem.value]
                    else:
                        cleaned_data[key] = clean_dicom_value(elem.value)
            return cleaned_data

        # Extract all metadata
        metadata = clean_dicom_dataset(dicom)

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

        return json.dumps(output, default=str)

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    print(dicom_to_json(file_path))