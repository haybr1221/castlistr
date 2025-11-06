import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

const lists = await fetch (`/cast-lists`);
const listsData = await lists.json();

const feedDiv = document.querySelector(".feed");

listsData.forEach(element => {
    formatList(element, feedDiv)
});

async function formatList(element, feedDiv) {
    /* FORMAT EACH LIST NICELY */
    
    // Set up a div for this list
    const parentDiv = document.createElement("div");
    parentDiv.id = `cast-list-${element.id}`;
    parentDiv.className = "cast-list";
    feedDiv.appendChild(parentDiv);
    
    // Create a div for the header
    const headerDiv = document.createElement("div");
    headerDiv.className = "list-header";
    parentDiv.appendChild(headerDiv);

    // Create the list title
    const listTitle = document.createElement("p");
    listTitle.className = "list-title";
    listTitle.innerHTML = element.title;
    headerDiv.appendChild(listTitle)

    const header = document.createElement("p");
    header.className = "list-subtitle"
    header.innerHTML = `[username]'s dream cast for ${element.show.title}`
    headerDiv.appendChild(header)

    // Create a div for the body of the cast list
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "cast-list-body";
    parentDiv.appendChild(bodyDiv);

    element.cast_list_entry.forEach(element => {
        formatCharacter(element, bodyDiv)
    });
}

function formatCharacter(element, parentDiv) {
    // Create a div for this one
    const charDiv = document.createElement("div");
    charDiv.className = "charDiv";
    charDiv.id = `char-perf-combo-${element.id}`
    parentDiv.appendChild(charDiv)
    
    // Format the element for ease of use
    const charElement = element.character

    // First display the character name
    // Space it correctly taking into account which values may be null
    const charName = document.createElement("p");
    charName.className = "character";
    charName.id = `char-${charElement.id}`;
    charName.innerHTML = charElement.name;
    charDiv.appendChild(charName);

    // Format the element for more ease of use
    const perfElement = element.performer;
    // Get the performer name
    const perfName = document.createElement("p");
    perfName.className = "performer";
    perfName.id = `perf-${perfElement.id}`;
    const full_perf_name = `${perfElement.first_name} ${perfElement.middle_name ? perfElement.middle_name + ' ' : ''}${perfElement.last_name}`;
    perfName.innerHTML = full_perf_name;
    charDiv.appendChild(perfName)
}

// Upddate a user's profile informations

async function fetchCastListCounts(id) {
    // Get cast list counts for this user
    const response = await fetch(`/user-cast-lists/${id}`);

    if (!response.ok) {
        console.error("Error fetching cast list counts for user:", id);
        return;
    }

    return response.json();
    // console.log(data.data.length);
}

const userCastLists = await fetchCastListCounts(user.id);

// Get the ID for the element we will update
const castListCount = document.getElementById("user-list-count");

if (userCastLists.length == 1)
    // Display properly
    castListCount.innerHTML = `${userCastLists.length} Cast List`;
else
    castListCount.innerHTML = `${userCastLists.length} Cast Lists`;

// Create route for user profile
const profileEl = document.getElementById("user-profile")
profileEl.href = `./user.html?=${user.id}`