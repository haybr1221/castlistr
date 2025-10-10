import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: { user } } = await supabase.auth.getUser();
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
    console.log("formatting for ", element.id);
    
    // Set up a div for this list
    const parentDiv = document.createElement("div");
    parentDiv.id = `cast-list-${element.id}`;
    feedDiv.appendChild(parentDiv);

    // TODO: Get show title to display
    // const showResponse = await fetch(`show/${element.show_id}`);
    // const showData = await showResponse.json();

    // TODO: Get user's name to display

    // TODO: Display the title of the list
    // "[username]'s cast list for [show]"
    // Get the entries for this list

    const castListEntriesResponse = await fetch(`cast-list-entry/${element.id}`)
    const castListEntries = await castListEntriesResponse.json();
    console.log(castListEntries)
        // Get the character list
    const charResponse = await fetch(`/show/${showId}/characters`)


    // Inner container will have the names for each person
    
    // Need: list title, user's name, show title, character name, performer name
}

async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error);
    }
}

document.getElementById("sign-out").addEventListener("click", signOut);