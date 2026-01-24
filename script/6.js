// ┌──────────────────────────────┐// │ INISIALISASI EDITOR          │
// └──────────────────────────────┘
const textarea = document.getElementById("editor");
let editor = CodeMirror.fromTextArea(textarea, {
  lineNumbers: true,
  theme: "dracula",
  mode: "htmlmixed",
  autoCloseBrackets: true,
  autoCloseTags: true,
  matchBrackets: true,
  tabSize: 2,
  indentUnit: 2
});
editor.focus();

// ┌──────────────────────────────┐
// │ EKSTRAK JUDUL                │
// └──────────────────────────────┘
function extractTitleFromHTML(html) {
  const parser = new DOMParser();
  try {
    const doc = parser.parseFromString(html, "text/html");
    const titleEl = doc.querySelector("title");
    return titleEl ? titleEl.textContent.trim() : "Tanpa Judul";
  } catch (e) {
    return "Tidak Valid";
  }
}

// ┌──────────────────────────────┐
// │ UPDATE SEMUA PREVIEW + JUDUL │
// └──────────────────────────────┘
function updateAllPreviews() {
  const code = editor.getValue();
  const title = extractTitleFromHTML(code);
  
  // Update iframe
  document.getElementById("previewFrame").srcdoc = code || "<h2 align='center'>Isi kode terlebih dahulu.</h2>";
  document.getElementById("liveFrame").srcdoc = code || "<h2 align='center'>Tulis kode HTML untuk melihat pratinjau langsung.</h2>";
  
  // Update judul di modal (jika terbuka)
  if (document.getElementById("modalPreview").style.display === "flex") {
    document.getElementById("previewTitle").textContent = `Pratinjau : ${title}`;
  }
  
  // Update judul di mode split (jika aktif)
  if (document.getElementById("split-layout").style.display === "flex") {
    document.getElementById("splitPreviewTitle").textContent = `Pratinjau : ${title}`;
  }
}
// Sinkronisasi otomatis
editor.on("change", updateAllPreviews);

// ┌──────────────────────────────┐
// │ FAB & MODAL                  │
// └──────────────────────────────┘
const fab = document.getElementById("fab");
fab.querySelector(".main").addEventListener("click", (e) => {
  e.stopPropagation();
  fab.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!fab.contains(e.target)) fab.classList.remove("open");
});

// ┌──────────────────────────────┐
// │ SALIN                        │
// └──────────────────────────────┘
function showCopyNotification() {
  const notif = document.getElementById("copyNotification");
  notif.classList.remove("hide");
  notif.classList.add("show");
  setTimeout(() => {
    notif.classList.remove("show");
    notif.classList.add("hide");
  }, 2000);
  setTimeout(() => notif.classList.remove("hide"), 2500);
}

document.getElementById("fabCopy").addEventListener("click", () => {
  navigator.clipboard.writeText(editor.getValue()).then(() => {
    showCopyNotification();
    fab.classList.remove("open");
  }).catch(() => alert("Gagal menyalin."));
});

// ┌──────────────────────────────┐
// │ PRATINJAU MODAL              │
// └──────────────────────────────┘
document.getElementById("fabPreview").addEventListener("click", () => {
  const code = editor.getValue();
  const title = extractTitleFromHTML(code);
  document.getElementById("previewTitle").textContent = `Pratinjau : ${title}`;
  updateAllPreviews();
  document.getElementById("modalPreview").style.display = "flex";
  fab.classList.remove("open");
});
// ┌──────────────────────────────┐
// │ MODE SPLIT                   │
// └──────────────────────────────┘
document.getElementById("splitViewBtn").addEventListener("click", () => {
  document.getElementById("modalPreview").style.display = "none";
  
  // Pindahkan editor
  const editorContainer = document.querySelector(".CodeMirror");
  document.getElementById("editor-split-container").appendChild(editorContainer);
  
  // Tampilkan layout split
  document.getElementById("default-layout").style.display = "none";
  document.getElementById("split-layout").style.display = "flex";
  
  // Update judul split
  const code = editor.getValue();
  const title = extractTitleFromHTML(code);
  document.getElementById("splitPreviewTitle").textContent = `Pratinjau : ${title}`;
});

// ┌──────────────────────────────┐
// │ TUTUP MODE SPLIT             │
// └──────────────────────────────┘
document.getElementById("closeSplitBtn").addEventListener("click", () => {
  const editorContainer = document.querySelector(".CodeMirror");
  document.getElementById("editor-container").appendChild(editorContainer);
  
  document.getElementById("split-layout").style.display = "none";
  document.getElementById("default-layout").style.display = "flex";
  
  editor.focus();
});

// ┌──────────────────────────────┐
// │ MODAL TIPS                   │
// └──────────────────────────────┘
document.getElementById("fabTips").addEventListener("click", () => {
  document.getElementById("modalTips").style.display = "flex";
  fab.classList.remove("open");
});

// ┌──────────────────────────────┐
// │ TUTUP MODAL                  │
// └──────────────────────────────┘
["Tips", "Preview"].forEach(name => {
  const closeBtn = document.getElementById(`close${name}`);
  const modal = document.getElementById(`modal${name}`);
  closeBtn.onclick = () => modal.style.display = "none";
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";  };
});