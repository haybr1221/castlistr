import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("Current user: ", user)

// Get the slug from the url
const slug = window.location.pathname.split("/").pop();

// Get the showId 
const fetchId = await fetch(`/show-id/${slug}`);
const jsonId = await fetchId.json();
const showId = jsonId.id;

// Get the show info from the database
const showRes = await fetch(`/show-info/${slug}`);
const showData = await showRes.json()

// Update the poster and title from this data
const titleEl = document.querySelector(".show-title");
titleEl.innerHTML = showData.show.title;
const posterEl = document.getElementById("poster");

if (showData.show.poster_url)
    // If a poster exists, display that
    posterEl.src = showData.show.poster_url;
else
{
    let selectedFile;
    // If it doesn't, display the input field to upload one
    document.getElementById("add-poster").removeAttribute("hidden");
    document.getElementById("add-poster").id = "add-poster-shown"
    document.getElementById("poster").setAttribute("hidden", true);

    // Get a random filename
    function generateRandomFilename(originalFile) {
        const extension = originalFile.name.split('.').pop(); // get file extension
        const randomString = Math.random().toString(36).substring(2, 10); // 8-char random string
        return `poster_${randomString}.${extension}`;
    }

    // Define handle upload function
    const handleUpload = async (e) => {
        e.preventDefault();

        // Get a random filename
        const newFileName = generateRandomFilename(selectedFile);

        const { error } = await supabase
            .storage
            .from("posters")
            .upload(`${newFileName}`, selectedFile)

        if (error) console.error(error);

        const { data: urlData } = supabase
            .storage
            .from("posters")
            .getPublicUrl(newFileName);

        const url = urlData.publicUrl

        const { urlError } = await supabase
            .from("show")
            .update({"poster_url": url})
            .eq("id", showId)

        if (urlError) console.log(urlError);
    }

    // Get references
    const inputButton = document.getElementById("add-poster-input");
    const uploadButton = document.getElementById("upload-button");
    const selectButton = document.getElementById("select-button");
    
    selectButton.addEventListener("click", () => {
        inputButton.click();
    })
    
    inputButton.addEventListener("change", () => {
        selectedFile = inputButton.files[0];

        // Set select to hide and upload to show
        selectButton.setAttribute("hidden", true);
        uploadButton.removeAttribute("hidden");
    });

    uploadButton.addEventListener("click", handleUpload);
}

// Show characters and tours
setCharacters();
setTours();

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

async function setCharacters()
    // Set up the characters //
{
    // Clear the current elements in case of reset
    document.getElementById("char-list").innerHTML = "";

    // Fetch the character info
    const charResponse = await fetch(`/show/${showId}/characters`);
    const charData = await charResponse.json();

    // Get the list to add to
    const charList = document.getElementById("char-list")
    charData.forEach(element => {
        addCharacter(element, charList)
    });
}

function addCharacter(element, parent)
{
    // Create the list item
    const charEntry = document.createElement("li")
    charEntry.innerHTML = element.name
    parent.appendChild(charEntry)
}

async function setTours()
// Set up tours // 
{
    document.getElementById("tour-list").innerHTML = "";

    // Fetch the tour info
    const tourResponse = await fetch(`/tour/${showId}`);
    const tourData = await tourResponse.json();

    // Get the the list to add to
    const tourList = document.getElementById("tour-list")
    tourData.forEach(element => {
        addTour(element, tourList)
    })
}

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

    // Check if closing exists, it might be null
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

document.getElementById("new-char").addEventListener("click", openModal);
document.getElementById("new-tour").addEventListener("click", openModal);

function openModal() {
    document.getElementById("overlay").removeAttribute("hidden");
    document.body.style.overflow = "hidden";

    const selectedTab = document.querySelector(".selected-tab")

    if (selectedTab.id === "characters")
    {
        // Characters is open
        document.getElementById("add-character").removeAttribute("hidden");
    }
    else
    {
        // Tours is open
        document.getElementById("add-tour").removeAttribute("hidden");
    }
}

