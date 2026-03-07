import { modes } from "./data/modes.js";

const modeSelect = document.getElementById("mode");
const nameInput = document.getElementById("name");
const generateBtn = document.getElementById("generate");
const outputCard = document.getElementById("output-card");
const complimentText = document.getElementById("compliment-text");
const copyBtn = document.getElementById("copy-btn");
const copyLabel = document.getElementById("copy-label");
const favBtn = document.getElementById("fav-btn");
const toast = document.getElementById("toast");
const favouritesSection = document.getElementById("favourites-section");
const favouritesList = document.getElementById("favourites-list");
const clearFavsBtn = document.getElementById("clear-favs");

let currentCompliment = "";
let lastIndex = -1;
let lastMode = "";
let favourites = JSON.parse(localStorage.getItem("compliment-favs") || "[]");

function pickRandom(arr, avoidIndex, mode) {
  if (arr.length <= 1) return 0;
  // Avoid repeating the last compliment in the same mode
  if (mode !== lastMode) return Math.floor(Math.random() * arr.length);
  let idx;
  do {
    idx = Math.floor(Math.random() * arr.length);
  } while (idx === avoidIndex);
  return idx;
}

function generateCompliment() {
  const modeId = modeSelect.value;
  const name = nameInput.value.trim();
  const mode = modes[modeId];
  if (!mode) return;

  const templates = mode.templates;

  // Filter: if no name given, prefer templates without {name}
  let pool = name
    ? templates
    : templates.filter((t) => !t.includes("{name}"));
  if (pool.length === 0) pool = templates;

  const idx = pickRandom(pool, lastIndex, modeId);
  lastIndex = idx;
  lastMode = modeId;

  let result = pool[idx];
  result = result.replace(/\{name\}/g, name || "You");

  currentCompliment = result;

  // Reset saved state
  favBtn.classList.remove("saved");

  // Animate card
  outputCard.classList.remove("hidden");
  outputCard.style.animation = "none";
  // Trigger reflow
  outputCard.offsetHeight;
  outputCard.style.animation = "";

  complimentText.textContent = result;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function copyCompliment() {
  if (!currentCompliment) return;
  navigator.clipboard.writeText(currentCompliment).then(() => {
    copyLabel.textContent = "Copied!";
    showToast("Copied to clipboard");
    setTimeout(() => (copyLabel.textContent = "Copy"), 2000);
  });
}

function saveFavourite() {
  if (!currentCompliment) return;
  if (favourites.includes(currentCompliment)) {
    // Remove from favourites
    favourites = favourites.filter((f) => f !== currentCompliment);
    favBtn.classList.remove("saved");
    showToast("Removed from favourites");
  } else {
    favourites.unshift(currentCompliment);
    favBtn.classList.add("saved");
    showToast("Saved to favourites");
  }
  localStorage.setItem("compliment-favs", JSON.stringify(favourites));
  renderFavourites();
}

function renderFavourites() {
  if (favourites.length === 0) {
    favouritesSection.classList.add("hidden");
    return;
  }
  favouritesSection.classList.remove("hidden");
  favouritesList.innerHTML = "";
  favourites.forEach((fav, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = fav;
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-fav";
    removeBtn.textContent = "\u00d7";
    removeBtn.addEventListener("click", () => {
      favourites.splice(i, 1);
      localStorage.setItem("compliment-favs", JSON.stringify(favourites));
      renderFavourites();
    });
    li.appendChild(span);
    li.appendChild(removeBtn);
    favouritesList.appendChild(li);
  });
}

function clearFavourites() {
  favourites = [];
  localStorage.setItem("compliment-favs", JSON.stringify(favourites));
  renderFavourites();
  showToast("Favourites cleared");
}

// Event listeners
generateBtn.addEventListener("click", generateCompliment);
copyBtn.addEventListener("click", copyCompliment);
favBtn.addEventListener("click", saveFavourite);
clearFavsBtn.addEventListener("click", clearFavourites);

// Keyboard shortcut: Enter to generate
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== nameInput) {
    generateCompliment();
  }
});

// Init
renderFavourites();
