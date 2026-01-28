// ┌──────────────────────────────┐
// │ BAR AKSES SIMBOL CEPAT       │
// └──────────────────────────────┘
document.querySelectorAll(".sym-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let char = btn.getAttribute("data-char");
    if (!char || !editor) return;

    // Handle kasus khusus
    if (char === "newline") {
      editor.replaceSelection("\n");
    } else if (char === "backspace") {
      const from = editor.getCursor(true);   // anchor
      const to = editor.getCursor(false);    // head
      // Jika tidak ada seleksi, hapus 1 karakter ke kiri
      if (from.line === to.line && from.ch === to.ch) {
        if (from.ch > 0) {
          const newPos = { line: from.line, ch: from.ch - 1 };
          editor.replaceRange("", newPos, from);
          editor.setCursor(newPos);
        }
      } else {
        // Jika ada seleksi, hapus seperti biasa
        editor.replaceSelection("");
      }
    } else {
      // Sisipkan karakter biasa
      editor.replaceSelection(char);
    }

    editor.focus();
  });
});