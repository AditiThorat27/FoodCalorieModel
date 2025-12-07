# Calories Pro - AI-Powered Food Tracking App

Calories Pro is a comprehensive food tracking application that leverages the power of Artificial Intelligence to simplify calorie counting. By simply taking a photo of your meal, the app uses Google's Gemini API to analyze the food items and estimate their calorie content. It features a robust backend, a user-friendly mobile interface, and offline capabilities.

## 🚀 Features

*   **AI Food Analysis**: Snap a photo of your meal, and the app identifies food items and estimates calories using Google Gemini AI.
*   **User Authentication**: Secure registration and login system using JWT and bcrypt.
*   **Profile Management**: Manage your personal details, including age, gender, height, and weight, to calculate daily calorie goals (Mifflin-St Jeor formula).
*   **Dashboard**: Visualize your daily calorie intake with interactive charts.
*   **Offline Mode**: Log meals even without an internet connection. Data is stored locally using SQLite and synced when online.
*   **Data Sync**: Seamlessly sync your local data with the cloud (MongoDB) to keep your records up-to-date across devices.
*   **History**: View a detailed log of your past meals and nutritional information.

## 🛠 Tech Stack

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs
*   **AI Service**: Google Generative AI (Gemini)
*   **File Handling**: Multer (for image processing)
*   **Environment**: dotenv

### Mobile App
*   **Framework**: React Native (via Expo)
*   **Navigation**: React Navigation (Stack & Bottom Tabs)
*   **State Management**: React Query (TanStack Query)
*   **Local Database**: Expo SQLite
*   **Networking**: Axios
*   **UI Components**: React Native SVG, React Native Chart Kit, Lottie Animations
*   **Device Features**: Expo Camera, Expo Image Picker, Expo Secure Store

## 📂 Project Structure

```
calories_pro/
├── backend/                # Node.js/Express Backend
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models (User, Meal)
│   ├── routes/             # API routes (Auth, Meals)
│   ├── services/           # External services (Gemini AI)
│   └── server.js           # Entry point
│
├── mobile/                 # React Native/Expo App
│   ├── assets/             # Images and fonts
│   ├── components/         # Reusable UI components
│   ├── constants/          # App constants (Colors, etc.)
│   ├── screens/            # App screens (Home, Camera, Logs, etc.)
│   ├── services/           # API and Database services
│   └── App.js              # Main component
│
└── README.md               # Project Documentation
```

## ⚙️ Setup Instructions

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB Atlas Account (or local MongoDB)
*   Google Gemini API Key
*   Expo Go App (on your mobile device) or Android/iOS Simulator

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and configure the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GEMINI_API_KEY=your_google_gemini_api_key
    PORT=5000
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000`.

### 2. Mobile App Setup

1.  Navigate to the `mobile` directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the API URL:
    *   Open `mobile/services/api.js`.
    *   Update the `BASE_URL` to point to your backend server:
        *   **Android Emulator**: `http://10.0.2.2:5000`
        *   **iOS Simulator**: `http://localhost:5000`
        *   **Physical Device**: `http://<YOUR_PC_IP_ADDRESS>:5000` (Ensure your phone and PC are on the same Wi-Fi network).
4.  Start the Expo app:
    ```bash
    npx expo start
    ```
5.  Scan the QR code with the Expo Go app (Android) or use the Camera app (iOS) to run the application.

## 📡 API Documentation

### Authentication (`/auth`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | `{ email, password, profile: { ... } }` |
| `POST` | `/auth/login` | Login user | `{ email, password }` |
| `GET` | `/auth/me` | Get current user profile | N/A (Requires Token) |
| `PUT` | `/auth/profile` | Update user profile | `{ profile: { ... } }` |
| `POST` | `/auth/change-password` | Change password | `{ currentPassword, newPassword }` |

### Meals (`/meals`)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/meals/analyze` | Analyze food image | `{ imageBase64 }` |
| `POST` | `/meals` | Save a meal log | `{ date, image, foods, totalCalories }` |
| `GET` | `/meals` | Get all meal logs | N/A |

## 📱 Screens

*   **AuthScreen**: Login and Registration.
*   **HomeScreen**: Dashboard showing daily progress and calories.
*   **CameraScreen**: Capture food images for analysis.
*   **ResultScreen**: View AI analysis results and confirm food items.
*   **LogsScreen**: View history of logged meals.
*   **SettingsScreen**: Update profile and app settings.

## 📄 License

This project is licensed under the ISC License.
