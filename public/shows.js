async function fetchShows() {
    try {
        const response = await fetch("/show");

        if (response.ok) {
            const data = await response.json();
            const div = document.getElementById("shows");
            const totalCastLists = await countCastLists()
            data.forEach(element => {
                formatShow(element, div, totalCastLists)
            });
        }
    }
    catch (err) {
        console.error("Error fetching shows:", err);
    }
}

function formatShow(element, parentDiv, totalCastLists) {
    // Create the navigation for the show
    const navLink = document.createElement("a");
    navLink.href = `show.html?id=${element.id}`;
    parentDiv.appendChild(navLink);

    // Create a div for the show
    const showDiv = document.createElement("div");
    showDiv.className = "show-div";
    showDiv.id = `show-div-${element.id}`
    navLink.appendChild(showDiv)
    
    const poster = document.createElement("img");
    poster.className = "poster"
    // Create image
    if (element.poster_url != null) {
        poster.src = element.poster_url;
    }
    showDiv.appendChild(poster);

    // Create div for title box
    const showTitleDiv = document.createElement("div")
    showTitleDiv.className = "show-summary";
    showDiv.append(showTitleDiv);

    // Create title box
    const showTitle = document.createElement("p");
    showTitle.className = "show-title";
    showTitle.innerHTML = element.title;
    showTitleDiv.appendChild(showTitle);

    // Display cast list count
    displayCastLists(element.id, totalCastLists, showTitleDiv)
}

async function countCastLists() {
    // Count the cast lists each show has
    
    // Create an array to store these
    // The ID will be the show id, the value will be the count
    const castListCounts = {};

    // Fetch cast lists
    const response = await fetch ("/cast-lists");

    if (response.ok)
    {
        const castLists = await response.json();
        
        castLists.forEach(list => {
            if (castListCounts[list.show_id])
            {
                // If it already exists, incremenet the count
                castListCounts[list.show_id] += 1;
            }
            else
            {
                // Hasn't been added yet, create it
                // This is the first so set it to one
                castListCounts[list.show_id] = 1;
            }
        })

    }

    return castListCounts;
}

function displayCastLists(showId, list, parentDiv) {
    // Find the ID in the list
    let listCount = list[showId]
    if (!listCount)
    {
        listCount = 0;
    }

    // Display amount of cast lists
    const castListCount = document.createElement("p");
    castListCount.className = "count";

    if (listCount == 1)
        // Display properly
        castListCount.innerHTML = `${listCount} Cast List`;
    else
        castListCount.innerHTML = `${listCount} Cast Lists`;
    parentDiv.appendChild(castListCount);
}

fetchShows();

async function redirectToCreate() {
    window.location.href = '/create-show.html';
}

document.getElementById("new-show-button").addEventListener("click", redirectToCreate)