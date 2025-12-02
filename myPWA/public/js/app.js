
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceworker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

let universes = [];
let characters = [];

function showScreen(screenId, path = "") {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
  if (path) location.hash = path;
}


window.addEventListener('DOMContentLoaded', () => {
  // Navigation buttons
  document.querySelectorAll(".create-universe-btn").forEach(btn =>
    btn.addEventListener("click", () => showScreen("createUniverseScreen", "#/Create_Universe"))
  );

  document.querySelectorAll(".create-character-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const universeName = document.getElementById("universeNameMiddle").textContent;
      document.getElementById("characterUniverseLabel").textContent = `Belongs to: ${universeName}`;
      showScreen("createCharacterScreen", "#/Create_Character");
    })
  );

  document.getElementById("homeLogo").addEventListener("click", () => showScreen("homeScreen", "#/"));

  document.getElementById("createUniverseBtn").addEventListener("click", createUniverse);
  document.getElementById("createCharacterBtn").addEventListener("click", createCharacter);


  if (localStorage.getItem("universes")) {
    universes = JSON.parse(localStorage.getItem("universes"));
    displayUniverses();
  }

  if (localStorage.getItem("characters")) {
    characters = JSON.parse(localStorage.getItem("characters"));
  }


  const hash = location.hash;
  if (hash === "#/Create_Character") {
    showScreen("createCharacterScreen");
  } else if (hash === "#/Create_Universe") {
    showScreen("createUniverseScreen");
  } else if (hash === "#/Universe_Detail") {
    showScreen("universeDetailScreen");
  } else {
    showScreen("homeScreen");
  }
});


function createUniverse() {
  const name = document.getElementById("universeNameInput").value;
  const bio = document.getElementById("universeBioInput").value;
  const imageFile = document.getElementById("universeImageInput").files[0];

  if (!name || !bio) return alert("Please fill in both the name and bio fields.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const newUniverse = { name, bio, image: e.target.result };
    universes.push(newUniverse);
    localStorage.setItem("universes", JSON.stringify(universes));
    displayUniverses();
    showScreen("homeScreen", "#/");
  };

  if (imageFile) {
    reader.readAsDataURL(imageFile);
  } else {
    const newUniverse = { name, bio, image: "/images/universe-placeholder.png" };
    universes.push(newUniverse);
    localStorage.setItem("universes", JSON.stringify(universes));
    displayUniverses();
    showScreen("homeScreen", "#/");
  }
}


function displayUniverses() {
  const container = document.getElementById("universeList");
  container.innerHTML = "";

  universes.forEach((u, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2 class="card-name">${u.name}</h2>
      <img src="${u.image}" alt="${u.name}" class="card-image">
      <p class="card-about">${u.bio}</p>
      <div class="card-actions">
        <button class="btn view-universe-btn" data-index="${index}">View Details</button>
        <button class="btn delete-universe-btn" data-index="${index}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });


  document.querySelectorAll(".view-universe-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const index = e.target.dataset.index;
      const universe = universes[index];
      document.getElementById("universeNameMiddle").textContent = universe.name;
      document.getElementById("universeImageMiddle").src = universe.image;
      document.getElementById("universeBioMiddle").textContent = universe.bio;
      displayCharactersForUniverse(universe.name);
      showScreen("universeDetailScreen", "#/Universe_Detail");
    })
  );


  document.querySelectorAll(".delete-universe-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const index = e.target.dataset.index;
      const deletedUniverse = universes[index].name;
      universes.splice(index, 1);
      characters = characters.filter(c => c.universe !== deletedUniverse);
      localStorage.setItem("universes", JSON.stringify(universes));
      localStorage.setItem("characters", JSON.stringify(characters));
      displayUniverses();
    })
  );
}


function createCharacter() {
  const name = document.getElementById("characterNameInput").value;
  const bio = document.getElementById("characterBioInput").value;
  const imageFile = document.getElementById("characterImageInput").files[0];
  const universeName = document.getElementById("universeNameMiddle").textContent;

  if (!name || !bio) return alert("Please fill in both the name and bio fields.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const newCharacter = { name, bio, image: e.target.result, universe: universeName };
    characters.push(newCharacter);
    localStorage.setItem("characters", JSON.stringify(characters));
    displayCharactersForUniverse(universeName);
    showScreen("universeDetailScreen", "#/Universe_Detail");
  };

  if (imageFile) {
    reader.readAsDataURL(imageFile);
  } else {
    const newCharacter = {
      name,
      bio,
      image: "/images/character-placeholder.png",
      universe: universeName
    };
    characters.push(newCharacter);
    localStorage.setItem("characters", JSON.stringify(characters));
    displayCharactersForUniverse(universeName);
    showScreen("universeDetailScreen", "#/Universe_Detail");
  }
}


function displayCharactersForUniverse(universeName) {
  const container = document.getElementById("characterListMiddle");
  container.innerHTML = "";

  const filtered = characters.filter(c => c.universe === universeName);
  filtered.forEach((c, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4 class="card-name">${c.name}</h4>
      <img src="${c.image}" alt="${c.name}" class="card-image">
      <p class="card-about">${c.bio}</p>
      <button class="btn delete-character-btn" data-index="${index}">Delete Character</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".delete-character-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const index = e.target.dataset.index;
      const characterToDelete = filtered[index];
      characters = characters.filter(c => c !== characterToDelete);
      localStorage.setItem("characters", JSON.stringify(characters));
      displayCharactersForUniverse(universeName);
    })
  );
}

