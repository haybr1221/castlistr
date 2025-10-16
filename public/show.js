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