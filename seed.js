require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const songs = [
  { title:"Blinding Lights", artist:"The Weeknd", album:"After Hours", genre:"Pop", year:2020, durationSec:200, language:"English", explicit:false },
  { title:"Levitating", artist:"Dua Lipa", album:"Future Nostalgia", genre:"Pop", year:2020, durationSec:203, language:"English", explicit:false },
  { title:"Lose Yourself", artist:"Eminem", album:"8 Mile", genre:"Hip-Hop", year:2002, durationSec:326, language:"English", explicit:true },
  { title:"Numb", artist:"Linkin Park", album:"Meteora", genre:"Rock", year:2003, durationSec:185, language:"English", explicit:false },
  { title:"Someone Like You", artist:"Adele", album:"21", genre:"Pop", year:2011, durationSec:285, language:"English", explicit:false },
  { title:"Billie Jean", artist:"Michael Jackson", album:"Thriller", genre:"Pop", year:1982, durationSec:294, language:"English", explicit:false },
  { title:"Shape of You", artist:"Ed Sheeran", album:"÷", genre:"Pop", year:2017, durationSec:233, language:"English", explicit:false },
  { title:"Bad Guy", artist:"Billie Eilish", album:"WHEN WE ALL FALL ASLEEP", genre:"Pop", year:2019, durationSec:194, language:"English", explicit:true },
  { title:"Despacito", artist:"Luis Fonsi", album:"VIDA", genre:"Latin", year:2017, durationSec:229, language:"Spanish", explicit:false },
  { title:"Believer", artist:"Imagine Dragons", album:"Evolve", genre:"Rock", year:2017, durationSec:204, language:"English", explicit:false },
  { title:"Starboy", artist:"The Weeknd", album:"Starboy", genre:"R&B", year:2016, durationSec:230, language:"English", explicit:true },
  { title:"Smells Like Teen Spirit", artist:"Nirvana", album:"Nevermind", genre:"Rock", year:1991, durationSec:301, language:"English", explicit:false },
  { title:"Bohemian Rhapsody", artist:"Queen", album:"A Night at the Opera", genre:"Rock", year:1975, durationSec:355, language:"English", explicit:false },
  { title:"HUMBLE.", artist:"Kendrick Lamar", album:"DAMN.", genre:"Hip-Hop", year:2017, durationSec:177, language:"English", explicit:true },
  { title:"Get Lucky", artist:"Daft Punk", album:"Random Access Memories", genre:"Electronic", year:2013, durationSec:369, language:"English", explicit:false },
  { title:"Rolling in the Deep", artist:"Adele", album:"21", genre:"Pop", year:2010, durationSec:228, language:"English", explicit:false },
  { title:"Seven Nation Army", artist:"The White Stripes", album:"Elephant", genre:"Rock", year:2003, durationSec:231, language:"English", explicit:false },
  { title:"Stressed Out", artist:"twenty one pilots", album:"Blurryface", genre:"Alternative", year:2015, durationSec:202, language:"English", explicit:false },
  { title:"Uptown Funk", artist:"Mark Ronson ft. Bruno Mars", album:"Uptown Special", genre:"Funk", year:2014, durationSec:270, language:"English", explicit:false },
  { title:"Dance Monkey", artist:"Tones and I", album:"The Kids Are Coming", genre:"Pop", year:2019, durationSec:209, language:"English", explicit:false }
];

(async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("music-hub");

  const username = "admin";
  const password = "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection("users").updateOne(
    { username },
    { $set: { username, passwordHash, role: "admin", createdAt: new Date() } },
    { upsert: true }
  );

  // Avoid duplicates: clear songs then insert fresh (optional)
  await db.collection("songs").deleteMany({});
  await db.collection("songs").insertMany(songs);

  console.log("✅ Seed complete!");
  console.log("Login: admin / admin1234");
  console.log("Songs inserted:", songs.length);

  await client.close();
})();
