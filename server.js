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

/**
 * GET /performer
 * Returns performer information (id, full name, slug)
 * USED BY: Create, EditCastList
 */
app.get("/performer", async (req, res) => {
    const { data, error } = await supabase
        .from("performer")
        .select("id, full_name, slug")
        .order("last_name", { ascending: true });
    
    if (error) {
        console.error("Error fetching performers:", error);
        return res.status(500).json({ error: error.message || error });
    }

    res.json(data)
});

/**
 * GET /performer-pagination
 * Returns performer information in pages
 * USED BY: Performers
 */
app.get("/performer-pagination", async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const perPage = 15; 
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    const search = req.query.search || ""

    let query = supabase
        .from("performer")
        .select("*", { count: "exact" })
        .order("last_name", { ascending: true })

    if (search) {
        // if there is a search paramater, use it!
        query = query.ilike("full_name", `%${search}%`);
    }
    
    const { data: perfData, error: perfError, count } = await query.range(start, end);
    
    if (perfError) {
        console.error("Error fetching performer pages:", perfError);
        return res.status(500).json({error: "Failed to fetch performers."});
    }

    // Get cast list count
    const { data: castLists, error: castListError } = await supabase
        .rpc("get_performer_list_counts")

    if (castListError) {
        console.error("Error fetching counts for performers: ", castListError);
        return res.status(500).json({error: "Failed to fetch cast list counts for performers."})
    }

    const countsByPerfId = {}
    for (const row of castLists) {
        countsByPerfId[row.performer_id] = row.list_count
    }

    const perfWithCounts = perfData.map((perf) => ({
        ... perf,
        cast_list_count: countsByPerfId[perf.id] || 0
    }))

    return res.json({
        perfWithCounts, 
        page, 
        totalPages: Math.ceil(count / perPage),
        totalItems: count});
});

/**
 * GET /show-pagination
 * Returns show information in pages
 * USED BY: Shows
 */
app.get("/show-pagination", async (req, res) => {
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
        // if there is a search paramater, use it!
        query = query.ilike("title", `%${search}%`);
    }
    
    const { data: showData, error: showError, count } = await query.range(start, end);
    
    if (showError) {
        console.error("Error fetching show pages:", showError);
        return res.status(500).json({error: "Failed to fetch shows."});
    }

    // Get cast list count
    const { data: castLists, error: castListError } = await supabase
        .rpc("get_show_list_counts")

    if (castListError) {
        console.error("Error fetching counts for shows: ", castListError);
        return res.status(500).json({error: "Failed to fetch cast list counts for shows."})
    }

    const countsByShowId = {}
    for (const row of castLists) {
        countsByShowId[row.show_id] = row.list_count
    }

    const showWithCounts = showData.map((show) => ({
        ... show,
        cast_list_count: countsByShowId[show.id] || 0
    }))

    return res.json({
        showWithCounts, 
        page, 
        totalPages: Math.ceil(count / perPage), 
        totalItems: count});
});

/**
 * GET /show-titles
 * Returns show titles in pages
 * USED BY: ShowDropdown
 */
app.get("/show-titles", async(req, res) => {
    const { data, error } = await supabase
        .from("show")
        .select("id, title")
        .order("title", { ascending: true })
    
    if (error) {
        console.error("Error fetching show titles: ", error);
        return res.status(500).json({error: "Failed to fetch show titles."})
    }

    res.json(data)
});

/**
 * GET /show/:id/characters
 * Returns characters for a given show
 * USED BY: AddRoleModal, Create, EditCastList
 */
app.get(`/show/:id/characters`, async (req, res) => {
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("character")
        .select(`
            *,
            show_has_character!inner (show_id, char_id)`)
        .eq("show_has_character.show_id", showId);

    if (error) {
        console.error("Error fetching shows: ", error);
        return res.status(500).json({error: "Failed to fetch shows."})
    }

    res.json(data);
});

/**
 * GET /show-info/:slug
 * Returns show info for a specific show
 * USED BY: Show
 */
