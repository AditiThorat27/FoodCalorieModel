Food Recognition and Calorie Estimation App
An AI-powered system that identifies food from an image, estimates its depth/volume, calculates weight, and predicts calories using YOLO, MiDaS, and a Nutrition API.

📸 Overview
This project uses Computer Vision + Depth Estimation + Nutrition APIs to calculate the approximate calorie value of food from a single photo.

The system pipeline includes:
1. YOLOv8 Segmentation – Detects/segments the food item
2. MiDaS Depth Estimation – Estimates depth from a single RGB image
3. Volume/Weight Estimation – Converts depth & area into weight
4. Nutrition API (Gemini / alternatives) – Fetches calories per gram
5. Final Output – Total calories + detected food label

Features
✔ Food Detection
✔ Segmentation
✔ Depth Estimation
✔ Weight Prediction
✔ Calorie Calculation
✔ API Integration
✔ Modular Pipeline
✔ Backend-ready (FastAPI compatibility)

Architecture Pipeline
 Image
   ↓
 YOLOv8 Segmentation
   ↓
 MiDaS Depth Estimation
   ↓
 Volume Estimation
   ↓
 Weight Estimation (grams)
   ↓
 Nutrition API (Gemini)
   ↓
 Calorie Output

## 🧰 Tech Stack
### AI Models:
- YOLOv8 (Segmentation)
- MiDaS (Depth Estimation)


Backend
-> FastAPI (planned)

APIs
-> Google Gemini API (Nutrition Lookup)
-> Optional: Nutritionix / USDA / Edamam

Languages
-> Python
-> (Future) Kotlin/Java for Mobile App

Folder Structure
FoodCalorieModel/
│
├── yolo/
│   ├── YOLO_seg_training_initial.ipynb
│   └── YOLO_seg_training_continued.ipynb
│
├── midas/
│   └── midas_integration.ipynb
│
├── backend/
│   └── (FastAPI code will go here)
│
├── pipeline/
│   └── predictor.py (pipeline logic)
│
├── README.md
└── requirements.txt

Model Training Summary
Dataset Source
We used a public dataset from Roboflow, containing food images with bounding box annotations only.

YOLOv8 segmentation
Trained across two Google Colab accounts (GPU time limits)
Best model saved as best.pt

### 🔗 Model Weights  
Download the trained YOLOv8 model here:  
👉 **[best.pt Download Link](https://drive.google.com/file/d/1eRnUSGVj9xiSJZSr794MtQkXia6iu2X6/view?usp=sharing)**  

🚀 How to Run Prediction (Placeholder)
from pipeline.predictor import process_image

result = process_image("food.jpg")
print(result)

🧩 Work in Progress
Full pipeline integration
Backend (FastAPI)
App UI
Final calorie calculation logic

👥 Team Members
Advit Sonawane
Ankit Vyavahare
Aditi Thorat
Prisha Sus

📌 Future Scope
Improved depth estimation
More accurate density mapping

Multiple-food calorie estimation

Nutrient breakdown (carbs, fats, proteins)
