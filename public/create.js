import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)


// Get the list of shows
console.log("hello")
const response = await fetch("/show");
const data = await response.json();

console.log(data);

// Create the dropdown parent
const parent = document.getElementById("show-list");

// Add each show to be selected
data.forEach(element => {
    const item = document.createElement("li");
    item.classList.add("dropdown-item")
    item.value = element.id;
    item.innerHTML = element.title;
    parent.appendChild(item);
});

let showId;
// When a show is selected, fetch the characters for that show
parent.addEventListener("click", async (event) => {
    // Save the show id
    const showId = event.target.value;
    const clickedShow = event.target.closest(".dropdown-item");
    console.log("Creating for ", showId);

    // Save the show title
    const showTitle = clickedShow.textContent.trim();
    document.getElementById("selected-show-title").innerText = showTitle
    console.log("Fetching characters");
    
    const response = await fetch(`/show/${showId}/characters`);
    const data = await response.json();

    console.log("Characters for show:", data)

    const characterForm = document.getElementById("character-form");
    characterForm.innerHTML= ""

    data.forEach(element => {
        createCharacterSelector(element, characterForm)
    })

});

// Create an array to store slections client-side while they save
// The key will be the character ID and the value will be the performer ID
const castSelections = {};

async function createCharacterSelector(element, characterForm) {
    // Get all necessary values to format later
    const { first_name, middle_name, last_name, suffix, title } = element;

    // Create a new row for each character
    const label = document.createElement("p");
    label.className = "label";
    characterForm.appendChild(label);

    // Set the full name for character
    // Keeping in mind some characters are missing some data type (e.g may have title but no first name)
    // So format it to space it correctly
    const full_name = `${title ? title + ' ' : ''}
                    ${first_name ? first_name + ' ' : ''}
                    ${middle_name ? middle_name + ' ' : ''}
                    ${last_name ? last_name + ' ' : ''}
                    ${suffix ? suffix : ''}`.replace(/\s+/g, ' ').trim();
    
    // Create label for character
    label.innerHTML = `${full_name}:`
    label.htmlFor = `char-${element.id}`
    
    // Create dropdown box for performers
    const dropdown = document.createElement("div");
    dropdown.id = `char-${element.id}`;
    dropdown.classList.add("dropdown-box")
    dropdown.innerHTML = `
        <div class="selected-item">
            <input type="text" name="" value="Select a performer" readonly id="">
        </div>
        <div class="dropdown-content" id="char-${element.id}-dropdown">
            <div class="search-input">
                <input type="text" name="" id="">
            </div>
            <ul id="char-${element.id}-list">
                <li class="dropdown-item active">Select</li>
            </ul>
        </div>
    `

    // Append label to select form
    characterForm.appendChild(dropdown);

    const listId = `char-${element.id}-list`;

    // Create the performer selector for this character
    createPerformerSelector(listId, element.id);
}

async function createPerformerSelector(selectId, charId) {
    // First call for performers from the backend
    try {
        const response = await fetch("/performer");

        if (response.ok) {
            // Get data
            const data = await response.json();

            // Define parent element so we can append later
            const parent = document.getElementById(selectId);

            // For each performer, create an option in the select dropdown
            data.forEach(element => {
                // Get name values we need
                const { first_name, middle_name, last_name } = element;

                // Create the element
                const item = document.createElement("li");
                item.classList.add("dropdown-item")

                // Format the full name
                const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;

                // Set the option value to the performer_id
                item.value = element.id;

                // Set inner HTML
                item.innerHTML = `${full_name}`;

                // Append it to the parent element
                parent.appendChild(item);

                // See if user updates this at all
                parent.addEventListener('click', (e) => {
                    const perfValue = e.target.value;
                    if (!perfValue) {
                        // If the user clears the option, we don't want to save it
                        setPerformerForChar(charId, null);
                        return;
                    }
                    
                    // Otherwise, set the performer associated with the character
                    setPerformerForChar(Number(charId), Number(perfValue))
                })
            });
        }

    }
    catch (err) {
        console.error("Error fetching performers:", err);
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: castListData, error: castListError } = await supabase
        .from('cast_lists')
        .insert([
            // Inital cast list needs cast_list_id, show_id, user_id, title, created_at
            {
                show_id: showId,
                title: document.getElementById("list-name").value,
                user_id: user.id
            }
        ])
        .select()

    // Log an error if it finds one
    if (castListError) throw castListError;

    // Get the ID so we can add the cast list entries
    const castListId = castListData[0].id;

    console.log(castSelections);
    // Create a bulk array to add all entries at once
    const entries = Object.entries(castSelections).map(([charId, perfId]) => ({
        cast_list_id: castListId,
        character_id: Number(charId),
        performer_id: Number(perfId)
    }))

    const { data: entryData, error: entryError } = await supabase
        .from('cast_list_entry')
        .insert(entries)

    if (entryError)
    {
        console.log("Error adding entires: ", entryError)
    }
    else {
        console.log("Saved cast list.")
    }
}

async function setPerformerForChar(charId, perfId)
{
    if (perfId == null || perfId == "")
    {
        // If performerId is null or if performerId doesn't exist, 
        // take it off from the list
        delete castSelections[charId];
    }
    else {
        // Otherwise, set the value to the performer ID
        // This should overwrite itself if the user changes who they want cast
        castSelections[charId] = perfId;
    }
}

window.addEventListener("click", (event) => {
    // Close any open dropdowns if clicked outside
    document.querySelectorAll(".dropdown-box.active").forEach(box => {
        if (!box.contains(event.target)) {
            box.classList.remove("active");
        }
    });

    // Toggle dropdown if selected-item clicked
    const selectedItem = event.target.closest(".selected-item");
    if (selectedItem) {
        const dropdownBox = selectedItem.closest(".dropdown-box");
        if (dropdownBox) {
            dropdownBox.classList.toggle("active");
        }
    }
});

function closeDropdown() {
    const dropdown = document.querySelector(".dropdown-box");
    dropdown.classList.remove("active")
}

const dropdownItems = document.querySelectorAll(".dropdown-item");
document.addEventListener("click", (event) => {
    const clickedItem = event.target.closest(".dropdown-item");
    if (!clickedItem) return;

    // Find the parent dropdown box
    const dropdownBox = clickedItem.closest(".dropdown-box");
    const dropdownItems = dropdownBox.querySelectorAll(".dropdown-item");

    // Clear active state inside this dropdown
    dropdownItems.forEach(item => item.classList.remove("active"));
    clickedItem.classList.add("active");

    // Update the visible input text
    const selectedInput = dropdownBox.querySelector(".selected-item input");
    selectedInput.value = clickedItem.textContent.trim();

    // Close this dropdown
    dropdownBox.classList.remove("active");
});
const searchInput = document.querySelector(".search-input input");

document.addEventListener("keyup", (event) => {
    const searchInput = event.target.closest(".search-input input");
    if (!searchInput) return;

    const dropdownBox = searchInput.closest(".dropdown-box");
    const dropdownItems = dropdownBox.querySelectorAll(".dropdown-item");

    const filter = searchInput.value.toLowerCase();

    dropdownItems.forEach(item => {
        if (item.textContent.toLowerCase().startsWith(filter)) {
            item.classList.remove("hide");
        } else {
            item.classList.add("hide");
        }
    });
});

const submitButton = document.getElementById("finalize-list")
submitButton.addEventListener("submit", handleSubmit)