app.get(`/show-info/:slug`, async (req, res) => {
    const slug = req.params.slug;

    const { data: show, error: showError } = await supabase
        .from("show")
        .select(
            `*`
        )
        .eq("slug", slug)
        .single()

    if (showError) {
        console.error("Error fetching information for show: ", showError);
        return res.status(500).json({error: "Failed to fetch for show."})
    }

    // Get character info for this show
    const { data: charData, error: charError } = await supabase
        .from("character")
        .select(`
            *,
            show_has_character!inner (show_id, char_id)`)
        .eq("show_has_character.show_id", show.id);

    if (charError) {
        console.error("Error fetching character information: ", charError);
        return res.status(500).json({error: "Failed to fetch character information."})
    }

    // Get tour info for this show
    const { data: tourData, error: tourError } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", show.id)
        .order("opening", ascending = true)

    if (tourError){
        console.error("Error fetching tour information: ", tourError);
        return res.status(500).json({error: "Failed to fetch tour information."})
    }

    // Get the count for cast lists this show has
    const { count: castListCount, error: castListError } = await supabase
        .from("cast_lists")
        .select(`id`, {count: 'exact', head: true})
        .eq("show_id", show.id);
    
    if (castListError) {
        console.error("Error fetching cast list count: ", castListError);
        return res.status(500).json({error: "Failed to fetch cast list count."})
    }

    res.json({
        show,
        charData,
        tourData,
        castListCount
    });
})

/**
 * GET /tour/:id
 * Returns information on a given tour
 * USED BY: AddRoleModal
 */
app.get(`/tour/:id`, async (req, res) => {
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", showId)
        .order("opening", ascending = true)

    if (error) {
        console.error("Error fetching tour information: ", error);
        return res.status(500).json({error: "Failed to fetch tour information."})
    }

    res.json(data)
})

/**
 * GET /cast-lists
 * Returns cast lists
 * USED BY: Home
 */
app.get("/cast-lists", async (req, res) => {
    const { data, error } = await supabase
        .from("cast_lists")
        .select(`
            *,
            show ( title ),
            cast_list_entry (
                id,
                character:character_id ( * ),
                performer:performer_id ( full_name, id, headshot_url )
            ),
            user_comments ( * )`)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching cast lists: ", error);
        return res.status(500).json({error: "Failed to fetch cast list information."})
    }

    res.json(data);
})

/**
 * GET /cast-lists/:userId
 * Returns a user's cast lists
 * USED BY: Home, Profile
 */
app.get(`/cast-lists/:userId`, async (req, res) => {
    const userId = req.params.userId;

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
        .order("is_pinned", {ascending: false})
        .order("created_at", {ascending: false})

    if (error) {
        console.error("Error fetching character information: ", error);
        return res.status(500).json({error: "Failed to fetch cast list information."})
    }

    res.json(data);
})

/**
 * GET /get-list/:id
 * Returns every information for a specific cast list
 * USED BY: CastList, EditCastList
 */
app.get("/get-list/:id", async (req, res) => {
    const listId = req.params.id;

    const { data, error } = await supabase
        .from("cast_lists")
        .select(`
            *,
            show ( title, id ),
            cast_list_entry (
                id,
                character:character_id ( * ),
                performer:performer_id ( full_name, id, headshot_url )
            ),
            profile:user_id ( username, avatar_url )
            )`)
        .eq("id", listId)
        .single()

    if (error) {
        console.error("Error fetching cast list information for ", listId, " - ", error)
        return res.status(500).json({error: "Failed to fetch cast list."})
    }

    res.json(data)
})

/**
 * GET /get-profile/:id
 * Returns a user's profile from their ID
 * USED BY: DisplayCastList, DisplayComment
 */
app.get("/get-profile/:id", async (req, res) => {
    const userId = req.params.id;

    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single()

    if (error) {
        console.error("Error fetching profile for ", userId, " - ", error)
        return res.status(500).json({error: "Failed to fetch profile."})
    }

    res.json(data)
})

/**
 * GET /performer/by-slug/:slug
 * Returns performer information by slug
 * USED BY: Performer
 */
