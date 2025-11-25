from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import json
from PIL import Image
from torchvision import transforms
import io
import os
from fastapi.staticfiles import StaticFiles

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
MODEL_PATH = "model.pth"
MODEL_URL = os.getenv("MODEL_URL")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# Download model if missing
if MODEL_URL and not os.path.exists(MODEL_PATH):
    import gdown
    try:
        print(f"Downloading model from {MODEL_URL}")
        gdown.download(MODEL_URL, MODEL_PATH, fuzzy=True)
    except Exception as e:
        print("Download failed:", e)


# Preprocessing
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

# Load model
try:
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model = checkpoint["model_state_dict"]  # if saved as state_dict
    print("Model loaded successfully")
except:
    try:
        model = torch.load(MODEL_PATH, map_location=device)
        print("Model loaded (full model)")
    except Exception as e:
        print("Model failed to load:", e)
        model = None


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/api/analyze")
async def analyze_bin(image: UploadFile = File(...), bin_data: str = Form(...)):
    try:
        info = json.loads(bin_data)

        # Image → Tensor
        img_bytes = await image.read()
        pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_tensor = preprocess(pil).unsqueeze(0).to(device)

        # TODO — actual inference
        # --------------------------
        results = []
        for asin, pdata in info.get("BIN_FCSKU_DATA", {}).items():
            results.append({
                "asin": asin,
                "product": pdata.get("normalizedName", pdata.get("name")),
                "quantity": pdata.get("quantity"),
                "score": 0   # placeholder
            })
        results.sort(key=lambda x: x["score"], reverse=True)
        # --------------------------

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
