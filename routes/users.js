const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

/**
 * GET /get-profile/:id
 * Returns a user's profile from their ID
 * USED BY: DisplayCastList, DisplayComment
 */
router.get("/get-profile/:id", async (req, res) => {
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
 * GET /get-user/:username
 * Returns a user from a given username
 * USED BY: Profile
 */
router.get("/get-user/:username", async (req, res) => {
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
 * GET /is-following/:currUser/:profId
 * Returns if the current user is following the profile they are viewing
 * USED BY: Profile
 */
router.get("/is-following/:currUser/:profId", async (req, res) => {
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

module.exports = router;
