// ┌──────────────────────────────┐
// │ BAR AKSES SIMBOL CEPAT       │
// └──────────────────────────────┘
document.querySelectorAll(".sym-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const char = btn.getAttribute("data-char");
    if (char && editor) {
      // Masukkan karakter di posisi kursor
      editor.replaceSelection(char);
      editor.focus();
    }
  });
});