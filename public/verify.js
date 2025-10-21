import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

const supabase = createClient(supabaseUrl, supabaseKey);

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
        type: "magiclink" // or 'email' depending on your setup
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