app.get("/performer/by-slug/:slug", async (req, res) => {
    const slug = req.params.slug;

    const { data: performer, error } = await supabase
        .from("performer")
        .select("*")
        .eq("slug", slug)
        .single()
    
    if (error) {
        console.error("Error fetching performer information: ", error)
        return res.status(500).json({error: "Failed to fetch performer information."})
    }

    // Get cast list count for this performer
    const { count: castListCount, error: castListError } = await supabase
        .from("cast_list_entry")
        .select("cast_list_id", { count: "exact", head: true, distinct: true })
        .eq("performer_id", performer.id);
    
    if (castListError) {
        console.error("Error fetching for castListCount: ", castListError)
        return res.status(500).json({error: "Failed to fetch castListCount."})
    }

    res.json({
        ...performer,
        castListCount
    })
})

/**
 * GET /roles/:id
 * Returns roles for a given performer
 * USED BY: Performer
 */
app.get("/roles/:id", async (req, res) => {
    const id = req.params.id;

    const { data, error } = await supabase
        .from("performer_has_character")
        .select(`
            *,
            character ( name ),
            tour (
                *,
                show:show_id ( * )
            )`)
        .eq("performer_id", id)

    if (error) {
        console.error("Error fetching roles for ", id, " : ", error)
        return res.status(500).json({error: "Failed to fetch castListCount."})
    }

    res.json(data);
})

/**
 * GET /roles/single/id
 * Returns a single role for a performer
 * USED BY: Performer
 */
app.get("/roles/single/:id", async (req, res) => {
    const id = req.params.id

    const { data, error } = await supabase
        .from("performer_has_character")
        .select(`
            *,
            character ( name ),
            tour (
                *,
                show:show_id ( * )
            )
        `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching role for ", id, " : ", error)
        return res.status(500).json({error: "Failed to fetch role."})
    }

    res.json(data)
})

/**
 * GET /get-user/:username
 * Returns a user from a given username
 * USED BY: Profile
 */
app.get("/get-user/:username", async (req, res) => {
    const username = req.params.username;

    const { data, error } = await supabase
        .from("profile")
        .select('*')
        .eq("username", username)
        .single()

    if (error) {
        console.error("Error fetching user: ", error)
        return res.status(500).json({error: "Failed to fetch user."})
    }

    res.json(data)
})

/**
 * GET /get-likes/:user/:list
 * Returns if a user has liked a given list
 * USED BY: DisplayCastList
 */
app.get("/get-likes/:user/:list", async (req, res) => {
    const userId = req.params.user;
    const listId = req.params.list;

    const { data, error } = await supabase
        .from("user_likes")
        .select("id")
        .eq("user_id", userId)
        .eq("cast_list_id", listId)

    if (error) {
        console.error("Error checking like:", error)
        return res.status(500).json(false, { error: "Failed to fetch user likes." })
    }

    // since data returns an array, if it is more than one, it is true
    const isLiked = Array.isArray(data) && data.length > 0

    return res.json(isLiked)
})

/**
 * GET /liked-lists/:user
 * Returns a given user's liked lists
 * USED BY: Profile
 */
app.get("/liked-lists/:user", async (req, res) => {
    const userId = req.params.user;

    // First, get the cast list IDs from user_likes
    const { data: likedRows, error: likedError } = await supabase
        .from("user_likes")
        .select("cast_list_id")
        .eq("user_id", userId)

    if (likedError) {
        console.error("Error fetching liked IDs:", likedError)
        return res.status(500).json([],{ error: "Failed to fetch liked IDs."})
    }

    // Next, map likedRows to a new object for simplicity
    const ids = likedRows.map((row) => row.cast_list_id)

    if (ids.length === 0) {
        return res.json([]) // no liked lists
    }

    // Then, fetch full cast list data for those lists in ids
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
        return res.status(500).json([], { error: "Failed to fetch liked lists." })
    }

    return res.json(lists)
})

/**
 * GET /is-following/:currUser/:profId
 * Returns if the current user is following the profile they are viewing
 * USED BY: Profile
 */
app.get("/is-following/:currUser/:profId", async (req, res) => {
    const currUser = req.params.currUser;
    const profId = req.params.profId;

    const { data, error } = await supabase
        .from("follow")
        .select("id")
        .eq("follower", currUser)
        .eq("following", profId)
    
    if (error) {
        console.error("Error checking following: ", error)
        return res.status(500).json(false, { error: "Failed to fetch is-following."})
    }
    
    const isFollowing = Array.isArray(data) && data.length > 0
    return res.json(isFollowing)
})