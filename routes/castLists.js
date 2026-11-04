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
            `)
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
            profile:user_id ( username, avatar_url )`)
        .eq("id", listId)
        .single()

    if (error) {
        console.error("Error fetching cast list information for ", listId, " - ", error)
        return res.status(500).json({error: "Failed to fetch cast list."})
    }

    res.json(data)
})

module.exports = router;
