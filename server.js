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

app.get("/performer", async (req, res) => {
    // The base performer call for creating lists
    const { data, error } = await supabase
        .from("performer")
        .select("*")
        .order("last_name", { ascending: true });
    
    if (error) {
        console.error("Error fetching performers:", error);
        return res.status(500).json({ error: error.message || error });
    }
    return res.json(data);

});

app.get("/show-pagination", async (req, res) => {
    // The show call with pagination for displaying the show page
    const page = parseInt(req.query.page) || 1
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    const search = req.query.search || ""

    let query = supabase
        .from("show")
        .select("*", { count: "exact" })
        .order("title", { ascending: true })

    if (search) {
        // If there is a search paramater, use it!
        query = query.ilike("title", `%${search}%`);
    }
    
    const { data, error, count } = await query.range(start, end);
    
    if (error) {
        console.error("Error fetching shows:", JSON.stringify(error, null, 2));
        return;
    }

    return res.json({data, page, totalPages: Math.ceil(count / perPage), totalItems: count});
    
});

app.get("/show", async(req, res) => {
    // The base call for shows for creating lists

    const { data, error } = await supabase
        .from("show")
        .select("*", { count: "exact" })
        .order("title", { ascending: true })

    if (error) console.error(error);

    res.json(data)

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

app.get(`/show/:slug`, async (req, res) => {
    // Set up the html file for a show
    res.sendFile(path.resolve("public", "show.html"))
});

app.get(`/show-info/:slug`, async (req, res) => {
    // Get information from a given show
    const slug = req.params.slug;

    // Get show info
    const { data: show, error: showError } = await supabase
        .from("show")
        .select(
            `*`
        )
        .eq("slug", slug)
        .single()

    if (showError) {console.error("Error fetching for show: ", showError)}

    const showId = show.id;

    // Get character info and count
    const { count: charCount, error: charError } = await supabase
        .from("show_has_character")
        .select(`show_id`, { count: 'exact', head: false})
        .eq("show_id", showId);

    if (charError) {console.error("Error fetching for characters: ", charError)}

    // Get tour info and count
    const { count: tourCount, error: tourError } = await supabase
        .from("tour")
        .select(`*`, { count: 'exact', head: false})
        .eq("show_id", showId);

    if (tourError) {console.error("Error fetching for tours: ", tourCount)}

    // Get cast list count
    const { count: castListCount, error: castListError } = await supabase
        .from("cast_lists")
        .select(`id`, {count: 'exact', head: true})
        .eq("show_id", showId);
    
    if (castListError) {console.error("Error fetching for show: ", castListError)}

    res.json({
        show,
        charCount,
        tourCount,
        castListCount
    });
})

app.get(`/tour/:id`, async (req, res) => {
    // Get tour info
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", showId)
        .order("opening", ascending = true)

    if (error) console.error("Error fetching tours: ", error)
    
    res.json(data)
})

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

    if (error) console.error("Error fetching cast lists: ", error)

    res.json(data);
})

app.get(`/cast-lists/:id`, async (req, res) => {
    // Get cast lists for a specific user
    const userId = req.params.id;

    const { data, error } = await supabase
        .from("cast_lists")
        .select(`
            *,
            show ( title ),
            cast_list_entry (
                id,
                character:character_id ( * ),
                performer:performer_id ( * )
            )`)
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
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("show")
        .select(`*`)
        .eq("id", showId)
    
    if (error)
        console.error("Error fetching show title: ", error)

    res.json(data)
})

app.get("/user-cast-lists/:id", async (req, res) => {
    // Get the data of a user's cast lists
    const userId = req.params.id;

    // Get all data to display
    const { data, error } = await supabase
        .from("cast_lists")
        .select(`*`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) console.error(error);

    res.json(data);
})

app.get("/show-id/:slug", async (req, res) => {
    // Get the id from the slug
    const slug = req.params.slug;

    const { data, error } = await supabase
        .from("show")
        .select("id")
        .eq("slug", slug)
        .single()

    if (error) console.error(error);

    res.json(data);
})

app.get("/get-profile/:id", async (req, res) => {
    const userId = req.params.id;

    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single()

    if (error) console.error(error);

    res.json(data)
})

app.get("/profiles", async (req, res) => {

    const { data, error } = await supabase
        .from("users")
        .select("*")

    if (error) console.error(error)

    res.json(data)
})

app.get("/user-id/:username", async (req, res) => {
    const username = req.params.username;

    const { data, error } = await supabase
        .from("profile")
        .select('id')
        .eq("username", username)
        .single()

    if (error) console.error(error)

    res.json(data)
})

app.get("/shows/:slug", (req, res) => {
    res.sendFile(path.resolve("public", "show.html"))
})

app.get("/users/:user", (req, res) => {
    res.sendFile(path.resolve("public", "user.html"))
})

app.get("/users/:user/edit-profile", (req, res) => {
    res.sendFile(path.resolve("public", "edit-profile.html"))
})