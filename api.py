from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import json
from PIL import Image
import io
import os
from fastapi.staticfiles import StaticFiles
import onnxruntime as ort
import numpy as np

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model Setup
MODEL_PATH = "model.onnx"
MODEL_URL = os.getenv("MODEL_URL")
providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']  # GPU if available, else CPU


# Download model if missing
if MODEL_URL and not os.path.exists(MODEL_PATH):
    import gdown
    try:
        print(f"Downloading model from {MODEL_URL}")
        gdown.download(MODEL_URL, MODEL_PATH, fuzzy=True)
    except Exception as e:
        print("Download failed:", e)


# Preprocessing for ONNX
def preprocess_image(pil_image, image_size=224):
    """Preprocess PIL image to numpy array for ONNX"""
    # Resize and center crop
    pil_image = pil_image.resize((int(image_size / 0.875), int(image_size / 0.875)))
    
    # Center crop
    width, height = pil_image.size
    left = (width - image_size) / 2
    top = (height - image_size) / 2
    right = (width + image_size) / 2
    bottom = (height + image_size) / 2
    pil_image = pil_image.crop((left, top, right, bottom))
    
    # Convert to numpy array and normalize
    img_array = np.array(pil_image).astype(np.float32) / 255.0
    
    # Normalize with ImageNet stats
    mean = np.array([0.48145466, 0.4578275, 0.40821073])
    std = np.array([0.26862954, 0.26130258, 0.27577711])
    img_array = (img_array - mean) / std
    
    # Change from HWC to CHW format
    img_array = np.transpose(img_array, (2, 0, 1))
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# Load ONNX model
session = None
try:
    if os.path.exists(MODEL_PATH):
        session = ort.InferenceSession(MODEL_PATH, providers=providers)
        print(f"✅ ONNX model loaded successfully")
        print(f"   Providers: {session.get_providers()}")
        print(f"   Input shape: {session.get_inputs()[0].shape}")
    else:
        print(f"⚠️  Model not found at {MODEL_PATH}")
except Exception as e:
    print(f"❌ Model failed to load: {e}")
    session = None


@app.get("/api/health")
def health():
    return {
        "status": "ok", 
        "model_loaded": session is not None,
        "providers": session.get_providers() if session else []
    }


@app.post("/api/analyze")
async def analyze_bin(image: UploadFile = File(...), bin_data: str = Form(...)):
    try:
        info = json.loads(bin_data)

        # Image → Numpy array
        img_bytes = await image.read()
        pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_array = preprocess_image(pil)

        # Run ONNX inference
        if session:
            input_name = session.get_inputs()[0].name
            output = session.run(None, {input_name: img_array})
            predictions = output[0]  # Get first output
            
            # TODO: Use predictions to score products
            # For now, using placeholder scores
            results = []
            for asin, pdata in info.get("BIN_FCSKU_DATA", {}).items():
                results.append({
                    "asin": asin,
                    "product": pdata.get("normalizedName", pdata.get("name")),
                    "quantity": pdata.get("quantity"),
                    "score": 0   # TODO: calculate from predictions
                })
            results.sort(key=lambda x: x["score"], reverse=True)
        else:
            return {"error": "Model not loaded"}

        return {
            "results": results[:10],
            "expected_quantity": info.get("EXPECTED_QUANTITY")
        }

    except Exception as e:
        return {"error": str(e)}


# ⚡ Serve FRONTEND correctly on Render
# Render project root: /opt/render/project/src/
frontend_path = os.path.join(os.path.dirname(__file__), "dashboard")

# If dashboard folder exists, mount it
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print("WARNING: dashboard folder not found:", frontend_path)


# Run local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
