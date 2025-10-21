import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

// Get the id from the url
const searchParams = new URLSearchParams(window.location.search);
const showId = searchParams.get("id")

// Get the show info from the database
const showRes = await fetch(`/show/${showId}`);
const showData = await showRes.json()
console.log(showData);

// Update the poster and title from this data
const posterEl = document.getElementById("poster")
posterEl.src = showData.show.poster_url;
const titleEl = document.querySelector(".show-title")
titleEl.innerHTML = showData.show.title;

// Update the counts for cast lists, characters, and tours
const castListEl = document.getElementById("cast-list-count");
if (showData.castListCount)
{
    // If it is undefined, don't overwrite the base value
    castListEl.innerHTML = showData.castListCount;
}

const charEl = document.getElementById("character-count");
if (showData.charCount)
{
    // If it is undefined, don't overwrite the base value
    charEl.innerHTML = showData.charCount;
}

const tourEl = document.getElementById("tour-count");
if (showData.tours.count)
{
    // If it is undefined, don't overwrite the base value
    tourEl.innerHTML = showData.tours.count;
}

// Set up the characters //
// Fetch the character info
const charResponse = await fetch(`/show/${showId}/characters`);
const charData = await charResponse.json();
console.log("char data")
console.log(charData);

// Get the list to add to
const charList = document.getElementById("char-list")
charData.forEach(element => {
    addCharacter(element, charList)
});

function addCharacter(element, parent)
{
    // Create the list item
    const charEntry = document.createElement("li")
    charEntry.innerHTML = element.name
    parent.appendChild(charEntry)
}



// Hide characters/show tour and vice versa
const charTab = document.getElementById("characters")
const tourTab = document.getElementById("tours")
const tourElement = document.getElementById("tour-info");
const charElement = document.getElementById("character-info");

function toggleShownTab() {
    // Check which is still hidden
    if (tourElement.className == "hidden")
    {
        // Tour is hidden, so remove that class and add it to character-info
        tourElement.classList.remove("hidden");
        tourElement.classList.add("info-tab");
        tourTab.classList.add("selected-tab");
        
        // Hide char tab
        charTab.classList.remove("selected-tab");
        charElement.classList.remove("info-tab");
        charElement.classList.add("hidden");
    }
    else
    {
        // Char is hidden, so show that instead
        charElement.classList.remove("hidden");
        charElement.classList.add("info-tab");
        charTab.classList.add("selected-tab");
        
        // Hide tour element
        tourElement.classList.add("hidden");
        tourElement.classList.remove("info-tab");
        tourTab.classList.remove("selected-tab");
    }
}

charTab.addEventListener("click", toggleShownTab)
tourTab.addEventListener("click", toggleShownTab)