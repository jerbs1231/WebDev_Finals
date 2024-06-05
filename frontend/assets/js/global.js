"use strict";


let ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', function open() {
  console.log('Connected to server');
});


// Sending commands to the server
function sendCommand(action, id, data = {}) {
  const message = JSON.stringify({ action, id, payload: data });
  try {
    ws.send(message);
  } catch (error) {
    console.log(ws.OPEN, error);
    setTimeout(() => {
      ws.send(message);
    }, 1000);
    ws = new WebSocket('ws://localhost:8080');
  }
}

/*----- Add event on multiple elements ------*/
const addEventOnElements = (elements, eventType, callback) => {
  for (const elem of elements) {
    elem.addEventListener(eventType, callback);
  }
};


/*----- Toggle search box in mobile device ------*/
const searchBox = document.querySelector("[search-box]");
const searchTogglers = document.querySelectorAll("[search-toggler]");

addEventOnElements(searchTogglers, "click", () => {
  searchBox.classList.toggle("active");
});

/*
Store MovieId in Local Storage when I click any movie card
.*/
const getMovieDetail = (movieId) => {
  window.localStorage.setItem("movieId", String(movieId));
};

const getMovieList = function (urlParam, genreName) {
  window.localStorage.setItem("urlParam", urlParam);
  window.localStorage.setItem("genreName", genreName);
};


function showModal(movieId) {
  const api_key = "2a3c21f7203959050cb73bdefd2b2ae2";
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`;
  const imageBaseURL = "http://image.tmdb.org/t/p/";
  const addToListBtn = document.getElementById('addToList');

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Get modal elements
      const modal = document.getElementById('movie-modal');
      const modalImage = document.getElementById('modal-movie-image');
      const modalTitle = document.getElementById('modal-movie-title');
      const modalOverview = document.getElementById('modal-movie-overview');
      const runtime = document.getElementById('runtime');
      // Assign data to modal elements
      modalImage.src = `${imageBaseURL}w342${data.poster_path}`;
      modalTitle.textContent = data.title;
      modalOverview.textContent = data.overview;
      modal.style.display = "block";
      runtime.setAttribute('max', data.runtime);
      fetch('/getmovie?id='+movieId)
      .then(response => {
        return response.json();
      })
      .then(data => {
        addToListBtn.disabled = true;
        runtime.value = data.runtime;
        console.log(data);
      })
      .catch(error => {
        addToListBtn.disabled = false;
      });

      addToListBtn.addEventListener('click', (event) => {
        sendCommand('create', movieId, { id: movieId, title: data.title, poster_path: data.poster_path, runtime: runtime.value });
        var modal = document.getElementById("movie-modal");
        modal.style.display = "none";
      }, { once: true });
    });
}

function fetchEpisodes(tvId, seasonNumber) {
  const api_key = "2a3c21f7203959050cb73bdefd2b2ae2";
  const url = `https://api.themoviedb.org/3/movie/${tvId}/season/${seasonNumber}?api_key=${api_key}`;
  const episodeSelect = document.getElementById('episode-select');

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Clear previous episodes
      episodeSelect.innerHTML = '';

      // Populate episodes
      data.episodes.forEach(episode => {
        const option = document.createElement('option');
        option.value = episode.episode_number;
        option.textContent = episode.name;
        episodeSelect.appendChild(option);
      });
    });
}

window.addEventListener('click', function (event) {
  var modal = document.getElementById("movie-modal");
  if (event.target.closest('.close-button') || event.target == modal) {
    modal.style.display = "none";
  }
});

document.getElementById('runtime')?.addEventListener('input', event => {
  console.log(event.target.value);
  event.target.setAttribute('value', event.target.value);
});

