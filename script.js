// ===== ELEMENT =====
const board = document.getElementById("board");

// ===== STATE =====
let gameMode = "pvai"; // pvai | aiai
let aiDifficulty = "easy"; // easy | hard
let gameStarted = false;
let currentPlayer = "red";
let selectedPiece = null;
let noCaptureCount = 0;
let moveCount = 1;

// ===== INIT BOARD =====
function initBoard() {
  board.innerHTML = "";

  for (let i = 0; i < 64; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const row = Math.floor(i / 8);
    const col = i % 8;

    cell.dataset.row = row;
    cell.dataset.col = col;

    const isDark = (row + col) % 2 !== 0;

    if (isDark) {
      cell.classList.add("dark");

      if (row < 3) {
        const p = document.createElement("div");
        p.classList.add("piece", "black");
        cell.appendChild(p);
      }

      if (row > 4) {
        const p = document.createElement("div");
        p.classList.add("piece", "red");
        cell.appendChild(p);
      }
    } else {
      cell.classList.add("light");
    }

    board.appendChild(cell);
  }
}
// ===== MODE =====
document.querySelectorAll(".mode-item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".mode-item")
      .forEach((i) => i.classList.remove("active"));

    item.classList.add("active");
    gameMode = item.dataset.mode;
    const diffSection = document.getElementById("difficulty");
    if (gameMode === "aiai") {
      diffSection.classList.remove("d-none");
    } else {
      diffSection.classList.add("d-none");
      aiDifficulty = "easy"; // default for PvAI
    }
  });
});
// Difficulty selector
document.querySelectorAll(".diff-item").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".diff-item")
      .forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    aiDifficulty = item.dataset.diff;
  });
});
// ===== START =====
function resetMoves() {
  document.getElementById("moves-red").innerHTML = "";
  document.getElementById("moves-black").innerHTML = "";
  moveCount = 1;
  noCaptureCount = 0;
}
document.getElementById("startBtn").onclick = () => {
  resetMoves();
  gameStarted = true;
  currentPlayer = "red";

  document.getElementById("mode").style.display = "none";
  document
    .querySelectorAll(".player")
    .forEach((i) => i.classList.remove("d-none"));

  document.querySelector(".board").classList.remove("index");

  initBoard();

  if (gameMode === "aiai") {
    aiAIGameLoop();
  }
};