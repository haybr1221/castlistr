async function sendOtp() {
    const email = document.getElementById("email").value;
    
    const response = await fetch("http://localhost:3000/auth/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    // Display message for user
    console.log(data);
    document.getElementById("welcomeMsg").innerText = data.message || data.error;
}

async function verifyOtp() {
    console.log("Verifying OTP...");
    const email = document.getElementById("email").value;
    const token = document.getElementById("otp").value;
    console.log("Code: ", token)
    
    const response = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, token })
    });

    console.log("Response: ", response)
    
    const data = await response.json();
    console.log(data)
    document.getElementById("verifiedMsg").innerText = data.message || data.error;
}

document.getElementById("signInBtn").addEventListener("click", sendOtp);
document.getElementById("verifyBtn").addEventListener("click", verifyOtp);