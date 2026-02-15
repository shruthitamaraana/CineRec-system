import pandas as pd
import difflib
import requests
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer


# ==============================
# LOAD DATASETS
# ==============================

movies_data = pd.read_csv("movie.csv")     # your content dataset
ratings_data = pd.read_csv("ratings.csv") # movielens ratings
movielens_movies = pd.read_csv("movies1.csv") # movielens movieId mapping

# mapping title -> movieId
title_to_movieId = dict(zip(movielens_movies['title'], movielens_movies['movieId']))


# ==============================
# CONTENT BASED MODEL
# ==============================

selected_features = ['genres','keywords','tagline','cast','director']

for feature in selected_features:
    movies_data[feature] = movies_data[feature].fillna('')

combined_features = (
    movies_data['genres']+' '+
    movies_data['keywords']+' '+
    movies_data['tagline']+' '+
    movies_data['cast']+' '+
    movies_data['director']
)

vectorizer = TfidfVectorizer()
feature_vectors = vectorizer.fit_transform(combined_features)

similarity = cosine_similarity(feature_vectors)


def content_recommend(movie_name):

    list_of_all_titles = movies_data['title'].tolist()

    find_close_match = difflib.get_close_matches(movie_name, list_of_all_titles)

    close_match = find_close_match[0]

    index_of_the_movie = movies_data[movies_data.title == close_match]['index'].values[0]

    similarity_score = list(enumerate(similarity[index_of_the_movie]))

    sorted_similar_movies = sorted(similarity_score, key=lambda x: x[1], reverse=True)

    return sorted_similar_movies


# ==============================
# COLLABORATIVE FILTERING
# ==============================

user_movie_matrix = ratings_data.pivot_table(
    index='userId',
    columns='movieId',
    values='rating'
).fillna(0)

user_similarity = cosine_similarity(user_movie_matrix)

user_similarity_df = pd.DataFrame(
    user_similarity,
    index=user_movie_matrix.index,
    columns=user_movie_matrix.index
)


def collaborative_recommend(user_id, top_n=50):

    similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:6].index

    recommended_movies = user_movie_matrix.loc[similar_users].mean().sort_values(ascending=False)

    return recommended_movies.head(top_n)


# ==============================
# HYBRID RECOMMEND
# ==============================

def hybrid_recommend(user_id, movie_name, top_n=10):

    content_results = content_recommend(movie_name)

    if user_id not in user_movie_matrix.index:
        collab_scores = pd.Series(dtype=float)
    else:
        collab_scores = collaborative_recommend(user_id)

    content_rank = {movie[0]: rank for rank, movie in enumerate(content_results)}
    collab_rank = {}

    if not collab_scores.empty:
        collab_rank = {mid: rank for rank, mid in enumerate(collab_scores.index)}

    hybrid_scores = []

    for movie in content_results:

        index = movie[0]
        title = movies_data.iloc[index]['title']

        if movie_name.lower() in title.lower():
            continue

        if title in title_to_movieId:
            movie_id = title_to_movieId[title]
            colr = collab_rank.get(movie_id, 1000)
        else:
            colr = 1000

        cr = content_rank.get(index, 1000)

        final_score = (1/(cr+1)) + (1/(colr+1))

        hybrid_scores.append((index, final_score))

    hybrid_scores = sorted(hybrid_scores, key=lambda x: x[1], reverse=True)

    recommendations = []

    for movie in hybrid_scores[:top_n]:
        title = movies_data.iloc[movie[0]]['title']
        recommendations.append(title)

    return recommendations


# ==============================
# TMDB POSTER API
# ==============================

TMDB_API_KEY = "7bb05e9adc89c4384540a216524e9644"

def get_movie_poster(title):

    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"

    try:
        response = requests.get(url).json()

        # DEBUG (optional – helps once)
        # print(response)

        if isinstance(response, dict) and "results" in response:
            if len(response["results"]) > 0:
                poster_path = response["results"][0].get("poster_path")
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"

    except Exception as e:
        print("TMDB Error:", e)

    return None

