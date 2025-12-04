"""
main.py
---------
FastAPI backend for the Food Recognition and Calorie Estimation System.

This API receives an uploaded food image, runs it through the AI pipeline
(YOLOv8 segmentation + MiDaS depth estimation), estimates volume/weight,
and returns predicted calories using the nutrition model.

Exposed Endpoints:
    GET  /        → Health check (tests if backend is running)
    POST /predict → Accepts an image, runs pipeline, returns results

This file acts as the main entry point for the entire backend server.
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from pipeline.predictor import process_image

# ---------------------------------------------------------
# Initialize App
# ---------------------------------------------------------

app = FastAPI(
    title="Food Calorie Estimation Backend",
    description="AI backend using YOLO + MiDaS + Nutrition API",
    version="1.0.0"
)

# Allow mobile app / frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp folder for uploaded images
os.makedirs("temp", exist_ok=True)


# ---------------------------------------------------------
# ROUTES / ENDPOINTS
# ---------------------------------------------------------

@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "Backend is running!", "version": "1.0.0"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Main endpoint for calorie prediction.
    Steps:
        1. Save uploaded image
        2. Run YOLO + MiDaS pipeline
        3. Return food name, weight, and calorie estimate
    """

    # Save image temporarily
    file_bytes = await file.read()
    temp_path = f"temp/{file.filename}"

    with open(temp_path, "wb") as f:
        f.write(file_bytes)

    # Run prediction pipeline
    result = process_image(temp_path)

    return {
        "filename": file.filename,
        "result": result
    }

