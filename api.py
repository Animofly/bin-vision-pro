from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import json
from PIL import Image
import io

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model (update the path to your .pth file)
MODEL_PATH = "model.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

try:
    model = torch.load(MODEL_PATH, map_location=device)
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
        
        # TODO: Add your preprocessing and model inference logic here
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
