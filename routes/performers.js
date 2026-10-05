const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

/**
 * GET /performer
 * Returns performer information (id, full name, slug)
 * USED BY: Create, EditCastList
 */
router.get("/performer", async (req, res) => {
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
router.get("/performer-pagination", async (req, res) => {
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
 * GET /performer/by-slug/:slug
 * Returns performer information by slug
 * USED BY: Performer
 */
router.get("/performer/by-slug/:slug", async (req, res) => {
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

module.exports = router;
