import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

// Make sure the user is supposed to be here
// They should be, but just in case
const link = window.location.pathname.split("/");
const username = link[2]

// Get the user id for this user's profile
const userFetch = await fetch(`/user-id/${username}`)
const userData = await userFetch.json();
const userId = userData.id;

if (userId != user.id)
{
    // Assume not because the only way this could happen would be if they typed that url in
    window.location.href = "/home.html"
}

async function handleUpdate(e) {
    // When the user saves, update the information
    e.preventDefault();
    console.log("handling update")

    const newUsername = document.getElementById("username-input").value

    if (newUsername)
    {
        console.log("new username")
        // If it isn't null, update it
        // Don't worry about it if it's not

        const { error: usernameError } = await supabase
            .from("profile")
            .update({
                id: userId,
                username: newUsername
            })
            .eq("id", userId)

        if (usernameError) console.error(usernameError)
    }
}

document.getElementById("update").addEventListener("click", handleUpdate)