function closeModal() {
    document.body.style.overflow = "auto";
    document.getElementById("overlay").setAttribute("hidden", true);

    const selectedTab = document.querySelector(".selected-tab")

    if (selectedTab.id === "characters")
    {
        document.getElementById("add-character").setAttribute("hidden", true);
    }
    else
    {
        document.getElementById("add-tour").setAttribute("hidden", true);
    }
}

// Creating new stuff
const createChar = async (e, isMultiple) => {
    // Create just one
    e.preventDefault();
    const name = document.getElementById("char-name");

    const { data, error: charError } = await supabase
        .from("character")
        .insert([
            {
                name: name.value,
                user_id: user.id
            }
        ]).select()

    if (charError) console.error(charError);

    console.log()
    // Get ID of new character to add to the show table
    const charId = data[0].id;

    const { error: showCharError } = await supabase
        .from("show_has_character")
        .insert([
            {
                show_id: showId,
                char_id: charId,
                user_id: user.id
            }
        ])

    if (showCharError) console.error(showCharError);

    if (isMultiple)
    {
        // Display a message so they know the last one went through
        document.querySelector("#char-form #success-message").innerHTML = `Success! ${name.value} can now be used in lists.`

        // Reset the form for the next
        name.value = "";

        // Exit function
        return;
    }

    // Close modal and refresh page
    closeModal();
    setCharacters();
}

const createTour = async (e, isMultiple) => {
    e.preventDefault();
    const name = document.getElementById("tour-name");
    const opening = document.getElementById("opening-date");
    const closing = document.getElementById("closing-date");

    // Create an object with everything so far
    const newTour = {
        title: name.value,
        opening: opening.value,
        show_id: showId,
        user_id: user.id
    }

    // Since some tours may still be open, value may be null
    // Hanlde it accorddingly
    if (closing.value)
    {
        newTour.closing = closing.value;
    }

    const { error } = await supabase
        .from("tour")
        .insert([newTour])

    if (error) console.error(error);

    if (isMultiple)
    {
        // Display a message so they know the last one went through
        document.querySelector("#tour-form #success-message").innerHTML = `Success! ${name.value} has been added to the database.`

        // Reset the form for the next
        name.value = "";

        // Exit function
        return;
    }

    // Close modal and refresh page
    closeModal();
    setTours();
}

// Close modal 
document.querySelectorAll(".cancel").forEach(el => {
    el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// Buttons for character creation
document.querySelector("#char-form #button-box #create-btn").addEventListener("click", (e) => createChar(e, false));
document.querySelector("#char-form #button-box  #create-create-another").addEventListener("click", (e) => createChar(e, true));

// Buttons for tour creation
document.querySelector("#tour-form #button-box #create-btn").addEventListener("click", (e) => createTour(e, false));
document.querySelector("#tour-form #button-box  #create-create-another").addEventListener("click", (e) => createTour(e, true));

// Hide characters/show tour and vice versa
const charTab = document.getElementById("characters")
const tourTab = document.getElementById("tours")
const tourElement = document.getElementById("tour-info");
const charElement = document.getElementById("character-info");

function toggleShownTab() {
    // Check which is still hidden
    if (tourElement.hidden)
    {
        // Tour is hidden, so remove that class and add it to character-info
        tourElement.removeAttribute("hidden");
        tourElement.classList.add("info-tab");
        tourTab.classList.add("selected-tab");
        
        // Hide char tab
        charTab.classList.remove("selected-tab");
        charElement.classList.remove("info-tab");
        charElement.setAttribute("hidden", true);
    }
    else
    {
        // Char is hidden, so show that instead
        charElement.removeAttribute("hidden");
        charElement.classList.add("info-tab");
        charTab.classList.add("selected-tab");
        
        // Hide tour element
        
        tourElement.setAttribute("hidden", true);
        tourElement.classList.remove("info-tab");
        tourTab.classList.remove("selected-tab");
    }
}

charTab.addEventListener("click", toggleShownTab);
tourTab.addEventListener("click", toggleShownTab);