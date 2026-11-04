const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Supabase select strings like `*, show ( title ), entries ( id, perf ( * ) )` are
// parsed by the database, not by JavaScript. A missing ")" is not a syntax error
// here, it only fails at request time with a 500. The fake database in
// routes.test.js never parses them, so this test checks them directly.

const routesDir = path.join(__dirname, "..", "routes");

function selectStrings(source) {
    const found = [];
    const pattern = /\.select\(\s*`([^`]*)`/g;
    let match;
    while ((match = pattern.exec(source)) !== null) {
        const line = source.slice(0, match.index).split("\n").length;
        found.push({ text: match[1], line });
    }
    return found;
}

test("every select string in routes/ has balanced parentheses", () => {
    const files = fs.readdirSync(routesDir).filter((f) => f.endsWith(".js"));
    let checked = 0;

    for (const file of files) {
        const source = fs.readFileSync(path.join(routesDir, file), "utf8");
        for (const { text, line } of selectStrings(source)) {
            const opens = (text.match(/\(/g) || []).length;
            const closes = (text.match(/\)/g) || []).length;
            assert.equal(
                opens,
                closes,
                `${file}:${line} has ${opens} "(" but ${closes} ")" in its select string`
            );
            checked++;
        }
    }

    // guard against the regex silently matching nothing
    assert.ok(checked >= 5, `expected to find several select strings, found ${checked}`);
});
