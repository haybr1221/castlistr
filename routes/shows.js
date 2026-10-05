const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

/**
 * GET /show-pagination
 * Returns show information in pages
 * USED BY: Shows
 */
router.get("/show-pagination", async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const perPage = 15;
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    const search = req.query.search || ""

    let query = supabase
        .from("show")
        .select("*", { count: "exact" })
        .order("sort_title", { ascending: true })

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
router.get("/show-titles", async(req, res) => {
    const { data, error } = await supabase
        .from("show")
        .select("id, title")
        .order("sort_title", { ascending: true })

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
router.get(`/show/:id/characters`, async (req, res) => {
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("show_has_character")
        .select(`
            sort_order,
            char_id,
            character (*)
        `)
        .eq("show_id", showId)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching characters: ", error);
        return res.status(500).json({error: "Failed to fetch characters."})
    }

    const characters = data.map(row => ({
        ...row.character,
        sort_order: row.sort_order
    }));

    res.json(characters);
});

/**
 * GET /show-info/:slug
 * Returns show info for a specific show
 * USED BY: Show
 */
router.get(`/show-info/:slug`, async (req, res) => {
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
        .from("show_has_character")
        .select(`
            *,
            character (*)
        `)
        .eq("show_id", show.id)
        .order("sort_order", { ascending: true });

    if (charError) {
        console.error("Error fetching character information: ", charError);
        return res.status(500).json({error: "Failed to fetch character information."})
    }

    const charDataMapped = charData.map(row => ({
        ...row.character,
        sort_order: row.sort_order
    }));

    // Get tour info for this show
    const { data: tourData, error: tourError } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", show.id)
        .order("opening", { ascending: true })

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
        charData: charDataMapped,
        tourData,
        castListCount
    });
})

/**
 * GET /tour/:id
 * Returns information on a given tour
 * USED BY: AddRoleModal
 */
router.get(`/tour/:id`, async (req, res) => {
    const showId = req.params.id;

    const { data, error } = await supabase
        .from("tour")
        .select(`*`)
        .eq("show_id", showId)
        .order("opening", { ascending: true })

    if (error) {
        console.error("Error fetching tour information: ", error);
        return res.status(500).json({error: "Failed to fetch tour information."})
    }

    res.json(data)
})

module.exports = router;
