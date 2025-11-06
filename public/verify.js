import { supabase } from './supabaseclient.js';

async function sendOtp() {
    console.log("Sending OTP...");
    const email = document.getElementById("email").value;
    
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
        console.error("Error sending OTP:", error.message);
    } else {
        console.log("OTP sent to", email);
            
        // Hide sign in container and show OTP container
        console.log("Hiding sign-in, displaying OTP...");
        document.getElementById("sign-in-container").classList.add("hide");
        document.getElementById("sign-in-container").classList.remove("display-container");
        document.getElementById("otp-container").classList.remove("hide");
        document.getElementById("otp-container").classList.add("display-container");
    }
}

async function verifyOtp() {
    const email = document.getElementById("email").value;
    const token = document.getElementById("otp").value;

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
    });

    if (error) {
        console.error("OTP verification failed:", error.message);
    } else {
        console.log("User logged in:", data.user);
        window.location.href = "/home.html";
    }
}

document.getElementById("sign-in").addEventListener("click", sendOtp);
document.getElementById("verifyBtn").addEventListener("click", verifyOtp);