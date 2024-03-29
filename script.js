// Define constants
const baseUrl = "http://localhost:8000/api/v1/titles/";
const bestOfUrl = "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes";
const modalContainer = document.querySelector(".modal-container");

// Function to fetch data for modal window
async function fetchModalData(movieUrl) {
    return fetch(movieUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('modal-cover').src = data["image_url"];
            document.getElementById('modal-title').innerHTML = data["title"];
            document.getElementById('modal-year').innerHTML = data["year"];
            document.getElementById('modal-duration').innerHTML = data["duration"] + " min";
            document.getElementById('modal-genres').innerHTML = data["genres"];
            document.getElementById('modal-imdb').innerHTML = data["imdb_score"] + " / 10";
            document.getElementById('modal-rating').innerHTML = data["rated"];
            document.getElementById('modal-directors').innerHTML = data["directors"];
            document.getElementById('modal-cast').innerHTML = data["actors"] + "...";
            document.getElementById('modal-country').innerHTML = data["countries"];
            document.getElementById('modal-desc').innerHTML = data["long_description"];
            
            // N/A box office
            let modalBoxOffice = document.getElementById('modal-box-office');
            if (data["worldwide_gross_income"] == null)
                modalBoxOffice.innerHTML = "N/A";
            else
                modalBoxOffice.innerHTML = data["worldwide_gross_income"] + " " + data["budget_currency"];
        });
}

// Add click event to .modal-triggers elements
function modalToggleButtons() {
    const modalTriggers = document.querySelectorAll(".modal-trigger");
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            getBestMovieDetails(baseUrl);
            modalContainer.classList.toggle("active"); // Add or remove active class to modal window
        });
    });
}
modalToggleButtons();

// Function to create a "See more" button at the end of each category
function addSeeMoreButtonToCategory(category) {
    const targetElement = document.getElementById(category);
    const hiddenMovies = document.querySelectorAll('.movies');

    const seeMoreButton = document.createElement("button");
    seeMoreButton.textContent = "See more/less";
    seeMoreButton.classList.add("see-more-btn");

    seeMoreButton.addEventListener("click", function() {
        hiddenMovies.forEach(movie => {
            movie.classList.toggle("active");
        }); 
    });
    targetElement.appendChild(seeMoreButton);
}

// Function to display movies
function displayMovies(category, itemsDetails) {
    
    let limitedItemsDetails;
    
    if (category === "bestOf") {
        limitedItemsDetails = itemsDetails.slice(1, 7);
    } else {
        limitedItemsDetails = itemsDetails.slice(0, 6);
    }

    let targetElement = document.getElementById(category);

    limitedItemsDetails.forEach(item => {
        const imageUrl = item.image_url ? item.image_url : "img/JSI_logo.jpeg";
        
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        const imgCover = document.createElement("img");
        imgCover.src = imageUrl;
        imgCover.alt = item.original_title;

        // In case of image loading error, use the logo image
        imgCover.onerror = function() {
            this.onerror = null; // Avoid infinite loops
            this.src = "img/JSI_logo.jpeg";
        };

        const title = document.createElement("p");
        title.textContent = item.original_title;

        imgCover.addEventListener('click', () => {
            let movieUrl = `${baseUrl}${item.id}`;
            fetchModalData(movieUrl);
            modalContainer.classList.toggle("active");
        });

        movieElement.appendChild(imgCover);
        movieElement.appendChild(title);
        targetElement.appendChild(movieElement);
    });
    addSeeMoreButtonToCategory(category)
}

// Function to fetch and display movies by category
function fetchAndDisplayMovies(category) {
    let url = category === "bestOf" ? `${bestOfUrl}&page_size=7` : `${bestOfUrl}&genre=${category}&page_size=6`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const movieUrls = data.results.map(result => `${baseUrl}${result.id}`);
            Promise.all(movieUrls.map(url => fetch(url)))
                .then(responses => Promise.all(responses.map(res => res.json())))
                .then(itemsDetails => displayMovies(category, itemsDetails))
                .catch(error => console.error(`Error fetching movie details for category ${category}:`, error));
        })
        .catch(error => console.error(`Error fetching movies for category ${category}:`, error));
}

// Best movie box
function getBestMovieDetails(baseUrl) {
    const bestMovieImg = document.getElementById("bestmovieimg");
    const titleElement = document.querySelector(".right h2");
    const descriptionElement = document.querySelector(".right p");

    fetch(bestOfUrl)
        .then(response => response.json())
        .then(data => {
            const bestMovie = data.results[0];
            const bestMovieUrl = `${baseUrl}${bestMovie.id}`;

            fetch(bestMovieUrl)
                .then(response => response.json())
                .then(movieDetails => {
                    bestMovieImg.src = movieDetails.image_url;
                    titleElement.textContent = movieDetails.title;
                    descriptionElement.textContent = movieDetails.description;
                    fetchModalData(bestMovieUrl);
                })
                .catch(error => console.error('Error fetching movie details:', error));
        })
        .catch(error => console.error('Error fetching best movie:', error));
}

// Fetching best movie details and displaying movies by category on window load
let categories = ["sci-fi", "family", "comedy", "bestOf"];

window.addEventListener('load', () => {
    getBestMovieDetails(baseUrl);

    categories.forEach(category => {
        fetchAndDisplayMovies(category);
    });
});

// Function to update movie list based on selected category
function updateMoviesByCategory(category) {
    const targetElement = document.getElementById("categoryChoice");
    const targetCat = document.getElementsByClassName("movies")[4];

    targetElement.textContent = category;

    targetCat.id = category;

    targetCat.innerHTML = "";

    fetchAndDisplayMovies(category);
}

// Add click event to dropdown menu items for each category
document.querySelectorAll(".submenu a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        const category = this.textContent;
        updateMoviesByCategory(category);
    });
});
