import { supabase } from './supabaseclient.js';

async function signOut() {
    console.log("clicked");
    const { error } = await supabase.auth.signOut()
    
    if (error) {
        console.error(error);
    }

    await supabase.auth.signOut()

    window.location.href = "/index.html";
}

document.getElementById("sign-out").addEventListener("click", signOut);