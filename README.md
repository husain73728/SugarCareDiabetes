# 🩺 SugarCareDiabetes

An AI-powered healthcare platform for diabetes prediction, prevention, and personalized management.

---

## 🚀 Overview

SugarCareDiabetes is a web-based platform designed to assist users in understanding their diabetes risk and managing their health effectively. The system integrates machine learning with an interactive user interface to provide predictions, lifestyle recommendations, and healthcare support in one place.

---

## ✨ Features

* 🔍 **Diabetes Risk Prediction**
  Predicts the likelihood of diabetes based on medical inputs using a trained ML model.

* 🥗 **Personalized Diet Plans**
  Suggests diet recommendations tailored to user needs.

* 🏃 **Exercise & Fitness Guidance**
  Provides structured exercise routines suitable for diabetes management.

* 👨‍⚕️ **Doctor Consultation Interface**
  Displays verified doctors for consultation.

* 💊 **Pharmaceutical Support**
  Shows medicines with options like “Buy Now” and “Add to Cart”.

* 🤖 **AI Chatbot**
  Interactive chatbot for user queries and assistance.

* 🌐 **Multilingual Accessibility**
  Supports broader accessibility through language options.

---

## 🧠 Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Machine Learning:** Diabetes prediction model (JSON-based integration)
* **Backend (Optional):** Supabase Auth + Postgres (Google OAuth, profile and prediction history sync)
* **Tools:** Browser-based execution / Local server

---

## 📂 Project Structure

```
assets/                # UI images and static assets
src/                   # Core scripts and logic
diabetes_data/         # Dataset (optional / local use)
ml_notebook/           # Model development notebooks
index.html             # Landing page
about.html             # About section
features.html          # Features overview
prediction.html        # Diabetes prediction interface
diet.html              # Diet recommendations
exercise.html          # Exercise plans
consult.html           # Doctor consultation
medicines.html         # Pharmaceutical section
pricing.html           # Subscription plans
profile.html           # User profile/dashboard
chatbot.js             # Chatbot logic
page-transitions.js    # UI transitions
diabetes_model.json    # Trained ML model
run_local_server.bat   # Local server runner
```

---

## ▶️ How to Run the Project

### Option 1: Run Locally

1. Clone the repository:

```
git clone https://github.com/husain73728/SugarCareDiabetes.git
```

2. Navigate to the folder:

```
cd SugarCareDiabetes
```

3. Run the local server:

```
run_local_server.bat
```

---

## 🔐 Supabase Setup (Login + Synced Data)

Use this setup to enable Google login and cloud storage for profile + prediction history.

1. Create a Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
3. In Supabase dashboard, enable Google provider under Authentication > Providers.
4. Add redirect URLs:

```
http://localhost:8000/profile.html
https://your-domain/profile.html
```

5. Open [index.html](index.html), [prediction.html](prediction.html), and [profile.html](profile.html), then set:

```html
<script>
  window.SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
  };
</script>
```

6. Keep using the anon key only in frontend. Never expose the Supabase service role key.

### Current behavior

* Signed-in users: prediction history is stored in Supabase.
* Signed-out users: prediction history uses local browser storage.
* Profile page automatically reads Supabase history when signed in and local history when signed out.

---

### Option 2: Direct Run

Simply open:

```
index.html
```

in your browser.

---

## 📸 Preview

*Add screenshots here for better visualization*

Example:

```
![Home Page](assets/home.png)
![Prediction Page](assets/prediction.png)
```

---

## 🎯 Objective

To provide an accessible, AI-driven solution that helps users:

* Predict diabetes risk
* Prevent complications through lifestyle changes
* Access healthcare resources easily

---

## 💡 Future Improvements

* 📊 Progress tracking dashboard with graphs
* 🌐 Backend integration (API-based model serving)
* 🤖 Advanced chatbot with LLM integration
* 📱 Mobile responsiveness improvements

---

## 👨‍💻 Contributors

* Husain
* Team Members

---

## 📌 Note

This project was developed as part of a hackathon and is intended for educational and demonstration purposes.

---
