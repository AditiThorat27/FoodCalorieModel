"""
Main pipeline for food detection, depth estimation, and calorie prediction.

Modules:
- YOLOv8 Segmentation (Ultralytics)
- MiDaS Depth Estimation (Intel ISL)
- Gemini API (Nutrition)
This file will be called by FastAPI backend to run inference.
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
import requests
import base64

# ---------------------------------------------------------
# 1. LOAD MODELS (YOLO + MiDaS)
# ---------------------------------------------------------

print("[Pipeline] Loading YOLOv8 segmentation model...")
# Replace this path with actual location of your best.pt later
yolo_model = YOLO("path/to/best.pt")

print("[Pipeline] Loading MiDaS depth model...")
midas_model = torch.hub.load("intel-isl/MiDaS", "MiDaS_small")
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms").small_transform

# ---------------------------------------------------------
# 2. YOLO PREDICTION
# ---------------------------------------------------------

def run_yolo(image):
    """Runs YOLOv8 on image and returns detection + segmentation result."""
    results = yolo_model(image)
    return results[0]  # First prediction object


# ---------------------------------------------------------
# 3. MiDaS DEPTH ESTIMATION
# ---------------------------------------------------------

def run_depth(image):
    """Runs MiDaS depth estimation on image."""
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    input_tensor = midas_transforms(img_rgb).to("cpu")

    with torch.no_grad():
        depth = midas_model(input_tensor)
        depth = torch.nn.functional.interpolate(
            depth.unsqueeze(1),
            size=img_rgb.shape[:2],
            mode="bicubic",
            align_corners=False
        ).squeeze().cpu().numpy()

    return depth


# ---------------------------------------------------------
# 4. WEIGHT ESTIMATION (placeholder)
# ---------------------------------------------------------

def estimate_weight(mask, depth_map):
    """
    Estimate weight of the food using mask area + depth map.
    This is a placeholder until backend finalizes calculation logic.
    """
    return 100  # return dummy value (grams)


# ---------------------------------------------------------
# 5. GEMINI NUTRITION API (placeholder)
# ---------------------------------------------------------

def fetch_calories_from_gemini(food_name, weight_grams):
    """
    Calls Gemini API to fetch nutrition info.
    Placeholder for now.
    """
    return {
        "food_name": food_name,
        "calories": weight_grams * 1.5  # dummy calculation
    }


# ---------------------------------------------------------
# 6. MAIN PIPELINE FUNCTION
# ---------------------------------------------------------

def process_image(image_path):
    """
    Main function called by FastAPI.
    Steps:
      1. YOLO detection + segmentation
      2. Depth estimation
      3. Weight estimation
      4. Nutrition estimation
    """

    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Image not found"}

    # 1. YOLO predictions
    yolo_res = run_yolo(image)

    if len(yolo_res.boxes) == 0:
        return {"error": "No food detected"}

    cls_id = int(yolo_res.boxes.cls[0])
    food_name = yolo_model.names[cls_id]

    # 2. Extract the mask of the first detected object
    mask = yolo_res.masks.data[0].cpu().numpy()

    # 3. Depth estimation
    depth_map = run_depth(image)

    # 4. Weight estimation
    weight = estimate_weight(mask, depth_map)

    # 5. Nutrition estimation
    nutrition = fetch_calories_from_gemini(food_name, weight)

    # Final output
    return {
        "food_name": food_name,
        "weight_estimated_g": weight,
        "nutrition": nutrition
    }


# ---------------------------------------------------------
# 7. LOCAL TESTING
# ---------------------------------------------------------

if __name__ == "__main__":
    output = process_image("sample.jpg")
    print(output)

