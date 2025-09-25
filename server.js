console.log("Server is alive!")
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

const path = require("path");

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log("Server running on http://localhost:3000");
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());

app.post("/auth/send-otp", async (req, res) => { 
    const { email } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).json({ error: error.message || error });
        }

        return res.json({ message: "OTP sent!", data });
    } catch (err) {
        console.error("Unexpected error sending OTP:", err);
        return res.status(500).json({ error: err.message || String(err) });
    }
});

app.post("/auth/verify-otp", async (req, res) => {
    const { email, token } = req.body;
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "magiclink"
        });

        if (error) {
            console.error("Error verifying OTP:", error);
            return res.status(400).json({ error: error.message || error });
        }

        return res.json({ message: "OTP verified", data });
    } catch (err) {
        console.error("Unexpected error verifying OTP:", err);
        return res.status(500).json({ error: err.message || String(err) });
    }
});