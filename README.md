# 🎬 CineRec | AI-Powered Hybrid Movie Recommendation Engine

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-Web%20Framework-lightgrey.svg)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Hybrid%20Filtering-orange.svg)
![TMDb API](https://img.shields.io/badge/API-TMDb-green.svg)

**CineRec** is a full-stack machine learning web application designed to help users discover their next favorite movie. By combining deep content analysis with collaborative filtering, CineRec breaks the "echo chamber" of traditional streaming algorithms to deliver highly accurate, personalized movie recommendations.

🌍 **Live Demo:** [Click here to view the live site](https://cinerec-system.onrender.com) 

---

## ✨ Key Features

* **Hybrid AI Algorithm:** Merges Content-Based Filtering (TF-IDF vectorization & Cosine Similarity) with Collaborative Filtering to eliminate the "cold start" problem.
* **Live Metadata Integration:** Fetches real-time movie posters, release dates, and synopses directly from the **TMDb API**.
* **Trailers & Streaming Links:** Automatically pulls official YouTube trailers and localized OTT streaming platforms (Netflix, Prime, Hotstar) using JustWatch data.
* **Dynamic "My List":** A built-in watchlist feature utilizing local browser storage, allowing users to save and remove movies effortlessly without needing a database.
* **Modern Vanilla UI:** A sleek, responsive, and blazing-fast frontend built entirely with HTML5, CSS3, and Vanilla JavaScript—no heavy frontend frameworks required.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Python, Flask, Gunicorn
* **Machine Learning:** Scikit-learn, Pandas, NumPy
* **External APIs:** The Movie Database (TMDb) API

---

## 🚀 How It Works

1.  **Content Analysis:** The engine processes natural language by generating TF-IDF vectors for movie metadata, genres, and plot descriptions to understand the "DNA" of a film.
2.  **Collaborative Filtering:** The algorithm maps complex user rating matrices to find hidden patterns among audiences with similar cinematic tastes.
3.  **Hybrid Scoring:** Both models are intelligently weighted and merged to calculate a final similarity score, delivering the top recommendations to the frontend interface.

---

## 💻 Local Setup & Installation

Want to run CineRec on your own machine? Follow these steps:

### Prerequisites
* Python 3.8 or higher installed on your system.
* Git installed.
* A free API key from [The Movie Database (TMDb)](https://www.themoviedb.org/settings/api).

### Step-by-Step Installation

**1. Clone the repository**
```bash
git clone [https://github.com/shruthitamaraana/CineRec-system](https://github.com/shruthitamaraana/CineRec-system)
cd CineRec
```
2. Create and activate a virtual environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```
Mac/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```
3. Install backend dependencies

```bash
pip install -r requirements.txt
```
4. Add your TMDb API Key
```bash
Open static/script.js in your code editor. Locate the TMDB_API_KEY variable and replace the placeholder with your actual API key:

JavaScript
const TMDB_API_KEY = 'your_actual_api_key_here';
```

5. Add the ML Datasets/Models
(Note: If your .pkl model files or movies.csv datasets were ignored by .gitignore due to size, ensure you place them in the root directory of the project before running).

6. Run the application

```bash
python app.py
```
7. View in Browser
Open your web browser and navigate to:
http://127.0.0.1:5000

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

📝 License
This project is open-source and available under the MIT License.
