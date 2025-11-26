"""
Convert OpenCLIP PyTorch .pth (state_dict) to ONNX
Run this script locally before deploying to Render
"""
import torch
import torch.onnx
import open_clip
import os
import onnx

# Configuration
PTH_MODEL_PATH = "model.pth"  # Your input .pth file
ONNX_MODEL_PATH = "model.onnx"  # Output .onnx file
IMAGE_SIZE = 224
BATCH_SIZE = 1
MODEL_NAME = "ViT-B-32"
PRETRAINED = "openai"

def convert_pth_to_onnx():
    print(f"Loading base OpenCLIP model ({MODEL_NAME})...")
    
    # Create base CLIP architecture
    model, _, preprocess = open_clip.create_model_and_transforms(
        MODEL_NAME, pretrained=PRETRAINED, device="cpu"
    )

    print(f"Loading state_dict from {PTH_MODEL_PATH}...")
    state = torch.load(PTH_MODEL_PATH, map_location="cpu")

    if "model_state_dict" not in state:
        raise ValueError("❌ .pth does NOT contain model_state_dict")

    # Load trained weights
    model.load_state_dict(state["model_state_dict"])
    model.eval()

    # Dummy input for image encoder
    dummy_image = torch.randn(BATCH_SIZE, 3, IMAGE_SIZE, IMAGE_SIZE)

    print("Converting image encoder to ONNX...")
    torch.onnx.export(
        model,
        dummy_image,
        ONNX_MODEL_PATH,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["image"],
        output_names=["image_embedding"],
        dynamic_axes={"image": {0: "batch"}, "image_embedding": {0: "batch"}},
    )

    print(f"✅ Successfully exported ONNX: {ONNX_MODEL_PATH}")
    print(f"ONNX size: {os.path.getsize(ONNX_MODEL_PATH)/1024/1024:.2f} MB")

    # Verify
    print("Verifying ONNX...")
    m = onnx.load(ONNX_MODEL_PATH)
    onnx.checker.check_model(m)
    print("✅ ONNX verified!")

if __name__ == "__main__":
    if not os.path.exists(PTH_MODEL_PATH):
        print(f"❌ Error: {PTH_MODEL_PATH} not found!")
        print("Please place your .pth file in the same directory as this script")
    else:
        convert_pth_to_onnx()
