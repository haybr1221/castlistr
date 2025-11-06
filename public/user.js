import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

const lists = await fetch (`/cast-lists/${user.id}`);
const listsData = await lists.json();
console.log(listsData)

const feedDiv = document.querySelector("#user-lists");

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

// Change the button //
// If the user matches the current user, the button should be "Edit Profile"


// If the user does not match the current user, the button should be "Follow"
// If the user does not match the current user and is following the user, the button should be "Unfollow"

// Change what is being shown // 
const listsLabel = document.getElementById("lists")
const listsTab = document.getElementById("user-lists")
const likedLabel = document.getElementById("liked")
const likedTab = document.getElementById("user-likes");

function toggleShownTab()
{
    if (likedTab.hidden)
    {
        // Liked is hidden, so unhide it
        listsLabel.classList.remove("selected-tab");
        listsTab.setAttribute("hidden", true);
        listsTab.classList.remove("shown-lists")
        likedLabel.classList.add("selected-tab");
        likedTab.removeAttribute("hidden")
        likedTab.classList.add("shown-lists")
    }
    else
    {
        // Lists is hidden, so unhide it
        likedLabel.classList.remove("selected-tab");
        likedTab.classList.remove("shown-lists")
        likedTab.setAttribute("hidden", true);
        listsLabel.classList.add("selected-tab");
        listsTab.removeAttribute("hidden")
        listsTab.classList.add("shown-lists")
    }
}

listsLabel.addEventListener("click", toggleShownTab);
likedLabel.addEventListener("click", toggleShownTab);