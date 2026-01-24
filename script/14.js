// ┌──────────────────────────────┐
// │ INISIALISASI EDITOR          │
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
// │ FITUR INGAT & SIMPAN         │
// └──────────────────────────────┘
(function loadSavedData() {
  const savedContent = localStorage.getItem('editorContent');
  const savedMode = localStorage.getItem('editorMode') || 'htmlmixed';
  
  if (savedContent !== null) {
    editor.setValue(savedContent);
  }
  editor.setOption('mode', savedMode);
})();

editor.on("change", function() {
  localStorage.setItem('editorContent', editor.getValue());
});

function saveCurrentMode(mode) {
  localStorage.setItem('editorMode', mode);
}

// ┌──────────────────────────────┐
// │ FUNGSI HAPUS SEMUA DATA      │
// └──────────────────────────────┘
function clearAllSavedData() {
  // Hapus dari localStorage
  localStorage.removeItem('editorContent');
  localStorage.removeItem('editorMode');
  localStorage.removeItem('splitViewState');

  // Jika SQLite tersedia (Cordova), hapus data di database
  if (window.cordova && window.sqlitePlugin) {
    document.addEventListener('deviceready', function() {
      const db = window.sqlitePlugin.openDatabase({ name: 'editor_data.db', location: 'default' });      db.transaction(function(tx) {
        tx.executeSql('DELETE FROM settings', [], () => {
          console.log('Data SQLite dihapus.');
        }, (tx, err) => {
          console.error('Gagal hapus data SQLite:', err);
        });
      });
    }, false);
  }

  // Kosongkan editor dan reset mode
  editor.setValue('');
  editor.setOption('mode', 'htmlmixed');
  editor.focus();

  // Opsional: tampilkan notifikasi
  alert("Semua data tersimpan telah dihapus. Editor dikosongkan.");
}

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
  
  document.getElementById("previewFrame").srcdoc = code || "<h2 align='center'>Isi kode terlebih dahulu.</h2>";
  document.getElementById("liveFrame").srcdoc = code || "<h2 align='center'>Tulis kode HTML untuk melihat pratinjau langsung.</h2>";
  
  if (document.getElementById("modalPreview").style.display === "flex") {
    document.getElementById("previewTitle").textContent = `Pratinjau : ${title}`;
  }
  
  if (document.getElementById("split-layout").style.display === "flex") {
    document.getElementById("splitPreviewTitle").textContent = `Pratinjau : ${title}`;
  }}
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
// │ HAPUS SEMUA (FAB)            │
// └──────────────────────────────┘
const fabClearBtn = document.getElementById("fabClear");
if (fabClearBtn) {
  fabClearBtn.addEventListener("click", () => {
    if (confirm("Hapus semua data tersimpan? Ini akan mengosongkan editor dan menghapus riwayat penyimpanan.")) {
      clearAllSavedData();
    }
    fab.classList.remove("open");
  });
}
// ┌──────────────────────────────┐
// │ PRATINJAU MODAL DENGAN FADE-IN │
// └──────────────────────────────┘
document.getElementById("fabPreview").addEventListener("click", () => {
  const code = editor.getValue();
  const title = extractTitleFromHTML(code);
  document.getElementById("previewTitle").textContent = `Pratinjau : ${title}`;
  updateAllPreviews();

  const modal = document.getElementById("modalPreview");
  modal.style.display = "flex";
  modal.style.opacity = "0";
  void modal.offsetWidth;
  modal.style.opacity = "1";
  modal.classList.add("fade-in-active");

  fab.classList.remove("open");
});

// ┌──────────────────────────────┐
// │ MODE SPLIT DENGAN ANIMASI    │
// └──────────────────────────────┘
document.getElementById("splitViewBtn").addEventListener("click", () => {
  const modalPreview = document.getElementById("modalPreview");
  
  modalPreview.classList.add("modal-fade-out");
  
  setTimeout(() => {
    modalPreview.style.display = "none";
    modalPreview.classList.remove("modal-fade-out");

    const editorContainer = document.querySelector(".CodeMirror");
    document.getElementById("editor-split-container").appendChild(editorContainer);

    const code = editor.getValue();
    const title = extractTitleFromHTML(code);
    document.getElementById("splitPreviewTitle").textContent = `Pratinjau : ${title}`;

    document.getElementById("default-layout").style.display = "none";
    const splitLayout = document.getElementById("split-layout");
    splitLayout.style.display = "flex";
    void splitLayout.offsetWidth;
    splitLayout.classList.add("active");
  }, 300);
});

// ┌──────────────────────────────┐
// │ TUTUP MODE SPLIT             │
// └──────────────────────────────┘
document.getElementById("closeSplitBtn").addEventListener("click", () => {  const splitLayout = document.getElementById("split-layout");
  splitLayout.classList.remove("active");

  setTimeout(() => {
    const editorContainer = document.querySelector(".CodeMirror");
    document.getElementById("editor-container").appendChild(editorContainer);

    splitLayout.style.display = "none";
    document.getElementById("default-layout").style.display = "flex";

    editor.focus();
  }, 400);
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

  closeBtn.onclick = () => {
    modal.classList.remove("fade-in-active");
    modal.style.display = "none";
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove("fade-in-active");
      modal.style.display = "none";
    }
  };
});