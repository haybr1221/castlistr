const path = require("path");
const express = require("express");

/**
 * Fake Supabase client. Mimics the chainable query builder the routes use
 * (select/eq/order/...) and resolves to whatever result the test queued.
 *
 *   fake.queue("show", { data: [...], error: null })   // next from("show")
 *   fake.rpcResults.get_show_list_counts = { data: [...] }
 *
 * Every call is recorded in fake.calls so tests can assert on filters.
 */
function createFake() {
    const fake = {
        calls: [],
        queues: {},
        rpcResults: {},
        queue(table, ...results) {
            (fake.queues[table] ||= []).push(...results);
        },
        reset() {
            fake.calls = [];
            fake.queues = {};
            fake.rpcResults = {};
        },
        from(table) {
            const result = fake.queues[table]?.shift() ?? { data: null, error: null };
            const call = { table, ops: [] };
            fake.calls.push(call);

            const builder = new Proxy({}, {
                get(_, prop) {
                    if (prop === "then") {
                        return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
                    }
                    return (...args) => {
                        call.ops.push([prop, ...args]);
                        return builder;
                    };
                },
            });
            return builder;
        },
        rpc(name) {
            fake.calls.push({ rpc: name });
            return Promise.resolve(fake.rpcResults[name] ?? { data: null, error: null });
        },
    };
    return fake;
}

/** Replace lib/supabase.js in the require cache with the fake. Call before loading routers. */
function installFake(fake) {
    const id = require.resolve(path.join(__dirname, "..", "lib", "supabase.js"));
    require.cache[id] = { id, filename: id, loaded: true, exports: fake };
}

/** Start the real routers on an ephemeral port; returns { baseUrl, close }. */
async function startApp() {
    const app = express();
    for (const name of ["performers", "shows", "castLists", "roles", "users"]) {
        app.use(require(path.join(__dirname, "..", "routes", name)));
    }
    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    return {
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

/** Did the fake record this op (e.g. "eq", "slug", "abc") on a query to `table`? */
function hasOp(fake, table, op, ...args) {
    return fake.calls.some(
        (c) =>
            c.table === table &&
            c.ops.some((o) => o[0] === op && args.every((a, i) => o[i + 1] === a))
    );
}

module.exports = { createFake, installFake, startApp, hasOp };
