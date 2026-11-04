const { test, describe, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { createFake, installFake, startApp, hasOp } = require("./helpers");

const fake = createFake();
installFake(fake); // must happen before the routers are loaded
let app;

before(async () => {
    // routes log errors on purpose; keep test output readable
    console.error = () => {};
    app = await startApp();
});
after(() => app.close());
beforeEach(() => fake.reset());

const get = async (path) => {
    const res = await fetch(app.baseUrl + path);
    return { status: res.status, body: await res.json() };
};

describe("performers", () => {
    test("GET /performer returns the rows", async () => {
        fake.queue("performer", { data: [{ id: 1, full_name: "A B", slug: "a-b" }], error: null });
        const { status, body } = await get("/performer");
        assert.equal(status, 200);
        assert.deepEqual(body, [{ id: 1, full_name: "A B", slug: "a-b" }]);
    });

    test("GET /performer returns 500 with the error message", async () => {
        fake.queue("performer", { data: null, error: { message: "boom" } });
        const { status, body } = await get("/performer");
        assert.equal(status, 500);
        assert.equal(body.error, "boom");
    });

    test("GET /performer-pagination merges list counts and computes pages", async () => {
        fake.queue("performer", {
            data: [{ id: 1, full_name: "A" }, { id: 2, full_name: "B" }],
            error: null,
            count: 31,
        });
        fake.rpcResults.get_performer_list_counts = {
            data: [{ performer_id: 1, list_count: 4 }],
            error: null,
        };
        const { status, body } = await get("/performer-pagination?page=2");
        assert.equal(status, 200);
        assert.equal(body.page, 2);
        assert.equal(body.totalPages, 3); // ceil(31 / 15)
        assert.equal(body.totalItems, 31);
        assert.deepEqual(
            body.perfWithCounts.map((p) => p.cast_list_count),
            [4, 0] // performer 2 has no row -> defaults to 0
        );
        assert.ok(hasOp(fake, "performer", "range", 15, 29), "page 2 should use range(15, 29)");
    });

    test("GET /performer-pagination defaults to page 1 and applies search", async () => {
        fake.queue("performer", { data: [], error: null, count: 0 });
        fake.rpcResults.get_performer_list_counts = { data: [], error: null };
        const { body } = await get("/performer-pagination?search=lin");
        assert.equal(body.page, 1);
        assert.ok(hasOp(fake, "performer", "ilike", "full_name", "%lin%"));
        assert.ok(hasOp(fake, "performer", "range", 0, 14));
    });

    test("GET /performer-pagination returns 500 if the counts RPC fails", async () => {
        fake.queue("performer", { data: [], error: null, count: 0 });
        fake.rpcResults.get_performer_list_counts = { data: null, error: { message: "rpc" } };
        const { status } = await get("/performer-pagination");
        assert.equal(status, 500);
    });

    test("GET /performer/by-slug/:slug adds castListCount", async () => {
        fake.queue("performer", { data: { id: 7, full_name: "X" }, error: null });
        fake.queue("cast_list_entry", { count: 3, error: null });
        const { status, body } = await get("/performer/by-slug/x");
        assert.equal(status, 200);
        assert.equal(body.id, 7);
        assert.equal(body.castListCount, 3);
        assert.ok(hasOp(fake, "performer", "eq", "slug", "x"));
        assert.ok(hasOp(fake, "cast_list_entry", "eq", "performer_id", 7));
    });
});

describe("shows", () => {
    test("GET /show-pagination merges list counts and applies search to title", async () => {
        fake.queue("show", {
            data: [{ id: 1, title: "Hamilton" }, { id: 2, title: "Rent" }],
            error: null,
            count: 2,
        });
        fake.rpcResults.get_show_list_counts = {
            data: [{ show_id: 2, list_count: 9 }],
            error: null,
        };
        const { status, body } = await get("/show-pagination?search=ham");
        assert.equal(status, 200);
        assert.deepEqual(body.showWithCounts.map((s) => s.cast_list_count), [0, 9]);
        assert.equal(body.totalPages, 1);
        assert.ok(hasOp(fake, "show", "ilike", "title", "%ham%"));
    });

    test("GET /show/:id/characters flattens character rows with sort_order", async () => {
        fake.queue("show_has_character", {
            data: [
                { sort_order: 1, char_id: 10, character: { id: 10, name: "Eliza" } },
                { sort_order: 2, char_id: 11, character: { id: 11, name: "Angelica" } },
            ],
            error: null,
        });
        const { body } = await get("/show/5/characters");
        assert.deepEqual(body, [
            { id: 10, name: "Eliza", sort_order: 1 },
            { id: 11, name: "Angelica", sort_order: 2 },
        ]);
        assert.ok(hasOp(fake, "show_has_character", "eq", "show_id", "5"));
    });

    test("GET /show-info/:slug aggregates show, characters, tours and list count", async () => {
        fake.queue("show", { data: { id: 3, title: "Wicked" }, error: null });
        fake.queue("show_has_character", {
            data: [{ sort_order: 1, character: { id: 1, name: "Elphaba" } }],
            error: null,
        });
        fake.queue("tour", { data: [{ id: 99 }], error: null });
        fake.queue("cast_lists", { count: 12, error: null });

        const { status, body } = await get("/show-info/wicked");
        assert.equal(status, 200);
        assert.deepEqual(body, {
            show: { id: 3, title: "Wicked" },
            charData: [{ id: 1, name: "Elphaba", sort_order: 1 }],
            tourData: [{ id: 99 }],
            castListCount: 12,
        });
    });

    test("GET /show-info/:slug returns 500 when the show lookup fails", async () => {
        fake.queue("show", { data: null, error: { message: "not found" } });
        const { status, body } = await get("/show-info/nope");
        assert.equal(status, 500);
        assert.equal(body.error, "Failed to fetch for show.");
    });

    test("GET /show-info/:slug returns 500 when the tour lookup fails", async () => {
        fake.queue("show", { data: { id: 3 }, error: null });
        fake.queue("show_has_character", { data: [], error: null });
        fake.queue("tour", { data: null, error: { message: "x" } });
        const { status, body } = await get("/show-info/wicked");
        assert.equal(status, 500);
        assert.equal(body.error, "Failed to fetch tour information.");
    });

    test("GET /tour/:id filters by show id", async () => {
        fake.queue("tour", { data: [{ id: 1 }], error: null });
        const { body } = await get("/tour/4");
        assert.deepEqual(body, [{ id: 1 }]);
        assert.ok(hasOp(fake, "tour", "eq", "show_id", "4"));
    });
});

describe("cast lists", () => {
    test("GET /cast-lists/:userId filters by user", async () => {
        fake.queue("cast_lists", { data: [{ id: 1 }], error: null });
        const { body } = await get("/cast-lists/u1");
        assert.deepEqual(body, [{ id: 1 }]);
        assert.ok(hasOp(fake, "cast_lists", "eq", "user_id", "u1"));
    });

    test("GET /get-list/:id select string has balanced parentheses (regression)", async () => {
        fake.queue("cast_lists", { data: { id: 1 }, error: null });
        await get("/get-list/1");
        const select = fake.calls[0].ops.find((o) => o[0] === "select")[1];
        const opens = (select.match(/\(/g) || []).length;
        const closes = (select.match(/\)/g) || []).length;
        assert.equal(opens, closes);
    });

    test("GET /get-list/:id returns 500 on error", async () => {
        fake.queue("cast_lists", { data: null, error: { message: "x" } });
        const { status, body } = await get("/get-list/1");
        assert.equal(status, 500);
        assert.equal(body.error, "Failed to fetch cast list.");
    });
});

describe("roles", () => {
    test("GET /roles/:id filters by performer", async () => {
        fake.queue("performer_has_character", { data: [{ id: 1 }], error: null });
        const { body } = await get("/roles/9");
        assert.deepEqual(body, [{ id: 1 }]);
        assert.ok(hasOp(fake, "performer_has_character", "eq", "performer_id", "9"));
    });

    test("GET /roles/single/:id is not swallowed by /roles/:id", async () => {
        fake.queue("performer_has_character", { data: { id: 4 }, error: null });
        const { body } = await get("/roles/single/4");
        assert.deepEqual(body, { id: 4 });
        assert.ok(hasOp(fake, "performer_has_character", "eq", "id", "4"));
    });

    test("GET /roles/single/:id returns 500 on error", async () => {
        fake.queue("performer_has_character", { data: null, error: { message: "x" } });
        const { status, body } = await get("/roles/single/4");
        assert.equal(status, 500);
        assert.equal(body.error, "Failed to fetch role.");
    });
});

describe("users", () => {
    test("GET /get-user/:username looks up by username", async () => {
        fake.queue("profile", { data: { id: "u1", username: "hayley" }, error: null });
        const { body } = await get("/get-user/hayley");
        assert.equal(body.username, "hayley");
        assert.ok(hasOp(fake, "profile", "eq", "username", "hayley"));
    });

    test("GET /get-profile/:id returns 500 on error", async () => {
        fake.queue("profile", { data: null, error: { message: "x" } });
        const { status } = await get("/get-profile/u1");
        assert.equal(status, 500);
    });

});
