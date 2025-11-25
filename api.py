from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import json
from PIL import Image
from torchvision import transforms
import io
import os
import urllib.request
import gdown
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model
MODEL_PATH = "model.pth"
MODEL_URL = os.getenv("MODEL_URL")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Download model if it doesn't exist and MODEL_URL is provided


if not os.path.exists(MODEL_PATH) and MODEL_URL:
    print(f"Downloading model from {MODEL_URL}...")
    try:
        gdown.download(MODEL_URL, MODEL_PATH, fuzzy=True)
        print("Model downloaded successfully")
    except Exception as e:
        print(f"Error downloading model: {e}")


# Build preprocessing pipeline
def build_preprocess(image_size=224):
    return transforms.Compose([
        transforms.Resize(int(image_size / 0.875)),
        transforms.CenterCrop(image_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=(0.48145466, 0.4578275, 0.40821073),
            std=(0.26862954, 0.26130258, 0.27577711),
        ),
    ])

preprocess = build_preprocess()

try:
    model = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    model.eval()
    print(f"Model loaded successfully on {device}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def root():
    return {"status": "API is running", "model_loaded": model is not None}

@app.post("/analyze")
async def analyze_bin(
    image: UploadFile = File(...),
    bin_data: str = Form(...)
):
    try:
        # Parse bin data
        bin_info = json.loads(bin_data)
        
        # Read and process image
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess image for model
        image_tensor = preprocess(pil_image).unsqueeze(0).to(device)
        
        # TODO: Add your model inference logic here
        # This is a placeholder - replace with your actual model inference
        
        # Example structure of what you should return:
        results = []
        
        for asin, product_data in bin_info.get("BIN_FCSKU_DATA", {}).items():
            # Run your model inference here
            # For now, returning mock data - replace with actual model output
            score = 0.0  # Replace with actual similarity score from model
            
            results.append({
                "asin": asin,
                "product": product_data.get("normalizedName", product_data.get("name")),
                "quantity": product_data.get("quantity"),
                "score": score
            })
        
        # Sort by score (highest first)
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "results": results[:10],  # Return top 10
            "expected_quantity": bin_info.get("EXPECTED_QUANTITY")
        }
        
    except Exception as e:
        return {"error": str(e)}, 500
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../dashboard", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
