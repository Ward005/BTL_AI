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
// ===== AI =====
// ================= STATE (LOGIC) =================
function getBoardState() {
  const state = Array.from({ length: 8 }, () => Array(8).fill(null));

  document.querySelectorAll(".cell").forEach((cell) => {
    const r = +cell.dataset.row;
    const c = +cell.dataset.col;

    if (cell.children.length) {
      const p = cell.children[0];
      state[r][c] = {
        color: p.classList.contains("red") ? "red" : "black",
        king: p.classList.contains("king"),
      };
    }
  });

  return state;
}
// ================= MOVE GENERATION =================
function getAllMoves(state, player) {
  const moves = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 0) continue; // skip light squares
      const piece = state[r][c];
      if (!piece || piece.color !== player) continue;

      console.log(
        `[MOVES DEBUG] Piece ${player} at [${r},${c}] king:${piece.king}`,
      );

      const dirs = piece.king
        ? [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ]
        : player === "black"
          ? [
              [1, 1],
              [1, -1],
            ]
          : [
              [-1, 1],
              [-1, -1],
            ];

      for (let [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;

        // move - check target dark
        if (
          nr >= 0 &&
          nr < 8 &&
          nc >= 0 &&
          nc < 8 &&
          (nr + nc) % 2 !== 0 &&
          state[nr]?.[nc] === null
        ) {
          moves.push({ from: [r, c], to: [nr, nc] });
        }

        // capture - check land dark
        let cr = r + dr * 2;
        let cc = c + dc * 2;
        if (
          cr >= 0 &&
          cr < 8 &&
          cc >= 0 &&
          cc < 8 &&
          (cr + cc) % 2 !== 0 &&
          state[nr]?.[nc] &&
          state[nr][nc].color !== player &&
          state[cr]?.[cc] === null
        ) {
          moves.push({
            from: [r, c],
            to: [cr, cc],
            capture: [nr, nc],
          });
        }
      }
    }
  }

  return moves;
}
// ================= APPLY MOVE =================
function applyMove(state, move) {
  const newState = JSON.parse(JSON.stringify(state));

  const [fr, fc] = move.from;
  const [tr, tc] = move.to;

  newState[tr][tc] = newState[fr][fc];
  newState[fr][fc] = null;

  if (move.capture) {
    const [cr, cc] = move.capture;
    newState[cr][cc] = null;
  }

  // phong vua
  if (newState[tr][tc]) {
    if (newState[tr][tc].color === "black" && tr === 7)
      newState[tr][tc].king = true;

    if (newState[tr][tc].color === "red" && tr === 0)
      newState[tr][tc].king = true;
  }

  return newState;
}

// ================= EVALUATE =================
function evaluate(state) {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state[r][c];
      if (!p) continue;

      let val = p.king ? 3 : 1;

      if (p.color === "black") score += val;
      else score -= val;
    }
  }

  return score;
}
function minimax(state, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0) {
    return evaluate(state);
  }

  const player = maximizingPlayer ? "black" : "red";
  const moves = getAllMoves(state, player);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const newState = applyMove(state, move);
      const evalScore = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const newState = applyMove(state, move);
      const evalScore = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
function getBestMove(player, depth) {
  console.log(`[AI DEBUG] getBestMove ${player} depth ${depth}, computing...`);
  const state = getBoardState();
  const moves = getAllMoves(state, player);
  console.log(`[AI DEBUG] Found ${moves.length} moves`);

  let bestMove = null;
  let bestScore = player === "black" ? -Infinity : Infinity; // black max, red min?

  for (let move of moves) {
    const newState = applyMove(state, move);
    const score = minimax(
      newState,
      depth - 1,
      -Infinity,
      Infinity,
      player !== "black",
    );
    console.log(`Move ${JSON.stringify(move)} score: ${score}`);

    if (
      (player === "black" && score > bestScore) ||
      (player === "red" && score < bestScore)
    ) {
      bestScore = score;
      bestMove = move;
    }
  }

  console.log(`[AI DEBUG] Best move:`, bestMove);
  return bestMove;
}
function checkWin() {
  const redPieces = document.querySelectorAll(".piece.red").length;
  const blackPieces = document.querySelectorAll(".piece.black").length;

  // hết quân
  if (redPieces === 0) return (showResult("black"), true);
  if (blackPieces === 0) return (showResult("red"), true);

  // KHÔNG CÒN NƯỚC ĐI
  if (!hasAnyMove("red")) return (showResult("black"), true);
  if (!hasAnyMove("black")) return (showResult("red"), true);

  // hòa
  if (noCaptureCount >= 20) {
    showResult("draw");
    return true;
  }

  return false;
}
function showResult(r) {
  gameStarted = false;

  const popup = document.getElementById("resultPopup");
  const text = document.getElementById("resultText");

  popup.classList.remove("d-none");

  if (gameMode === "aiai") {
    text.innerText =
      r === "draw" ? "Hòa 🤝" : r === "red" ? "Red thắng!" : "Black thắng!";
  } else {
    text.innerText =
      r === "red" ? "Bạn thắng 🎉" : r === "black" ? "Bạn thua 😢" : "Hòa 🤝";
  }
}
function hasAnyMove(player) {
  const state = getBoardState();
  const moves = getAllMoves(state, player);
  return moves.length > 0;
}

function aiMove(player) {
  console.log(`[AI DEBUG] aiMove called for ${player}`);

  if (!gameStarted) return;

  const depth = aiDifficulty === "hard" ? 4 : 2;

  const bestMove = getBestMove(player, depth);

  if (!bestMove) {
    if (checkWin()) return;
    showResult(player === "red" ? "black" : "red");
    return;
  }

  const from = getCell(bestMove.from[0], bestMove.from[1]);
  const to = getCell(bestMove.to[0], bestMove.to[1]);

  makeMove(from, to, player);
}
function makeMove(from, to, player) {
  const piece = from.children[0];
  const result = isValidMove(from, to, piece);

  if (result === "capture") {
    const midr = (+from.dataset.row + +to.dataset.row) / 2;
    const midc = (+from.dataset.col + +to.dataset.col) / 2;
    const mid = getCell(midr, midc);
    if (mid) mid.innerHTML = "";
    noCaptureCount = 0;
  } else {
    noCaptureCount++;
  }

  to.appendChild(piece);

  const row = +to.dataset.row;
  if (player === "black" && row === 7) piece.classList.add("king");
  if (player === "red" && row === 0) piece.classList.add("king");

  addMove(
    { row: +from.dataset.row, col: +from.dataset.col },
    { row: +to.dataset.row, col: +to.dataset.col },
    player,
  );

  if (checkWin()) return;

  currentPlayer = player === "black" ? "red" : "black";
}
function aiAIGameLoop() {
  if (!gameStarted || gameMode !== "aiai") return;

  setTimeout(() => {
    if (gameStarted && gameMode === "aiai") {
      aiMove(currentPlayer);
      if (gameStarted) aiAIGameLoop();
    }
  }, 800);
}

// ===== INIT =====
initBoard();
