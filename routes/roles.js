const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

/**
 * GET /roles/:id
 * Returns roles for a given performer
 * USED BY: Performer
 */
router.get("/roles/:id", async (req, res) => {
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
        .order("arrived", {ascending : true})

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
router.get("/roles/single/:id", async (req, res) => {
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

module.exports = router;
