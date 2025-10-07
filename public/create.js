document.addEventListener("DOMContentLoaded", async () => {
    // Get the list of shows
    const response = await fetch("/show");
    const data = await response.json();

    console.log(data);
    // Create the dropdown parent
    const parent = document.getElementById("show-dropdown");
    
    // Add each show to be selected
    data.forEach(element => {
        const item = document.createElement("option");
        console.log(element.title);
        item.value = element.id;
        item.innerHTML = element.title;
        parent.appendChild(item);
    });

    // When a show is selected, fetch the characters for that show
    parent.addEventListener("change", async (event) => {
        // Save the show id
        const showId = event.target.value;

        // Save the show title
        const showTitle = event.target.options[event.target.selectedIndex].text;
        document.getElementById("selected-show-title").innerText = showTitle
        console.log(showId);
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
});

async function createCharacterSelector(element, characterForm) {
    // Get all necessary values to format later
    const { first_name, middle_name, last_name, suffix, title } = element;

    // Create a new row for each character
    const label = document.createElement("label");
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
    
    // Create select for performers
    const select = document.createElement("select");
    select.name = `char-${element.id}`;
    select.id = `char-${element.id}`;

    // Append label to select form
    characterForm.appendChild(select);

    // Create the performer selector for this character
    createPerformerSelector(select.id, element.id);
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

            // Create a default option and set it
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.innerHTML = "Select a performer";
            parent.appendChild(defaultOption);

            // For each performer, create an option in the select dropdown
            data.forEach(element => {
                // Get name values we need
                const { first_name, middle_name, last_name } = element;

                // Create the element
                const option = document.createElement("option");

                // Format the full name
                const full_name = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`;

                // Set the option value to the performer_id
                option.value = element.id;

                // Set inner HTML
                option.innerHTML = `${full_name}`;

                // Append it to the parent element
                parent.appendChild(option);

                // See if user updates this at all
                parent.addEventListener('change', (e) => {
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

    const {data, error} = await supabase
        .from('cast_list')
        .insert([
            // Inital cast list needs cast_list_id, show_id, user_id, title, created_at
            {
                show_id: showId,
            }
        ])
}

async function setPerformerForChar(charId, perfId)
{

}