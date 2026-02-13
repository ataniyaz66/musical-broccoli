# 🎵 MusicHub — Final Project (Sessions, Security, Roles, Search & Relations)

MusicHub is a full-stack web application built with **Node.js, Express, MongoDB, and EJS**.
It demonstrates **sessions-based authentication**, secure password hashing (**bcrypt**), **role-based access control (Admin/User)**, protected CRUD operations, and production features like **search, sorting, pagination**, and MongoDB relations using **$lookup**.

## ✅ Core Features
- Register / Login via Web UI
- Sessions-based authentication (`express-session`)
- Sessions stored in MongoDB (`connect-mongo`)
- Secure cookies:
  - `HttpOnly` (required)
  - `Secure: auto` (Render/HTTPS-ready)
- Password security:
  - bcrypt hashing (no plaintext passwords)
  - generic errors ("Invalid credentials")
- CRUD for Songs via Web UI:
  - Create / Read / Update / Delete
  - Input validation using `express-validator`

## 👥 Roles (Admin/User) + Authorization
- Users have `role: "user"` by default during signup.
- Admins are identified by `role: "admin"` in the database.
- Authorization rules:
  - Anyone can view songs
  - Logged-in users can add songs
  - Only **Owner OR Admin** can edit a song
  - Only **Admin** can delete songs
- Unauthorized actions redirect to `/forbidden`

## 🔗 Database Relationship (One-to-Many)
Collections:
- `users`
- `songs`

Relationship:
- `songs.createdBy` stores an **ObjectId reference** to `users._id`  
This creates a **one-to-many** relation (User → Songs).

The Songs page shows owner username using MongoDB aggregation `$lookup`.

## 🔎 Search, Sorting, Pagination
- Search by title or artist (case-insensitive)
- Sort by: newest / title / year
- Pagination for large datasets
- "My songs only" filter for logged-in users

## 📁 Modular Project Structure
- `config/` DB + session config
- `controllers/` application logic
- `routes/` route mapping
- `middleware/` authorization & security checks
- `views/` EJS UI pages
- `public/` CSS assets

## ▶ Run Locally
1) Install:
```bash
npm install
