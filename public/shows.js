import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

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

// Open the create new show modal
document.getElementById("new-show-button").addEventListener("click", openModal)

function openModal() {
    document.getElementById("overlay").removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    document.getElementById("add-show").removeAttribute("hidden");
}

function closeModal() {
    document.body.style.overflow = "auto";
    document.getElementById("overlay").setAttribute("hidden", true);

    document.getElementById("add-show").setAttribute("hidden", true);
}

// Creating a new show
const create = async (e, isMultiple) => {
    e.preventDefault();
    const message = document.getElementById("message");
    const title = document.getElementById("title-input");

    const { data: dupData, error: dupError } = await supabase
        .from("show")
        .select("*")
        .eq("title", title.value)

    if (dupError) console.error(dupError);

    if (dupData.length > 0) {
        message.innerHTML = "This show likely already exists in the database! If you think this is an error, please contact support.";
        return;
    }

    const { data, error } = await supabase
        .from("show")
        .insert([
            {
                title: title.value,
                user_id: user.id
            }
        ]).select()
    
    if (error) throw error;

    if (isMultiple)
    {
        // Display a message so they know the last one went through
        message.innerHTML = `Success! ${title.value} can now have lists.`

        // Reset the form for the next
        title.value = "";
    }

    console.log(data);
    const showId = data[0].id;

    console.log(showId)

    // Send them to the newly created show page
    window.location.href = `./show.html?id=${showId}`;
}

document.getElementById("create-btn").addEventListener("click", (e) => create(e, false));
document.getElementById("create-create-another").addEventListener("click", (e) => create(e, true))

// Handle closing modal
document.querySelectorAll(".cancel").forEach(el => {
    el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});