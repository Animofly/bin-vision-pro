"""
Convert PyTorch .pth model to ONNX format
Run this script locally before deploying to Render
"""
import torch
import torch.onnx

# Configuration
PTH_MODEL_PATH = "model.pth"  # Your input .pth file
ONNX_MODEL_PATH = "model.onnx"  # Output .onnx file
IMAGE_SIZE = 224  # Match your model's expected input size
BATCH_SIZE = 1

def convert_pth_to_onnx():
    print(f"Loading PyTorch model from {PTH_MODEL_PATH}...")
    
    try:
        # Try loading as full model first
        model = torch.load(PTH_MODEL_PATH, map_location='cpu')
        if isinstance(model, dict) and 'model_state_dict' in model:
            print("Detected state_dict format")
            # You'll need to define your model architecture here
            raise ValueError(
                "State dict detected. Please modify this script to:\n"
                "1. Define your model architecture\n"
                "2. Load the state dict into it\n"
                "Example:\n"
                "  model = YourModelClass()\n"
                "  model.load_state_dict(model['model_state_dict'])"
            )
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

    model.eval()
    
    # Create dummy input matching your model's expected input
    dummy_input = torch.randn(BATCH_SIZE, 3, IMAGE_SIZE, IMAGE_SIZE)
    
    print("Converting to ONNX format...")
    torch.onnx.export(
        model,
        dummy_input,
        ONNX_MODEL_PATH,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"✅ Successfully converted to {ONNX_MODEL_PATH}")
    print(f"ONNX model size: {os.path.getsize(ONNX_MODEL_PATH) / (1024*1024):.2f} MB")
    
    # Verify the model
    import onnx
    onnx_model = onnx.load(ONNX_MODEL_PATH)
    onnx.checker.check_model(onnx_model)
    print("✅ ONNX model verified successfully")

if __name__ == "__main__":
    import os
    if not os.path.exists(PTH_MODEL_PATH):
        print(f"❌ Error: {PTH_MODEL_PATH} not found!")
        print("Please place your .pth file in the same directory as this script")
    else:
        convert_pth_to_onnx()
