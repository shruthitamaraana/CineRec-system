document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // GLOBAL AUTHENTICATION CHECK
    // ==========================================
    const isLoggedIn = localStorage.getItem('cineRecUser') === 'true';
    const navAuth = document.querySelector('.nav-auth');
    
    if (isLoggedIn && navAuth) {
        navAuth.innerHTML = `<a href="#" id="logoutBtn" class="btn-login" style="color: var(--primary-accent);">Logout</a>`;
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('cineRecUser');
            window.location.reload(); 
        });
    }

    // ==========================================
    // LOGIN & SIGNUP PAGE LOGIC
    // ==========================================
    
    // Standard Email Form Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('cineRecUser', 'true');
            window.location.href = 'index.html'; 
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('cineRecUser', 'true');
            window.location.href = 'index.html'; 
        });
    }

    // Social Login Buttons Logic (Mocks a successful OAuth login)
    const socialBtns = document.querySelectorAll('.social-login-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('cineRecUser', 'true');
            window.location.href = 'index.html';
        });
    });

    // ==========================================
    // INDEX PAGE LOGIC (Search Form)
    // ==========================================
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const movieName = document.getElementById('movieInput').value.trim();
            const submitBtn = document.getElementById('submitBtn');
            const loadingMsg = document.getElementById('loading');
            const errorMsg = document.getElementById('error-msg');
            
            submitBtn.disabled = true;
            loadingMsg.style.display = 'block';
            errorMsg.style.display = 'none';

            try {
                const response = await fetch('/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: 1, movie_name: movieName })
                });

                if (!response.ok) throw new Error('Failed to fetch recommendations.');
                const data = await response.json();
                
                sessionStorage.setItem('cineRecResults', JSON.stringify(data));
                sessionStorage.setItem('cineRecQuery', movieName);
                window.location.href = 'results.html'; 
            } catch (error) {
                console.error('Error:', error);
                errorMsg.textContent = "Something went wrong. Please try again.";
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                loadingMsg.style.display = 'none';
            }
        });
    }

    // ==========================================
    // RESULTS PAGE LOGIC (Render Grid)
    // ==========================================
    const grid = document.getElementById('movie-grid');
    if (grid && !document.getElementById('browse-movie-grid') && !document.getElementById('browse-shows-grid') && !document.getElementById('browse-events-grid') && !document.getElementById('my-list-grid')) {
        const queryDisplay = document.getElementById('query-display');
        const rawData = sessionStorage.getItem('cineRecResults');
        const query = sessionStorage.getItem('cineRecQuery');

        if (query && queryDisplay) { 
            queryDisplay.textContent = `"${query}"`; 
        } else if (!query && document.getElementById('header-container')) { 
            document.getElementById('header-container').innerHTML = `<h2>Your Recommendations</h2>`; 
        }

        if (!rawData) {
            grid.innerHTML = `<div class="no-results">No session data found. Try searching from the <a href="index.html" style="color:#E50914">Home Page</a>.</div>`;
            return;
        }

        const movies = JSON.parse(rawData);

        if (movies.length === 0) {
            grid.innerHTML = `<div class="no-results">No recommendations found. Try another movie.</div>`;
            return;
        }

        let html = '';
        movies.forEach(movie => {
            const posterUrl = movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster';
            html += `
                <div class="movie-card" onclick="window.location.href='movie_detail.html?title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(posterUrl)}'">
                    <img src="${posterUrl}" alt="${movie.title} Poster" class="movie-poster" loading="lazy">
                    <div class="movie-info">
                        <div class="movie-title">${movie.title}</div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    // ==========================================
    // MOVIE DETAIL PAGE LOGIC (TRAILER & OTT LINKS)
    // ==========================================
    const detailTitle = document.getElementById('detail-title');
    const detailPoster = document.getElementById('detail-poster');
    const detailDesc = document.getElementById('detail-description');
    const detailMeta = document.getElementById('detail-meta');
    const addToListBtn = document.getElementById('addToListBtn');
    
    // New Buttons
    const watchTrailerBtn = document.getElementById('watchTrailerBtn');
    const watchMovieBtn = document.getElementById('watchMovieBtn');

    if (detailTitle && addToListBtn) {
        const params = new URLSearchParams(window.location.search);
        const title = params.get('title');
        const posterUrl = params.get('poster') || 'https://via.placeholder.com/300x450?text=No+Poster';
        
        if (title) detailTitle.innerText = title;
        if (detailPoster) detailPoster.innerHTML = `<img src="${posterUrl}" alt="${title}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;

        if (title) {
            const TMDB_API_KEY = '7bb05e9adc89c4384540a216524e9644'; 
            // Step 1: Search for the title to get its ID and Media Type
            const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;
            
            fetch(searchUrl)
                .then(res => res.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const item = data.results[0]; 
                        const mediaType = item.media_type || 'movie'; // Default to movie if undefined
                        const itemId = item.id;

                        // Step 2: Fetch full details INCLUDING videos and streaming providers
                        const fullDetailUrl = `https://api.themoviedb.org/3/${mediaType}/${itemId}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`;
                        return fetch(fullDetailUrl);
                    } else {
                        throw new Error("Movie not found in database.");
                    }
                })
                .then(res => res.json())
                .then(fullData => {
                    // Update Plot & Meta
                    if (detailDesc) detailDesc.innerText = fullData.overview || "No description available.";
                    if (detailMeta) {
                        const dateStr = fullData.release_date || fullData.first_air_date;
                        const year = dateStr ? dateStr.split('-')[0] : 'Upcoming';
                        const rating = fullData.vote_average ? fullData.vote_average.toFixed(1) : 'NR';
                        detailMeta.innerText = `${year}  •  ★ ${rating}/10`;
                    }

                    // Process YouTube Trailer
                    if (fullData.videos && fullData.videos.results && watchTrailerBtn) {
                        // Find the first official YouTube trailer
                        const trailer = fullData.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                        if (trailer) {
                            watchTrailerBtn.href = `https://www.youtube.com/watch?v=${trailer.key}`;
                            watchTrailerBtn.target = "_blank"; // Open in new tab
                            watchTrailerBtn.style.display = "flex"; // Make it visible
                        }
                    }

                    // Process OTT Watch Providers
                    if (fullData['watch/providers'] && fullData['watch/providers'].results && watchMovieBtn) {
                        const providers = fullData['watch/providers'].results;
                        // Prioritize Indian streaming links ('IN'), fallback to US if missing
                        const regionData = providers['IN'] || providers['US'];
                        
                        if (regionData && regionData.link) {
                            watchMovieBtn.href = regionData.link;
                            watchMovieBtn.target = "_blank"; // Open in new tab
                            watchMovieBtn.style.display = "flex"; // Make it visible
                        }
                    }
                })
                .catch(err => {
                    console.error("API Fetch Error:", err);
                    if (detailDesc) detailDesc.innerText = "Failed to load internet data. Check your connection.";
                });
        }

        // My List Check
        if (isLoggedIn && title) {
            let myList = JSON.parse(localStorage.getItem('cineRecMyList') || '[]');
            const alreadyExists = myList.some(movie => movie.title === title);
            if (alreadyExists) {
                addToListBtn.innerText = "✓ Already in List";
                addToListBtn.style.background = "#4CAF50"; 
            }
        }

        // Add to List Click handler
        addToListBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                alert("Please Sign In first to save movies to your list!");
                window.location.href = 'login.html';
                return;
            }

            if (!title) return;

            let myList = JSON.parse(localStorage.getItem('cineRecMyList') || '[]');
            const alreadyExists = myList.some(movie => movie.title === title);
            
            if (!alreadyExists) {
                myList.push({ title: title, poster: posterUrl });
                localStorage.setItem('cineRecMyList', JSON.stringify(myList));
                addToListBtn.innerText = "✓ Added to List";
                addToListBtn.style.background = "#4CAF50"; 
            }
        });
    }

    // ==========================================
    // BROWSE MOVIES PAGE LOGIC
    // ==========================================
    const browseGrid = document.getElementById('browse-movie-grid');
    if (browseGrid) {
        const TMDB_API_KEY = '7bb05e9adc89c4384540a216524e9644'; 
        const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        
        browseGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: var(--primary-accent); margin-top: 3rem;">Loading popular movies...</div>`;

        fetch(popularUrl)
            .then(res => res.json())
            .then(data => {
                let html = '';
                data.results.forEach(movie => {
                    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
                    html += `
                        <div class="movie-card" onclick="window.location.href='movie_detail.html?title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(posterUrl)}'">
                            <img src="${posterUrl}" alt="${movie.title} Poster" class="movie-poster" loading="lazy">
                            <div class="movie-info">
                                <div class="movie-title">${movie.title}</div>
                            </div>
                        </div>
                    `;
                });
                browseGrid.innerHTML = html;
            })
            .catch(err => {
                console.error("Failed to load popular movies:", err);
                browseGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;">Failed to load movies. Please check your network connection.</div>`;
            });
    }

    // ==========================================
    // BROWSE SHOWS PAGE LOGIC
    // ==========================================
    const browseShowsGrid = document.getElementById('browse-shows-grid');
    if (browseShowsGrid) {
        const TMDB_API_KEY = '7bb05e9adc89c4384540a216524e9644'; 
        const popularTvUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        
        browseShowsGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: var(--primary-accent); margin-top: 3rem;">Loading popular TV shows...</div>`;

        fetch(popularTvUrl)
            .then(res => res.json())
            .then(data => {
                let html = '';
                data.results.forEach(show => {
                    const posterUrl = show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
                    html += `
                        <div class="movie-card" onclick="window.location.href='movie_detail.html?title=${encodeURIComponent(show.name)}&poster=${encodeURIComponent(posterUrl)}'">
                            <img src="${posterUrl}" alt="${show.name} Poster" class="movie-poster" loading="lazy">
                            <div class="movie-info">
                                <div class="movie-title">${show.name}</div>
                            </div>
                        </div>
                    `;
                });
                browseShowsGrid.innerHTML = html;
            })
            .catch(err => {
                console.error("Failed to load popular TV shows:", err);
                browseShowsGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;">Failed to load TV shows. Please check your network connection.</div>`;
            });
    }

    // ==========================================
    // EVENTS PAGE LOGIC
    // ==========================================
    const browseEventsGrid = document.getElementById('browse-events-grid');
    if (browseEventsGrid) {
        const TMDB_API_KEY = '7bb05e9adc89c4384540a216524e9644'; 
        const upcomingUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        
        browseEventsGrid.innerHTML = `<div style="text-align: center; grid-column: 1/-1; color: var(--primary-accent); margin-top: 3rem;">Loading upcoming premieres...</div>`;

        fetch(upcomingUrl)
            .then(res => res.json())
            .then(data => {
                let html = '';
                data.results.forEach(movie => {
                    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
                    const releaseDate = movie.release_date ? movie.release_date : 'TBA';

                    html += `
                        <div class="movie-card" onclick="window.location.href='movie_detail.html?title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(posterUrl)}'">
                            <img src="${posterUrl}" alt="${movie.title} Poster" class="movie-poster" loading="lazy">
                            <div class="movie-info">
                                <div class="movie-title">${movie.title}</div>
                                <div style="color: var(--primary-accent); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 600;">Premieres: ${releaseDate}</div>
                            </div>
                        </div>
                    `;
                });
                browseEventsGrid.innerHTML = html;
            })
            .catch(err => {
                console.error("Failed to load upcoming events:", err);
                browseEventsGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;">Failed to load upcoming premieres. Please check your network connection.</div>`;
            });
    }

    // ==========================================
    // MY LIST PAGE LOGIC (Render & Remove)
    // ==========================================
    const myListGrid = document.getElementById('my-list-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (myListGrid) {
        if (!isLoggedIn) {
            window.location.href = 'login.html'; 
            return;
        }

        function renderMyList() {
            let myList = JSON.parse(localStorage.getItem('cineRecMyList') || '[]');

            if (myList.length === 0) {
                myListGrid.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                myListGrid.style.display = 'grid'; 
                
                let html = '';
                myList.forEach(movie => {
                    html += `
                        <div class="movie-card" onclick="window.location.href='movie_detail.html?title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster)}'">
                            <img src="${movie.poster}" alt="${movie.title} Poster" class="movie-poster" loading="lazy">
                            <div class="movie-info">
                                <div class="movie-title" style="margin-bottom: 0.5rem;">${movie.title}</div>
                                <button class="btn-remove" data-title="${movie.title}">Remove from List</button>
                            </div>
                        </div>
                    `;
                });
                myListGrid.innerHTML = html;

                document.querySelectorAll('.btn-remove').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        
                        const titleToRemove = e.target.getAttribute('data-title');
                        let currentList = JSON.parse(localStorage.getItem('cineRecMyList') || '[]');
                        
                        const updatedList = currentList.filter(movie => movie.title !== titleToRemove);
                        
                        localStorage.setItem('cineRecMyList', JSON.stringify(updatedList));
                        renderMyList(); 
                    });
                });
            }
        }

        renderMyList();
    }
});