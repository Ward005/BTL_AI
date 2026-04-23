// ===== POPUP =====
const popup = document.getElementById("popup");
const btnOption = document.getElementById("btnOption");
const closePopup = document.getElementById("closePopup");

// mở
btnOption.addEventListener("click", () => {
  popup.classList.remove("d-none");
});

// đóng
closePopup.addEventListener("click", () => {
  popup.classList.add("d-none");
});

// click ngoài
popup.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("d-none");
  }
});

// Scroll tới section
document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    if (!target) return;
    const section = document.getElementById(target);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

//Scroll
const backToTop = document.getElementById("backToTop");

// hiện khi scroll xuống
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

// click → lên đầu trang
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Result buttons
document.getElementById("playAgain").addEventListener("click", () => {
  document.getElementById("resultPopup").classList.add("d-none");
  document.getElementById("startBtn").click();
});

document.getElementById("goMenu").addEventListener("click", () => {
  document.getElementById("resultPopup").classList.add("d-none");
  document.getElementById("mode").style.display = "flex";
  document
    .querySelectorAll(".player")
    .forEach((i) => i.classList.add("d-none"));
  document.querySelector(".board").classList.add("index");
  resetMoves();
  initBoard();
});

//NewGame
const newGame = document.querySelector("[data-target='top']");
newGame.addEventListener("click", () => {
  document.getElementById("mode").style.display = "flex";
  document
    .querySelectorAll(".player")
    .forEach((i) => i.classList.add("d-none"));
  document.querySelector(".board").classList.add("index");
  resetMoves();
  initBoard();
});
//End Scroll
