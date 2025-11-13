import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

// Make sure the user is supposed to be here
// They should be, but just in case
const link = window.location.pathname.split("/");
let username = link[2]

// Get the user id for this user's profile
const userFetch = await fetch(`/user-id/${username}`)
const userData = await userFetch.json();
const userId = userData.id;

// For avatar handling
let selectedFile;

if (userId != user.id)
{
    // Assume not because the only way this could happen would be if they typed that url in
    window.location.href = "/home.html"
}

function generateRandomFilename(originalFile) {
    const extension = originalFile.name.split('.').pop(); // get file extension
    const randomString = Math.random().toString(36).substring(2, 10); // 8-char random string
    return `poster_${randomString}.${extension}`;
}

async function handleUpdate(e) {
    // When the user saves, update the information
    e.preventDefault();

    const newUsername = document.getElementById("username-input").value
    const fileElement = document.getElementById("add-pfp-input").value

    if (newUsername)
    {
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

        // Redefine username so the redirect works the same
        username = newUsername;
    }

    if (fileElement)
    {
        const newFileName = generateRandomFilename(selectedFile);

        // Add the file to the bucket
        const { error } = await supabase.storage
            .from("User Profile Pictures")
            .upload(`${newFileName}`, selectedFile)

        // Get the URL of the new profile picture
        const { data: urlData } = supabase.storage
            .from("User Profile Pictures")
            .getPublicUrl(newFileName);

        // Add the new avatar URL to the user's row in the profiles table
        const { error: urlError } = await supabase
            .from("profile")
            .update({"avatar_url": urlData.publicUrl})
            .eq("id", user.id)

        if (urlError) console.error(urlError);
    }

    // Redirect
    window.location.href = `/users/${username}`
}

document.getElementById("update").addEventListener("click", handleUpdate)

// Get references for the avatar uploading
const inputButton = document.getElementById("add-pfp-input");
const selectButton = document.getElementById("select-button");

// Wait for a click on the select
selectButton.addEventListener("click", () => {
    // Trigger the upload
    inputButton.click();
})

// Trigger the upload process
inputButton.addEventListener("change", () => {
    selectedFile = inputButton.files[0];

    // Set the select to hide and upload to show
    selectButton.setAttribute("hidden", true);
})
