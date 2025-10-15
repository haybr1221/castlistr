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

    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            channel: "email"
        }
    });

    if (error) {
        console.error("Error sending OTP:", error);
        return;
    }

    return res.json({ message: "OTP sent!", data });
});

app.post("/auth/verify-otp", async (req, res) => {
    const { email, token } = req.body;

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
    });

    if (error) {
        console.error("Error verifying OTP:", error);
        return;
    }

    return res.json({ 
        message: "OTP verified",
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user,
        data });

});

app.get("/performer", async (req, res) => {
    const { data, error } = await supabase.from("performer").select("*");
    
    if (error) {
        console.error("Error fetching performers:", error);
        return res.status(500).json({ error: error.message || error });
    }
    return res.json(data);

});

app.get("/show", async (req, res) => {
    const { data, error } = await supabase
        .from("show")
        .select("*");
    
    if (error) {
        console.error("Error fetching shows:", error);
        return;
    }
    return res.json(data);
    
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

    if (error) { console.error("Error fetching characters:", error) }

    res.json(data);
});

app.get("/cast-lists", async (req, res) => {
    // Get cast lists
    const { data, error } = await supabase
        .from("cast_lists")
        .select(`
            *,
            show ( title ),
            cast_list_entry (
                id,
                character:character_id ( * ),
                performer:performer_id ( first_name, middle_name, last_name, id )
            )`)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching cast lists: ", error)
    }
    res.json(data);
})

app.get(`/cast-lists/:id`, async (req, res) => {
    // Get cast lists for a specific user
    const userId = req.params.id;

    const { data, error } = await supabase
        .from("cast_lists")
        .select(`*`)
        .eq("user_id", userId)

    if (error)
        console.error("Error fetching cast lists for USER_ID: ", userId, " - ", error);
    res.json(data);
})

app.get(`cast-lists/:id/cast-list-entry`, async (req, res) => {
    // Get entries for a given cast list
    const castListId = req.params.id;

    const { data, error } = await supabase
        .from("cast_list_entry")
        .select(`*`)
        .eq("cast_list_id", castListId)

    if (error)
        console.error("Error fetching cast list entries for CAST_LIST_ID: ", castListId, " - ")

    res.json(data)
})

app.get(`show`, async (req, res) => {
    // Get show title
    console.log("getting show id")
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("show")
        .select(`*`)
        .eq("id", showId)
    
    if (error)
        console.error("Error fetching show title: ", error)

    res.json(data)
})