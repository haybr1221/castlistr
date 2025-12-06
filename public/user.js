import { supabase } from './supabaseclient.js';

const { data: { user } } = await supabase.auth.getUser();
console.log("User recognized:", user);

const username = window.location.pathname.split("/").pop();

// Add username to the respective field
document.getElementById("username").innerHTML = username;

// Get the user information for this user's profile
const userFetch = await fetch(`/get-user/${username}`)
const userData = await userFetch.json();
console.log(userData)
const userId = userData.id;

// Add their profile picture, if they have it
if (userData.avatar_url)
{
    document.getElementByClassName("avatar").src = userData.avatar_url;
}

// Change the button //
const button = document.getElementById("button")

// If the user matches the current user, the button should be "Edit Profile"
// userId is defined before, and user.id is defined when the client is initialized.
if (userId == user.id)
{
    // They match, so display "Edit Profile" and redirect to the respective page
    button.innerHTML = "Edit Profile"
    button.href = `/users/${username}/edit-profile`
}

// If the user does not match the current user, and is not following the user, the button should be "Follow"
// If the user does not match the current user and is following the user, the button should be "Unfollow"

// Change what is being shown // 
const listsLabel = document.getElementById("lists")
const listsTab = document.getElementById("user-lists")
const likedLabel = document.getElementById("liked")
const likedTab = document.getElementById("user-likes");

function toggleShownTab()
{
    if (likedTab.hidden)
    {
        // Liked is hidden, so unhide it
        listsLabel.classList.remove("selected-tab");
        listsTab.setAttribute("hidden", true);
        listsTab.classList.remove("shown-lists")
        likedLabel.classList.add("selected-tab");
        likedTab.removeAttribute("hidden")
        likedTab.classList.add("shown-lists")
    }
    else
    {
        // Lists is hidden, so unhide it
        likedLabel.classList.remove("selected-tab");
        likedTab.classList.remove("shown-lists")
        likedTab.setAttribute("hidden", true);
        listsLabel.classList.add("selected-tab");
        listsTab.removeAttribute("hidden")
        listsTab.classList.add("shown-lists")
    }
}

listsLabel.addEventListener("click", toggleShownTab);
likedLabel.addEventListener("click", toggleShownTab);