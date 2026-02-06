const songForm = document.getElementById("songForm");
const songsDiv = document.getElementById("songs");

let editId = null;

async function loadSongs() {
  const res = await fetch("/api/songs");
  const songs = await res.json();

  songsDiv.innerHTML = "";
  songs.forEach(song => {
    const div = document.createElement("div");
    div.className = "song";

    div.innerHTML = `
      <div>
        <strong>${song.title}</strong>
        <span>${song.artist} • ${song.genre}</span>
      </div>
      <div>
        <button class="edit" onclick="editSong(
          '${song._id}',
          '${song.title}',
          '${song.artist}',
          '${song.genre}'
        )">Edit</button>
        <button class="delete" onclick="deleteSong('${song._id}')">Delete</button>
      </div>
    `;

    songsDiv.appendChild(div);
  });
}

songForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const artist = document.getElementById("artist").value;
  const genre = document.getElementById("genre").value;

  if (editId) {
    // UPDATE
    await fetch(`/api/songs/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist, genre })
    });
    editId = null;
  } else {
    // CREATE
    await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, artist, genre })
    });
  }

  songForm.reset();
  loadSongs();
});

function editSong(id, title, artist, genre) {
  document.getElementById("title").value = title;
  document.getElementById("artist").value = artist;
  document.getElementById("genre").value = genre;
  editId = id;
}

async function deleteSong(id) {
  await fetch(`/api/songs/${id}`, { method: "DELETE" });
  loadSongs();
}

loadSongs();
