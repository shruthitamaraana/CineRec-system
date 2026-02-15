from flask import Flask, render_template, request, jsonify
import traceback

# -------------------------------------------------------------------
# 🧠 IMPORT YOUR ML BACKEND HERE
# Replace 'your_ml_module' with the actual name of your Python file
# that contains the recommendation and poster fetching logic.
# -------------------------------------------------------------------
try:
    from recommender import hybrid_recommend, get_movie_poster
except ImportError:
    print("⚠️ WARNING: Could not import ML functions. Using fallback mock data.")
    
    # Fallback mock functions just in case the import fails so the server still runs
    def hybrid_recommend(user_id, movie_name):
        return ["The Dark Knight", "Inception", "Interstellar"]
    def get_movie_poster(movie_title):
        return "https://via.placeholder.com/300x450?text=Poster+Not+Found"


app = Flask(__name__)

# ==========================================
# 🖥️ FRONTEND TEMPLATE ROUTES
# Binding both clean URLs and .html URLs so it works no matter what you type!
# ==========================================

@app.route('/')
@app.route('/index.html')
def home():
    return render_template('index.html')

@app.route('/results')
@app.route('/results.html')
def results():
    return render_template('results.html')

@app.route('/movie_detail')
@app.route('/movie_detail.html')
def movie_detail():
    return render_template('movie_detail.html')

@app.route('/movies')
@app.route('/movies.html')
def movies():
    return render_template('movies.html')

@app.route('/shows')
@app.route('/shows.html')
def shows():
    return render_template('shows.html')

@app.route('/events')
@app.route('/events.html')
def events():
    return render_template('events.html')

@app.route('/my_list')
@app.route('/my_list.html')
def my_list():
    return render_template('my_list.html')

@app.route('/login')
@app.route('/login.html')
def login():
    return render_template('login.html')

@app.route('/signup')
@app.route('/signup.html')
def signup():
    return render_template('signup.html')


# ==========================================
# 🚀 BACKEND ML API ROUTE
# ==========================================

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        movie_name = data.get('movie_name', '').strip()

        if not movie_name:
            return jsonify({"error": "Movie name is required"}), 400

        print(f"🎬 Processing recommendation request -> User: {user_id}, Movie: '{movie_name}'")

        # Call your actual ML Hybrid Recommender function
        recommended_titles = hybrid_recommend(user_id, movie_name)
        
        # Process titles and fetch posters
        recommendations = []
        for title in recommended_titles:
            poster_url = get_movie_poster(title)
            recommendations.append({
                "title": title,
                "poster": poster_url
            })

        print(f"✅ Successfully generated {len(recommendations)} recommendations.")
        return jsonify(recommendations)

    except Exception as e:
        print("❌ Error generating recommendations:")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)