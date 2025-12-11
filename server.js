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
const { count } = require("console");

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
        .select("id, full_name")
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
    // The base call for shows

    const { data: showData, error: showError } = await supabase
        .from("show")
        .select("*", { count: "exact" })
        .order("title", { ascending: true })
    
    if (showError) console.error(showError);

        // Get cast list count
    const { data: castLists, error: castListError } = await supabase
        .rpc("get_list_counts")

    if (castListError) console.error(castListError);

    const countsByShowId = {}
    for (const row of castLists)
        countsByShowId[row.show_id] = row.list_count

    const showWithCounts = showData.map((show) => ({
        ... show,
        cast_list_count: countsByShowId[show.id] || 0
    }))

    res.json(showWithCounts)

});

app.get("/show-titles", async(req, res) => {
    // The call for shows 

    const { data, error } = await supabase
        .from("show")
        .select("id, title")
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

    // Get character info
    const { data: charData, error: charError } = await supabase
        .from("character")
        .select(`
            *,
            show_has_character!inner (show_id, char_id)`)
        .eq("show_has_character.show_id", showId);

    if (charError) {console.error("Error fetching for characters: ", charError)}

    // Get tour info
    const { data: tourData, error: tourError } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", showId)
        .order("opening", ascending = true)

    if (tourError) {console.error("Error fetching for tours: ", tourCount)}

    // Get cast list count
    const { count: castListCount, error: castListError } = await supabase
        .from("cast_lists")
        .select(`id`, {count: 'exact', head: true})
        .eq("show_id", showId);
    
    if (castListError) {console.error("Error fetching for show: ", castListError)}

    res.json({
        show,
        charData,
        tourData,
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
                performer:performer_id ( full_name, id )
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

app.get("/get-user/:username", async (req, res) => {
    const username = req.params.username;

    const { data, error } = await supabase
        .from("profile")
        .select('*')
        .eq("username", username)
        .single()

    if (error) console.error(error)

    res.json(data)
})

app.get("/get-likes/:user/:list", async (req, res) => {
    // Check if this user has liked this list
    const userId = req.params.user;
    const listId = req.params.list;

    try {
        const { data, error } = await supabase
        .from("user_likes")
        .select("id")
        .eq("user_id", userId)
        .eq("cast_list_id", listId)

        if (error) {
            console.error("Error checking like:", error)
            return res.status(500).json(false)
        }

        // data is an array; liked if there is at least one row
        const isLiked = Array.isArray(data) && data.length > 0
        return res.json(isLiked)
    } catch (err) {
        console.error("Unexpected error checking like:", err)
        return res.status(500).json(false)
    }
})

app.get("/liked-lists/:user", async (req, res) =>
{
    // Get all liked lists for this user
    const userId = req.params.user;
    try {
        // 1) Find liked cast_list IDs
        const { data: likeRows, error: likesError } = await supabase
        .from("user_likes")
        .select("cast_list_id")
        .eq("user_id", userId)

        if (likesError) {
        console.error("Error fetching liked ids:", likesError)
        return res.status(500).json([])
        }

        const ids = likeRows.map((row) => row.cast_list_id)
        if (ids.length === 0) {
        return res.json([]) // no liked lists
        }

        // 2) Fetch full cast list records matching those IDs
        const { data: lists, error: listsError } = await supabase
        .from("cast_lists")
        .select(`
            *,
            show ( title ),
            cast_list_entry (
            id,
            character:character_id ( * ),
            performer:performer_id ( full_name, id )
            )
        `)
        .in("id", ids)

        if (listsError) {
        console.error("Error fetching liked lists:", listsError)
        return res.status(500).json([])
        }

        return res.json(lists)
    } catch (err) {
        console.error("Unexpected error fetching liked lists:", err)
        return res.status(500).json([])
    }
})

app.get("/is-following/:currUser/:profId", async (req, res) => {
    // Check if the current user is following this user
    const currUser = req.params.currUser;
    const profId = req.params.profId;

    try {
        const { data, error } = await supabase
            .from("follow")
            .select("id")
            .eq("follower", currUser)
            .eq("following", profId)
    
        if (error) {
            console.error("Error checking following: ", error)
            return res.status(500).json(false)
        }
    
        const isFollowing = Array.isArray(data) && data.length > 0
        return res.json(isFollowing)
    }
    catch (err) {
        console.error("Unexpected error checking following:", err)
        return res.status(500).json(false)
    }
})