"use strict";

const api_key = "2a3c21f7203959050cb73bdefd2b2ae2";
const imageBaseURL = "http://image.tmdb.org/t/p/";

/*--------- 
Fetch data from a server using the 'url' and passes the result in JSON data to a 'callback' function, along with an optional parameter if has 'optionalParam'.
----------*/

document.addEventListener("DOMContentLoaded", () => {
  sendCommand('read', null, null);
  ws.onmessage = (msg) => {
    loadMovies(Object.values(JSON.parse(msg.data)));
  }

  const searchField = document.querySelector('[search-field]');
  searchField.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      fetchMovies(query);
    } else {
      sendCommand('read', null, null);
    }
  });
});

function loadMovies(movies) {
  const movieList = document.getElementById("save-movie-list");
  movieList.innerHTML = ''; // Clear existing movies
  console.log(movies);
  movies.forEach(movie => {
    const movieItem = document.createElement("div");
    const API_URL = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${api_key}&append_to_response=credits,images`;

    fetch(API_URL)
      .then(response => response.json())
      .then(movieDetails => {
        const posterPath = movieDetails.poster_path ? `${imageBaseURL}w342${movieDetails.poster_path}` : "";
        const eps = movieDetails.episodes ? movieDetails.episodes : 0;
        const s = movieDetails.seasons ? movieDetails.seasons : 0;
        console.log(movieDetails)
        movieItem.className = "movie-card";
        movieItem.innerHTML = `
          <figure class="poster-box card-banner">
            <img
              class="img-cover"
              src="${posterPath}"
              alt="${movie.title}"
              loading="lazy"
            />
          </figure>
          <div>
            <h4 class="title">${movie.title}</h4>
    <div class="runtime-container2">
      <label>Watched(minute):</label>
      <input type="range" min="0" max="${movieDetails.runtime || 1}" value="${movie.runtime || 0}" class="runtime2" oninput="updateRuntime(event)" onchange="saveRuntime(event, '${movie.id}', '${movie.title}', '${movie.poster_path}')">
    </div>
          </div>
          <div class="meta-list">
            <div class="meta-item">
              <button onclick="deleteMovie('${movie.title}', ${movie.id})" class="delete-btn">Delete</button>
            </div>
          </div>
        `;

        movieList.appendChild(movieItem);

      })
      .catch(error => console.error('Error fetching movie details:', error));
  });
}

function updateRuntime(event) {
  event.target.setAttribute('value', event.target.value);
}

function saveRuntime(event, movieId, title, poster_path) {
  // sendCommand('update', movieId, {id: movieId, title, poster_path, runtime: event.runtime });
  const data = { id: movieId, title, poster_path, runtime: event.target.value };
  fetch('/update_movie', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    body: JSON.stringify(data),
  })
  .catch(console.log);
}

function deleteMovie(title, id) {
  const confirmDeletion = confirm(`Are you sure do you want to remove the movie ${title} in the list?`);
  if (confirmDeletion) {
    sendCommand("delete", id);
    sendCommand('read', null, null);
  }
}
