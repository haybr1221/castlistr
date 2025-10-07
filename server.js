console.log("Server is alive!")
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

const path = require("path");
const { create } = require("domain");

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
                channel: "email"
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
            type: "email"
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

app.get("/performer", async (req, res) => {
    try {
        const { data, error } = await supabase.from("performer").select("*");
        
        if (error) {
            console.error("Error fetching performers:", error);
            return res.status(500).json({ error: error.message || error });
        }
        return res.json(data);
    }
    catch (err) {
        console.error("Unexpected error fetching performers:", err);
    }
});

app.get("/show", async (req, res) => {
    try {
        const { data, error } = await supabase.from("show").select("*");
        
        if (error) {
            console.error("Error fetching shows:", error);
            return res.status(500).json({ error: error.message || error });
        }
        return res.json(data);
    }
    catch (err) {
        console.error("Unexpected error fetching shows:", err);
    }
});

app.get(`/show/:id/characters`, async (req, res) => {
    // Get the characters for a specific show
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("character")
        .select(`
            *,
            show_has_character!inner (show_id, char_id)`)
        .eq("show_has_character.show_id", showId);

    console.log(data)
    if (error) { console.error("Error fetching characters:", error) }

    res.json(data);
});

app.set("/cast-lists", async (req, res) => {
    
});