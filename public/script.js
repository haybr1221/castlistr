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

        console.log("Verification successful:", data);
        // Redirect to home
        window.location.href = '/home.html';
    } catch (err) {
        console.error("Network or parsing error:", err);
    }
}

async function signOut() {
    const { error } = await supabase.auth.signOut()
}

document.getElementById("sign-in").addEventListener("click", sendOtp);
document.getElementById("verifyBtn").addEventListener("click", verifyOtp);
document.getElementById("sign-out").addEventListener("click", signOut);