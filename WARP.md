# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

`castlistr` is a Node/Express + static frontend app that lets musical theatre fans create and browse custom cast lists for shows. The backend exposes JSON APIs over Express and serves static assets from `public/`; the frontend is plain HTML/CSS/JS that talks both to the Express APIs and directly to Supabase.

Key entrypoints:
- Backend: `server.js`
- Frontend assets: `public/` (HTML pages, ES module scripts, CSS)

## How to run the app locally

### Install Node dependencies

This repo does not include a `package.json`, but `server.js` depends on these modules:
- `express`
- `body-parser`
- `cors`
- `dotenv`
- `@supabase/supabase-js`

From the repo root, install them once:

```bash path=null start=null
npm install express body-parser cors dotenv @supabase/supabase-js
```

### Required environment variables

The backend Supabase client is configured via environment variables in `server.js`:
- `SUPABASE_URL`
- `SUPABASE_KEY`

The server also reads `PORT` (defaulting to `3000`).

Create a `.env` file in the repo root with at least:

```bash path=null start=null
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-service-or-anon-key>
PORT=3000
```

### Start the development server

From the repo root:

```bash path=null start=null
node server.js
```

Then open `http://localhost:3000` in a browser. Express serves static assets from `public/`, so URLs like `/home.html`, `/shows.html`, `/performers.html`, etc. are all handled as static files.

### Linting and tests

There is no `package.json` or configured lint/test tooling in this repo. Before assuming commands like `npm test` or `npm run lint` exist, inspect any local `package.json` that might be present but untracked.

## High-level architecture

### Backend: Express + Supabase

- **Server entrypoint (`server.js`)**
  - Loads environment variables with `dotenv`.
  - Creates an Express app, enables CORS and JSON parsing (`body-parser.json()`), and serves static files from `public/`.
  - Starts the HTTP server on `PORT` or `3000`.
  - Initializes a Supabase client using `SUPABASE_URL` and `SUPABASE_KEY`.

- **Static file serving**
  - `app.use(express.static(path.join(__dirname, "public")))` serves everything under `public/` directly.
  - There are explicit HTML routes that map friendly paths to specific files, e.g.:
    - `GET /shows/:slug` → `public/show.html`
    - `GET /users/:user` → `public/user.html`
    - `GET /users/:user/edit-profile` → `public/edit-profile.html`

- **Core API routes (JSON)**
  - **Performers**
    - `GET /performer`: returns all performers from the `performer` table, ordered by `last_name`.
  - **Shows**
    - `GET /show`: base list of shows (no pagination), ordered by `title`.
    - `GET /show-pagination`: paginated shows with optional `search` query; returns `{ data, page, totalPages, totalItems }`.
    - `GET /show/:id/characters`: characters for a given show by internal numeric id, joining `character` with `show_has_character`.
    - `GET /show-info/:slug`: show detail and related counts; looks up a show by slug, then counts related characters, tours, and cast lists.
    - `GET /tour/:id`: tours for a show (`tour` table), ordered by `opening`.
    - `GET /show-id/:slug`: resolves a slug to a show `id`.
  - **Cast lists**
    - `GET /cast-lists`: global feed of cast lists with nested relations:
      - `show (title)`
      - `cast_list_entry` with nested `character` and `performer` details.
    - `GET /cast-lists/:id`: cast lists belonging to a specific user id (`user_id`), with nested show and entry details.
    - `GET cast-lists/:id/cast-list-entry`: entries for a single cast list (note: currently missing a leading `/` on the route path).
    - `GET /user-cast-lists/:id`: cast lists for a user, used to compute per-user counts.
  - **Profiles and users**
    - `GET /get-profile/:id`: profile row for a given Supabase user id (from `profile` table).
    - `GET /profiles`: returns rows from `users` (likely Supabase auth schema).
    - `GET /get-user/:username`: profile row by username.

The backend is intentionally thin: it mostly forwards selects/inserts to Supabase with minimal business logic, formatting data in ways that are convenient for the frontend.

### Frontend: static HTML + ES modules

- **Supabase client (`public/supabaseclient.js`)**
  - Uses the ESM CDN (`https://esm.sh/@supabase/supabase-js@2`) and initializes a Supabase client with a project URL and anon key.
  - All frontend JS modules import `supabase` from here for auth and some direct Supabase operations (e.g., storage uploads).

- **Page scripts (examples)**
  - **`public/create.js` (create cast list)**
    - Fetches shows from `GET /show` and populates a custom dropdown UI.
    - On show selection, fetches characters via `GET /show/:id/characters` and builds a grid of character → performer selectors.
    - Fetches performers from `GET /performer` to populate dropdowns.
    - Tracks selections in a `castSelections` object keyed by `character_id`.
    - On submit, inserts a new cast list into the `cast_lists` table (via Supabase JS client) and then bulk-inserts related `cast_list_entry` rows.
  - **`public/home.js` (feed and user summary)**
    - Uses Supabase auth to get the current user.
    - Fetches the global feed from `GET /cast-lists` and renders each list (title, creator, characters/performers) into `.feed`.
    - For each list, fetches the creator’s profile via `GET /get-profile/:user_id` to render username and avatar.
    - Fetches the current user’s profile and cast lists (`/get-profile/:id`, `/user-cast-lists/:id`) to show personal stats and profile link.
  - **`public/shows.js` (shows index)**
    - Uses `GET /show-pagination` to display shows with search and pagination controls.
    - Computes per-show cast list counts client-side by aggregating data from `GET /cast-lists`.
    - Provides a modal for creating new shows; on submit, inserts into the `show` table with a slug derived from the title, then redirects to the show detail page.
  - **`public/show.js` (show detail)**
    - Derives the show slug from `window.location.pathname`.
    - Resolves slug → id via `/show-id/:slug`, then fetches detailed metadata via `/show-info/:slug`.
    - Updates poster/title and displays counts of cast lists, characters, and tours.
    - Fetches and displays characters (`/show/:id/characters`) and tours (`/tour/:id`).
    - If a poster doesn’t exist, shows an upload flow that:
      - Uploads an image to the Supabase `posters` storage bucket.
      - Gets a public URL and updates the `poster_url` on the `show` row.
  - **`public/performers.js` (performer admin)**
    - Fetches the performer list from `/performer` and renders a table.
    - Provides a modal to create new performers, checking for duplicates before calling Supabase to insert into `performer`.

Most other page scripts follow the same pattern: import `supabase`, get the current user, then coordinate backend API calls and DOM updates.

### Data model (high-level)

The Supabase schema isn’t defined in this repo, but usage patterns imply the following tables and relations:
- `show`: `{ id, title, slug, user_id, poster_url, ... }`
- `character`: `{ id, name, user_id, ... }`
- `show_has_character`: join table linking shows to characters.
- `tour`: `{ id, show_id, title, opening, closing, ... }`
- `performer`: `{ id, first_name, middle_name, last_name, user_id, ... }`
- `cast_lists`: `{ id, show_id, user_id, title, created_at, ... }`
- `cast_list_entry`: `{ id, cast_list_id, character_id, performer_id, ... }`
- `profile`: `{ id, username, avatar_url, ... }` mapping to Supabase auth users.

When modifying or adding features, keep the backend routes, frontend JS, and Supabase schema aligned; many frontend flows assume specific nested select shapes (e.g., `cast_list_entry` with nested `character` and `performer`).
