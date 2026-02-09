require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}
connectDB();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Routes

// Home
app.get('/', (req, res) => res.render('index', { title: 'Home' }));

// About
app.get('/about', (req, res) => res.render('about', { title: 'About' }));

// Contact
app.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }));

// Songs list
app.get('/songs', async (req, res) => {
  const songs = await client.db('music-hub').collection('songs').find({}).toArray();
  res.render('songs', { title: 'Songs', songs });
});

// Song details
app.get('/songs/:id', async (req, res) => {
  const song = await client.db('music-hub').collection('songs')
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!song) return res.status(404).send('Song not found');
  res.render('song-details', { title: song.name, song });
});

// Add Song page
app.get('/add-song', (req, res) => res.render('add-song', { title: 'Add Song' }));

// Handle Add Song form submission
app.post('/add-song', async (req, res) => {
  const { name, artist, album, year } = req.body;
  const songsCollection = client.db('music-hub').collection('songs');
  await songsCollection.insertOne({ name, artist, album, year });
  res.redirect('/songs'); // go to songs list after adding
});

// Contact form submission
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Contact form submitted: ${name}, ${email}, ${message}`);
  res.send('Thank you for contacting us!');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
