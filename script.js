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
// ===== CLICK =====
board.addEventListener("click", (e) => {
  if (!gameStarted) return;

  if (gameMode === "aiai") return;

  const piece = e.target.closest(".piece");
  const cell = e.target.closest(".cell");

  // chọn quân
  if (piece) {
    if (currentPlayer === "red" && !piece.classList.contains("red")) return;
    if (currentPlayer === "black" && !piece.classList.contains("black")) return;

    document
      .querySelectorAll(".piece")
      .forEach((p) => p.classList.remove("selected"));

    piece.classList.add("selected");
    selectedPiece = piece;
    return;
  }

  // di chuyển
  if (cell && selectedPiece) {
    const from = selectedPiece.parentElement;
    const result = isValidMove(from, cell, selectedPiece);

    if (!result) return;

    if (result === "capture") {
      const mid = getCell(
        (+from.dataset.row + +cell.dataset.row) / 2,
        (+from.dataset.col + +cell.dataset.col) / 2,
      );
      mid.innerHTML = "";
      noCaptureCount = 0;
    } else {
      noCaptureCount++;
    }

    cell.appendChild(selectedPiece);

    addMove(
      { row: +from.dataset.row, col: +from.dataset.col },
      { row: +cell.dataset.row, col: +cell.dataset.col },
      currentPlayer,
    );

    // king
    const row = +cell.dataset.row;
    if (selectedPiece.classList.contains("red") && row === 0)
      selectedPiece.classList.add("king");

    if (selectedPiece.classList.contains("black") && row === 7)
      selectedPiece.classList.add("king");

    selectedPiece.classList.remove("selected");
    selectedPiece = null;

    if (checkWin()) return;

    currentPlayer = "black";

    if (gameMode === "pvai") {
      setTimeout(() => {
        aiMove("black");
        checkWin(); // thêm dòng này cho chắc
      }, 800);
    }
  }
});
// ===== VALID MOVE =====
function isValidMove(from, to, piece) {
  const fr = +from.dataset.row;
  const fc = +from.dataset.col;
  const tr = +to.dataset.row;
  const tc = +to.dataset.col;

  const dr = tr - fr;
  const dc = tc - fc;

  if (to.children.length > 0) return false;

  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  // ăn
  if (absR === 2 && absC === 2) {
    const mid = getCell(fr + dr / 2, fc + dc / 2);
    if (mid && mid.children.length && isEnemy(piece, mid.children[0])) {
      return "capture";
    }
  }

  // đi thường
  if (absR === 1 && absC === 1) {
    if (isKing(piece)) return "move";

    if (piece.classList.contains("red") && dr === -1) return "move";
    if (piece.classList.contains("black") && dr === 1) return "move";
  }

  return false;
}
// ===== CHECK CAPTURE =====
function canCapture(from, piece) {
  const r = +from.dataset.row;
  const c = +from.dataset.col;

  const dirs = isKing(piece)
    ? [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
    : piece.classList.contains("red")
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

  for (let [dr, dc] of dirs) {
    const mid = getCell(r + dr, c + dc);
    const land = getCell(r + dr * 2, c + dc * 2);

    if (
      mid &&
      land &&
      mid.children.length &&
      isEnemy(piece, mid.children[0]) &&
      land.children.length === 0
    )
      return true;
  }

  return false;
}
// ===== HELPERS =====
function getCell(r, c) {
  return document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
}
function isEnemy(a, b) {
  return (
    (a.classList.contains("red") && b.classList.contains("black")) ||
    (a.classList.contains("black") && b.classList.contains("red"))
  );
}
function isKing(p) {
  return p.classList.contains("king");
}
function addMove(from, to, player) {
  const box =
    player === "red"
      ? document.getElementById("moves-red")
      : document.getElementById("moves-black");

  const div = document.createElement("div");
  div.classList.add("move-item");

  div.innerText = `${toChessNotation(from.row, from.col)} → ${toChessNotation(to.row, to.col)}`;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function toChessNotation(row, col) {
  const letters = "ABCDEFGH";
  return letters[col] + (8 - row);
}
