# 🎭 Castlistr

> A collaborative web application for theatre enthusiasts to build, share, and discuss their ideal fan-casts for musicals and plays.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-castlistr.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://castlistr.vercel.app/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 📌 Project Overview

Theatre fans across the globe love discussing who should play iconic roles in Broadway, West End, and touring productions. **Castlistr** provides a dedicated, structured space to bring those dream cast lists to life. 

Users can curate actor/character pairings, explore database entries for shows and performers, compare fan-casts with historical production credits, and engage with the community through likes and comments.

---

## ✨ Key Features

### 🔑 Authentication & Authorization
* **Multiple Auth Methods:** Secure authentication powered by Supabase Auth, supporting **One-Time Passcodes (OTP)** via email and **Google OAuth**.
* **Protected Routes:** Guest users can browse public lists and database entries, while list creation and commenting require authentication.

### 🎭 Cast List Creation & Management (Full CRUD)
* **Guided Creation Workflow:** Step-by-step wizard to select or create a show, assign actors to characters, and name the list.
* **Smart Real-World Credit Alerts:** Displays real-world casting context (e.g., notifying users if an actor played that exact role in their career).
* **Profile Pinning:** Users can pin their favorite cast lists to the top of their public profile.
* **Validation & Duplication Prevention:** Guarantees every list has at least one valid actor/character pairing and prevents duplicate character entries.

### 📚 Shows & Performers Database
* **Show Directory:** Displays run dates (opening/closing), character rosters, national/international tours, and community creation stats.
* **Performer Profiles:** Detailed biographies including hometown, birthdate, headshots, total fan-casts featured in, and verified theatre credits (including cover/understudy status).
* **Community Contributions:** Authenticated users can expand the database by adding new shows, characters, tours, and performers.

### 💬 Community & Social Engagement
* **Interactions:** Like and comment on community-created cast lists.
* **User Profiles:** View creator profiles with full reverse-chronological production feeds and pinned favorites.

---

## 🛡️ Security & Database Architecture

Castlistr relies on **Supabase (PostgreSQL)** for secure data handling, relational querying, and media storage.

* **Row Level Security (RLS):** Database policies strictly enforce that users can only update or delete content they personally created.
* **Relational Joins:** Custom PostgreSQL inner joins ensure precise queries across multi-table relationships (`shows`, `characters`, `performers`, `show_has_character`, and `cast_lists`).
* **Supabase Storage:** Public bucket hosting for high-resolution show posters and actor headshots.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, React Router
* **Styling:** Custom Vanilla CSS (Responsive Design)
* **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
* **Authentication:** Supabase Auth (OTP Email & Google OAuth)
* **Storage:** Supabase Storage (Bucket hosting for image assets)
* **Hosting:** Vercel

---

## 🚀 Local Development Setup

To run Castlistr on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/haybr1221/castlistr.git](https://github.com/haybr1221/castlistr.git)
   cd castlistr/frontend

2. **Install dependencies:**
    ```bash 
    npm install

3. **Set up Environment Variables:**
    Create a .env file inside the frontend directory and add your Supabase credentials:
    ```bash
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_LEY=your_supabase_key

4. **Start the local development server:**
    ```bash
    npm run dev

5. **Open http://localhost:5173 in your browser.**

---

## 🗺️ Roadmap (Upcoming V2 Features)

- [ ] **Export Cast List to Image:** Download rendered cast lists as formatted graphic cards (`html2canvas`) for sharing on social media.
- [ ] **Enhanced Social Feed:** Follow system with custom algorithmic feed updates.
- [ ] **Collaborative Lists:** "Co-director" permissions allowing multiple users to edit shared cast lists.
- [ ] **Nested Comment Replies:** Multi-threaded discussions on community cast lists.
- [ ] **Private Lists & User Moderation:** Private list visibility toggles and user blocking capabilities.

---

## 👤 Author
**Hayley Branchflower**

* Live App: [castlistr.vercel.app](https://castlistr.vercel.app)
* GitHub: [@haybr1221](https://github.com/haybr1221)