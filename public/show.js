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
    if (showData.castListCount == 1)
        // Display properly
        castListEl.innerHTML = `${showData.castListCount} Cast List`;
    else
        castListEl.innerHTML = `${showData.castListCount} Cast Lists`;
}

const charEl = document.getElementById("character-count");
if (showData.charCount)
{
    // If it is undefined, don't overwrite the base value
    charEl.innerHTML = showData.charCount;
}

const tourEl = document.getElementById("tour-count");
if (showData.tourCount)
{
    // If it is undefined, don't overwrite the base value
    tourEl.innerHTML = showData.tourCount;
}

// Set up the characters //
// Fetch the character info
const charResponse = await fetch(`/show/${showId}/characters`);
const charData = await charResponse.json();

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

// Set up tours // 
// Fetch the tour info
const tourResponse = await fetch(`/tour/${showId}`)
const tourData = await tourResponse.json()
console.log(tourData)

// Get the the list to add to
const tourList = document.getElementById("tour-list")
tourData.forEach(element => {
    addTour(element, tourList)
})

function addTour(element, parent)
{
    // Create the list item
    const tourEntry = document.createElement("li");
    tourEntry.className = "tour-info";
    parent.appendChild(tourEntry);

    // Create the div for title
    const tourTitleDiv = document.createElement("div");
    tourTitleDiv.className = "tour-title";
    tourEntry.appendChild(tourTitleDiv);

    // Add the title to the title div
    const tourTitle = document.createElement("p");
    tourTitle.innerHTML = element.title;
    tourTitleDiv.appendChild(tourTitle);

    // Create the div for the date
    const tourDate = document.createElement("div");
    tourEntry.appendChild(tourDate);

    // Create the label for opening
    const openingDate = document.createElement("p")
    openingDate.className = "date-label";
    openingDate.innerHTML = `Opened: <span class="opening-date" datetime=${element.opening}>${formatDate(element.opening)}</span>`;
    tourDate.appendChild(openingDate);

    // Check if closing exists, it might be
    if (element.closing)
    {
        const closingDate = document.createElement("p");
        closingDate.className = "date-label";
        closingDate.innerHTML = `Closed: <span class="closing-date" datetime=${element.closing}>${formatDate(element.closing)}</span>`;
        tourDate.appendChild(closingDate);
    }
}

function formatDate(date) {
    const [year, month, day] = date.split("-");
    const formatedDate = new Date(year, month - 1, day);
    return formatedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
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