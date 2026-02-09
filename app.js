const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


app.set("view engine", "ejs");
app.set("views", "views");


const client = new MongoClient(process.env.MONGO_URI);
let db;


async function connectDB() {
await client.connect();
db = client.db("music-hub");
console.log("MongoDB connected");
}
connectDB();


// ROUTES
app.get("/", (req, res) => {
res.render("index");
});


app.get("/songs", async (req, res) => {
const songs = await db.collection("songs").find().toArray();
res.render("songs", { songs });
});


app.get("/add", (req, res) => {
res.render("add");
});


app.post("/add", async (req, res) => {
const { title, artist } = req.body;
await db.collection("songs").insertOne({ title, artist });
res.redirect("/songs");
});


app.get("/edit/:id", async (req, res) => {
const song = await db.collection("songs").findOne({ _id: new ObjectId(req.params.id) });
res.render("edit", { song });
});


app.post("/edit/:id", async (req, res) => {
const { title, artist } = req.body;
await db.collection("songs").updateOne(
{ _id: new ObjectId(req.params.id) },
{ $set: { title, artist } }
);
res.redirect("/songs");
});


app.post("/delete/:id", async (req, res) => {
await db.collection("songs").deleteOne({ _id: new ObjectId(req.params.id) });
res.redirect("/songs");
});


app.listen(PORT, () => {
console.log("Server running on port", PORT);
});