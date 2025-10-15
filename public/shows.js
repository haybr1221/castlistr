async function fetchShows() {
    try {
        const response = await fetch("/show");

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const div = document.getElementById("shows");
            data.forEach(element => {
                formatShow(element, div)
            });
        }

    }
    catch (err) {
        console.error("Error fetching shows:", err);
    }
}

function formatShow(element, parentDiv) {
    // Create a div for the show
    const showDiv = document.createElement("div");
    showDiv.className = "show-div";
    parentDiv.appendChild(showDiv)

    // Create image
    const poster = document.createElement("img");
    poster.className = "poster"
    poster.src = element.poster_url;
    showDiv.appendChild(poster);

    // Create title box
    const showTitle = document.createElement("p");
    showTitle.className = "show-title";
    showTitle.innerHTML = element.title;
    showDiv.appendChild(showTitle);
    
    // TODO get cast lists count
    // Display amount of cast lists
    const castListCount = document.createElement("p");
    castListCount.className = "count";
    castListCount.innerHTML = `0 Cast Lists`;
    showDiv.appendChild(castListCount);
}

fetchShows();

async function redirectToCreate() {
    window.location.href = '/create-show.html';
}

document.getElementById("new-show-button").addEventListener("click", redirectToCreate)