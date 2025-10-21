import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
console.log(supabase.auth.getSession());
console.log("User recognized:", user);

const lists = await fetch (`/cast-lists`);
const listsData = await lists.json();
console.log(listsData);

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
    charName.id = `char-${charElement.id}`
    const full_char_name = `${charElement.title ? charElement.title + ' ' : ''}
                    ${charElement.first_name ? charElement.first_name + ' ' : ''}
                    ${charElement.middle_name ? charElement.middle_name + ' ' : ''}
                    ${charElement.last_name ? charElement.last_name + ' ' : ''}
                    ${charElement.suffix ? charElement.suffix : ''}`;
    charName.innerHTML = full_char_name;
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

async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error);
    }
}

document.getElementById("sign-out").addEventListener("click", signOut);