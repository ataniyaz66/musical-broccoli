# 🎵 MusicHub — Sessions & Security Web Application

MusicHub is a full-stack web application built with **Node.js, Express, MongoDB, and EJS**.
The project demonstrates **sessions-based authentication, secure password handling, and protected CRUD operations**, and is prepared for **Assignment 4 (Pre-Defense: Sessions & Security)**.

---

## 📌 Project Overview

MusicHub allows users to:

* Register and log in using a web interface
* Stay authenticated using **sessions stored in MongoDB**
* Manage a catalog of songs (Create, Read, Update, Delete)
* Securely interact with the application through protected routes

The application is deployed and accessible via a **public URL**.

---

## 🧱 Tech Stack

* **Backend:** Node.js, Express
* **Database:** MongoDB Atlas
* **Templating:** EJS
* **Authentication:** Sessions (`express-session`)
* **Session Store:** MongoDB (`connect-mongo`)
* **Password Security:** bcrypt
* **Validation:** express-validator
* **Deployment:** Render

---

## 📁 Project Structure

```
assmusichub/
├── app.js
├── package.json
├── public/
│   └── styles.css
├── views/
│   ├── layout.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── songs.ejs
│   ├── add.ejs
│   └── edit.ejs
```

---

## 🎶 Domain Model: Song

Each **Song** document contains meaningful domain-specific fields:

* `title`
* `artist`
* `album`
* `genre`
* `year`
* `durationSec`
* `language`
* `explicit`
* `createdAt`
* `createdBy`

The database contains **20+ realistic records**.

---

## 🔐 Authentication & Sessions

* Users authenticate via **login form**
* On successful login, the server creates a **session**
* Session ID is stored in a **cookie**
* Sessions persist between requests
* Session data is stored in MongoDB

### Cookie Security

* **HttpOnly:** prevents JavaScript access to cookies
* **Secure:** cookies sent only over HTTPS (in production)
* Cookies store **only session ID**, no sensitive data

---

## 🛡 Authorization

* Authentication middleware protects write operations
* Only logged-in users can:

  * Add songs
  * Edit songs
  * Delete songs
* Unauthorized users can only view data

---

## 🔑 Password Security

* Passwords are **never stored in plain text**
* Passwords are hashed using **bcrypt** before saving
* Login compares hashed password securely
* Generic error messages are used ("Invalid credentials")

---

## ✅ Validation & Error Handling

* All input data is validated server-side
* Correct HTTP status codes are used
* Invalid requests do not crash the application
* Errors are handled safely and displayed to the user

---

## 🚀 Running the Project Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
MONGO_URI=your_mongodb_atlas_uri
SESSION_SECRET=your_secret_key
NODE_ENV=development
```

3. Start the server:

```bash
npm start
```

4. Open in browser:

```
http://localhost:3000
```

---

## 🌐 Deployment

The application is deployed on **Render**.

Environment variables are configured directly in Render:

* `MONGO_URI`
* `SESSION_SECRET`
* `NODE_ENV=production`

The app listens on `process.env.PORT` as required by the platform.

---

## 🎓 Assignment Coverage

This project satisfies all requirements of **Assignment 4 – Pre-Defense: Sessions & Security**:

* ✔ Existing deployed project reused
* ✔ Realistic domain data
* ✔ Full CRUD via Web UI
* ✔ Sessions-based authentication
* ✔ Authentication & authorization middleware
* ✔ Secure cookies (HttpOnly, Secure)
* ✔ bcrypt password hashing
* ✔ Validation and error handling
* ✔ Defense-ready explanations of security concepts

---

## 👤 Author

**Ataniyaz Mutigolla**

---

## 📜 License

This project is for educational purposes only.
