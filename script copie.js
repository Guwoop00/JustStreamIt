// Définition constantes
const baseUrl = "http://localhost:8000/api/v1/titles/";
const bestOfUrl = "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes";
const modalContainer = document.querySelector(".modal-container");

// Fonction fetch data fenetre modale
function fetchModalData(movieUrl) {
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
            // Valeur par defaut N/A box offfice
            let modalBoxOffice = document.getElementById('modal-box-office');
            if (data["worldwide_gross_income"] == null)
                modalBoxOffice.innerHTML = "N/A";  // placeholder for unspecified box-office
            else
                modalBoxOffice.innerHTML = data["worldwide_gross_income"] + " " + data["budget_currency"];
        });
}

// Ajout de l'événement de clic aux éléments .modal-triggers
function modalToggleButtons() {
    const modalTriggers = document.querySelectorAll(".modal-trigger");
    modalTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            getBestMovieDetails(baseUrl);
            modalContainer.classList.toggle("active"); // Ajouter ou supprimer la classe active à la fenêtre modale
        });
    });
}
modalToggleButtons();

// Function to display movies in a category
function displayMovies(category, itemsDetails) {
    let limitedItemsDetails;
    if (category === "bestOf") {
        limitedItemsDetails = itemsDetails.slice(1, 7);
    } else {
        limitedItemsDetails = itemsDetails.slice(0, 6);
    }

    let targetElement = document.getElementById(category);
    
    console.log(category)
    console.log(targetElement)
    
    limitedItemsDetails.forEach(item => {
        const imageUrl = item.image_url ? item.image_url : "img/JSI_logo.jpeg";
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        const imgCover = document.createElement("img");
        imgCover.src = imageUrl;
        imgCover.alt = item.title;

        const title = document.createElement("p");
        title.textContent = item.title;

        const modalContainer = document.querySelector(".modal-container");

        imgCover.addEventListener('click', () => {
            let movieUrl = `${baseUrl}${item.id}`;
            fetchModalData(movieUrl);
            modalContainer.classList.toggle("active");
        });

        movieElement.appendChild(imgCover);
        movieElement.appendChild(title);
        targetElement.appendChild(movieElement);
    });
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
                .catch(error => console.error(`Erreur lors de la récupération des détails des films de la catégorie ${category}:`, error));
        })
        .catch(error => console.error(`Erreur lors de la récupération des films de la catégorie ${category}:`, error));
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
                .catch(error => console.error('Erreur lors de la récupération des détails du film:', error));
        })
        .catch(error => console.error('Erreur lors de la récupération du meilleur film:', error));
}

// Fetching best movie details and displaying movies by category on window load
let categories = ["sci-fi", "family", "comedy", "bestOf"]

window.addEventListener('load', () => {
    getBestMovieDetails(baseUrl);

    categories.forEach(category => {
        fetchAndDisplayMovies(category);
    });
});

// Fonction pour mettre à jour la liste de films en fonction de la catégorie sélectionnée
function updateMoviesByCategory(category) {
    const targetElement = document.getElementById("categoryChoice");

    // Vérifier si la div "dynamic" existe
    let targetCat = document.getElementById("dynamic");

    // Créer une nouvelle div "dynamic" avec l'ID "dynamicCat"
    targetCat = document.createElement("div");
    targetCat.classList.add("movies");
    targetCat.id = "dynamic";

    // Mettre à jour le texte de l'élément "categoryChoice"
    targetCat = document.getElementById("dynamic");
    targetElement.textContent = category;
    targetCat.id = category;
    console.log(targetCat)
    console.log(targetCat.id)
    fetchAndDisplayMovies(category)
}



// Ajout de l'événement de clic aux éléments du menu déroulant pour chaque catégorie
document.querySelectorAll(".sousmenu a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du lien
        const category = this.textContent;
        updateMoviesByCategory(category);
    });
});
