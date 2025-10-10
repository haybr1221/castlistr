import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://zanpecuhaoukjvjkvyxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbnBlY3VoYW91a2p2amt2eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTQ2NjcsImV4cCI6MjA3NDMzMDY2N30.vEu1tr9yYv-eAl6jB6oKHJmGVa70H-OBcTfGhfvcws0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendOtp() {
    console.log("Sending OTP...");
    const email = document.getElementById("email").value;
    
    const response = await fetch("http://localhost:3000/auth/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    // Display message in console
    console.log(data);

    // Hide sign in container and show OTP container
    console.log("Hiding sign-in, displaying OTP...");
    document.getElementById("sign-in-container").classList.add("hide");
    document.getElementById("sign-in-container").classList.remove("display-container");
    document.getElementById("otp-container").classList.remove("hide");
    document.getElementById("otp-container").classList.add("display-container");
}

async function verifyOtp() {
    console.log("Verifying OTP...");
    const givenEmail = document.getElementById("email");
    const givenOtp = document.getElementById("otp");

    const email = givenEmail ? givenEmail.value : "";
    const token = givenOtp ? givenOtp.value : "";

    console.log("Token for ", email, " is ", token);

    try {
        const response = await fetch("/auth/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, token })
        });

        console.log("Response: ", response);

        // attempt to parse JSON, but don't crash if it's empty
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("Verification failed:", data || response.statusText);
            if (msgEl) msgEl.innerText = (data && (data.error || data.message)) || 'Verification failed';
            return;
        }

        await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
        });

        console.log("Verification successful:", data);
        console.log("Tokens returned from verify endpoint:", data);
        // Redirect to home
        // window.location.href = '/home.html';
    } catch (err) {
        console.error("Network or parsing error:", err);
    }
}

document.getElementById("sign-in").addEventListener("click", sendOtp);
document.getElementById("verifyBtn").addEventListener("click", verifyOtp);