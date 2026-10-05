const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

/**
 * GET /cast-lists
 * Returns cast lists
 * USED BY: Home
 */
router.get("/cast-lists", async (req, res) => {
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
router.get(`/cast-lists/:userId`, async (req, res) => {
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
router.get("/get-list/:id", async (req, res) => {
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
            profile:user_id ( username, avatar_url ),
            user_comments ( * )`)
        .eq("id", listId)
        .single()

    if (error) {
        console.error("Error fetching cast list information for ", listId, " - ", error)
        return res.status(500).json({error: "Failed to fetch cast list."})
    }

    res.json(data)
})

/**
 * GET /get-likes/:user/:list
 * Returns if a user has liked a given list
 * USED BY: DisplayCastList
 */
router.get("/get-likes/:user/:list", async (req, res) => {
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
router.get("/liked-lists/:user", async (req, res) => {
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

module.exports = router;
