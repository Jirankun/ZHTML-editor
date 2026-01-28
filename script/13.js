// ┌──────────────────────────────┐
// │ PLUGIN YANG DIGUNAKAN        │
// └──────────────────────────────┘
// Plugin yang digunakan:
// - cordova-sqlite-storage: untuk menyimpan data di database SQLite
// - cordova-plugin-file: untuk mengakses sistem file aplikasi
//
// ┌──────────────────────────────┐
// │ INISIALISASI EDITOR          │
// └──────────────────────────────┘
const textarea = document.getElementById("editor");
let editor = null;

// Inisialisasi editor hanya jika elemen ditemukan
if (textarea) {
  editor = CodeMirror.fromTextArea(textarea, {
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
} else {
  console.error("Element dengan ID 'editor' tidak ditemukan!");
}

// ┌──────────────────────────────┐
// │ FUNGSI PEWARNAAN DOCTYPE     │
// └──────────────────────────────┘
function highlightDoctype() {
  if (!editor) return;

  // Hapus semua mark yang sudah ada
  editor.getAllMarks().forEach(mark => {
    if (mark.className === 'doctype-highlight') {
      mark.clear();
    }
  });

  const content = editor.getValue();
  const doctypeRegex = /&lt;!DOCTYPE\s+html&gt;|<!DOCTYPE\s+html>/gi;
  let match;

  while ((match = doctypeRegex.exec(content)) !== null) {
    const start = editor.posFromIndex(match.index);
    const end = editor.posFromIndex(match.index + match[0].length);

    // Tambahkan highlight ke teks DOCTYPE
    editor.markText(start, end, {
      className: "doctype-highlight",
      title: "DOCTYPE HTML"
    });
  }
}

// Tambahkan event listener untuk memanggil fungsi highlight saat editor berubah
if (editor) {
  editor.on("change", function() {
    // Gunakan setTimeout untuk memastikan perubahan telah diterapkan
    setTimeout(highlightDoctype, 0);
  });
}

// Tambahkan CSS untuk styling DOCTYPE
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  .doctype-highlight {
    background-color: #808080 !important; /* Abu-abu */
    color: white !important;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
  }
`;
document.getElementsByTagName('head')[0].appendChild(style);

// ┌──────────────────────────────┐
// │ DETEKSI BAHASA PEMROGRAMAN   │
// └──────────────────────────────┘
let detectedLanguage = 'html'; // Default ke HTML

// Fungsi untuk mendeteksi bahasa berdasarkan awalan teks
function detectLanguage() {
  if (!editor) return 'html';

  const content = editor.getValue();

  // Deteksi markdown dengan <!MRK> di awal
  if (content.trim().startsWith('<!MRK>')) {
    return 'markdown';
  }

  // Deteksi HTML dengan <!DOCTYPE> di awal
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('&lt;!DOCTYPE')) {
    return 'html';
  }

  // Default ke HTML
  return 'html';
}

// Fungsi untuk mengupdate mode editor berdasarkan bahasa terdeteksi
function updateEditorMode() {
  const newLanguage = detectLanguage();

  if (newLanguage !== detectedLanguage) {
    detectedLanguage = newLanguage;

    switch(detectedLanguage) {
      case 'markdown':
        editor.setOption('mode', 'markdown');
        break;
      case 'html':
      default:
        editor.setOption('mode', 'htmlmixed');
        break;
    }

    // Simpan mode terbaru
    saveCurrentMode(editor.getOption('mode'));
  }
}

// Tambahkan highlight untuk <!MRK>
function highlightMRK() {
  if (!editor) return;

  // Hapus semua mark MRK yang sudah ada
  editor.getAllMarks().forEach(mark => {
    if (mark.className === 'mrk-highlight') {
      mark.clear();
    }
  });

  const content = editor.getValue();

  // Cari <!MRK> di awal dokumen
  if (content.trim().startsWith('<!MRK>')) {
    const start = editor.posFromIndex(0);
    const end = editor.posFromIndex(7); // Panjang <!MRK>

    // Tambahkan highlight ke teks <!MRK>
    editor.markText(start, end, {
      className: "mrk-highlight",
      title: "Markdown Identifier"
    });
  }
}

// ┌──────────────────────────────┐
// │ FUNGSI AUTO-ENTER MOBILE     │
// └──────────────────────────────┘
// Deteksi apakah sedang dijalankan di mobile
function isMobileDevice() {
  return (typeof window.orientation !== "undefined") ||
         (navigator.userAgent.indexOf("IEMobile") !== -1) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

// Fungsi untuk menambahkan closing tag dan enter saat di mobile
function setupAutoEnterForMobile() {
  if (!isMobileDevice()) {
    return; // Hanya aktifkan di perangkat mobile
  }

  if (!editor) return;

  // Daftar tag yang akan diproses
  const tagsToProcess = [
    'head', 'body', 'div', 'section', 'article', 'header', 'footer',
    'nav', 'aside', 'main', 'form', 'table', 'thead', 'tbody',
    'tr', 'td', 'th', 'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'span', 'strong', 'em', 'script', 'style',
    'title', 'meta', 'link', 'button', 'input', 'select', 'option'
  ];

  // Variabel untuk menyimpan state sebelumnya
  let previousContent = editor.getValue();

  // Event listener untuk perubahan di editor
  editor.on("change", function(instance, changeObj) {
    if (changeObj.origin === 'setValue') return; // Hindari saat setValue

    const currentContent = instance.getValue();

    // Deteksi perubahan terakhir
    if (currentContent.length > previousContent.length) {
      // Ada penambahan karakter
      const addedText = currentContent.substring(previousContent.length);
      const lastChar = currentContent.charAt(currentContent.length - 1);

      // Jika karakter terakhir adalah '>'
      if (lastChar === '>') {
        // Cek apakah ini opening tag yang perlu closing tag
        for (const tag of tagsToProcess) {
          // Cocokkan opening tag yang berakhir dengan '>'
          const openingTagRegex = new RegExp(`<${tag}(>|\\s[^>]*>)$`, 'i');

          // Ambil bagian akhir dari konten untuk diperiksa
          const lastPart = currentContent.substring(Math.max(0, currentContent.length - 50));

          if (openingTagRegex.test(lastPart)) {
            // Cek apakah closing tag sudah ada
            const closingTag = `</${tag}>`;
            const remainingContent = currentContent.substring(currentContent.lastIndexOf('<'));

            // Jika closing tag belum ada di sisa konten
            if (!remainingContent.includes(closingTag)) {
              // Tambahkan baris baru dan closing tag
              const cursor = instance.getCursor();

              // Tambahkan baris baru dan closing tag
              instance.replaceRange('\n' + closingTag, cursor);

              // Pindahkan kursor ke posisi sebelum closing tag (ke baris baru)
              setTimeout(() => {
                instance.setCursor({line: cursor.line + 1, ch: 0});
                instance.focus();
              }, 10);

              break; // Hentikan loop setelah menemukan tag pertama
            }
          }
        }
      }
    }

    // Update previousContent
    previousContent = instance.getValue();

    // Panggil fungsi deteksi bahasa dan highlight
    updateEditorMode();
    highlightMRK();
  });
}

// Tambahkan event listener untuk mendeteksi perubahan bahasa
if (editor) {
  editor.on("change", function() {
    updateEditorMode();
    highlightMRK();
  });
}

// Tambahkan CSS untuk styling MRK
const mrkStyle = document.createElement('style');
mrkStyle.type = 'text/css';
mrkStyle.innerHTML = `
  .mrk-highlight {
    background-color: #808080 !important; /* Abu-abu */
    color: white !important;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
  }
`;
document.getElementsByTagName('head')[0].appendChild(mrkStyle);

// Aktifkan fungsi auto-enter untuk mobile
setupAutoEnterForMobile();

// ┌──────────────────────────────┐
// │ FITUR INGAT & SIMPAN         │
// └──────────────────────────────┘
let db = null;
let isCordova = false;

// Deteksi apakah running di Cordova
if (window.cordova && window.sqlitePlugin) {
  isCordova = true;
}

// Inisialisasi database SQLite
function initDB() {
  if (isCordova) {
    document.addEventListener('deviceready', function() {
      try {
        db = window.sqlitePlugin.openDatabase({
          name: 'editor_data.db',
          location: 'default'
        });

        db.transaction(function(tx) {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, key TEXT UNIQUE, value TEXT)',
            [],
            function(tx, result) {
              console.log('SQLite database ready');
              loadSavedData(); // Load data after DB is ready
            },
            function(tx, error) {
              console.error('Failed to create SQLite table:', error);
              loadSavedData(); // Still try to load from localStorage
            }
          );
        });
      } catch (e) {
        console.error('Error initializing SQLite database:', e);
        loadSavedData(); // Tetap coba load data dari localStorage
      }
    }, false);
  } else {
    // Web browser - load immediately
    loadSavedData();
  }
}

// Fungsi untuk menyimpan ke SQLite
function saveToSQLite(key, value) {
  if (db && isCordova) {
    try {
      db.transaction(function(tx) {
        tx.executeSql(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, value],
          function(tx, result) {
            console.log('Saved to SQLite:', key);
          },
          function(tx, error) {
            console.error('Failed to save to SQLite:', error);
          }
        );
      });
    } catch (e) {
      console.error('Error saving to SQLite:', e);
    }
  }
}

// Fungsi untuk mengambil dari SQLite
function getFromSQLite(key, callback) {
  if (db && isCordova) {
    try {
      db.transaction(function(tx) {
        tx.executeSql(
          'SELECT value FROM settings WHERE key = ?',
          [key],
          function(tx, result) {
            if (result.rows.length > 0) {
              callback(result.rows.item(0).value);
            } else {
              callback(null);
            }
          },
          function(tx, error) {
            console.error('Failed to get from SQLite:', error);
            callback(null);
          }
        );
      });
    } catch (e) {
      console.error('Error getting from SQLite:', e);
      callback(null);
    }
  } else {
    callback(null);
  }
}

// Fungsi utama untuk menyimpan data
function saveData(key, value) {
  // Selalu simpan ke localStorage (untuk web browsers)
  try {
    localStorage.setItem(key, value);
    console.log('Data saved to localStorage:', key);
  } catch (e) {
    console.warn('localStorage not available:', e);
  }

  // Jika Cordova, juga simpan ke SQLite
  if (isCordova) {
    saveToSQLite(key, value);
  }
}

// Fungsi utama untuk mengambil data
function getData(key, callback) {
  if (isCordova) {
    // Cordova: coba SQLite dulu, fallback ke localStorage
    getFromSQLite(key, function(sqliteValue) {
      if (sqliteValue !== null) {
        callback(sqliteValue);
      } else {
        // Fallback ke localStorage
        try {
          const localValue = localStorage.getItem(key);
          callback(localValue);
        } catch (e) {
          console.warn('localStorage not available:', e);
          callback(null);
        }
      }
    });
  } else {
    // Web browser: langsung dari localStorage
    try {
      const value = localStorage.getItem(key);
      console.log('Data loaded from localStorage:', key, value ? 'found' : 'not found');
      callback(value);
    } catch (e) {
      console.warn('localStorage not available:', e);
      callback(null);
    }
  }
}

// ┌──────────────────────────────┐
// │ LOAD DATA TERSIMPAN          │
// └──────────────────────────────┘
function loadSavedData() {
  console.log('Loading saved data...');

  if (!editor) {
    console.error("Editor belum diinisialisasi!");
    return;
  }

  getData('editorContent', function(savedContent) {
    getData('editorMode', function(savedMode) {
      savedMode = savedMode || 'htmlmixed';

      if (savedContent && savedContent.trim() !== '') {
        console.log('Setting editor content:', savedContent.substring(0, 50) + '...');
        editor.setValue(savedContent);
      } else {
        console.log('No saved content found');
      }

      editor.setOption('mode', savedMode);
      console.log('Editor mode set to:', savedMode);
    });
  });
}

// ┌──────────────────────────────┐
// │ AUTO SAVE SAAT BERUBAH       │
// └──────────────────────────────┘
let saveTimeout;
if (editor) {
  editor.on("change", function() {
    // Debounce saving to avoid too many saves
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
      const content = editor.getValue();
      console.log('Auto-saving content, length:', content.length);
      saveData('editorContent', content);
    }, 500); // Save after 500ms of no changes
  });
}

function saveCurrentMode(mode) {
  saveData('editorMode', mode);
}

// ┌──────────────────────────────┐
// │ HAPUS SEMUA DATA             │
// └──────────────────────────────┘
function clearAllSavedData() {
  console.log('Clearing all saved data...');

  // Hapus dari localStorage
  try {
    localStorage.removeItem('editorContent');
    localStorage.removeItem('editorMode');
    localStorage.removeItem('splitViewState');

    // Hapus file yang disimpan di localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('file_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared localStorage');
  } catch (e) {
    console.warn('localStorage not available when clearing:', e);
  }

  // Hapus dari SQLite jika Cordova
  if (db && isCordova) {
    try {
      db.transaction(function(tx) {
        tx.executeSql('DELETE FROM settings', [], function() {
          console.log('Cleared SQLite database');
        }, function(tx, err) {
          console.error('Failed to clear SQLite:', err);
        });
      });
    } catch (e) {
      console.error('Error clearing SQLite database:', e);
    }
  }

  // Reset editor
  if (editor) {
    editor.setValue('');
    editor.setOption('mode', 'htmlmixed');
    editor.focus();
  }
}

// ┌──────────────────────────────┐
// │ EKSTRAK JUDUL                │
// └──────────────────────────────┘
function extractTitleFromHTML(html) {
  if (!html) return "Tanpa Judul";

  const parser = new DOMParser();
  try {
    const doc = parser.parseFromString(html, "text/html");
    const titleEl = doc.querySelector("title");
    return titleEl ? titleEl.textContent.trim() : "Tanpa Judul";
  } catch (e) {
    console.error('Error parsing HTML:', e);
    return "Tidak Valid";
  }
}

// ┌──────────────────────────────┐
// │ UPDATE SEMUA PREVIEW + JUDUL │
// └──────────────────────────────┘
function updateAllPreviews() {
  if (!editor) {
    console.error("Editor belum diinisialisasi!");
    return;
  }

  const code = editor.getValue();

  // Deteksi bahasa dan proses sesuai jenisnya
  let processedCode = code;
  let title = "";

  if (code.trim().startsWith('<!MRK>')) {
    // Mode markdown
    title = "Markdown Preview";

    // Hapus <!MRK> dari konten untuk diproses
    const markdownContent = code.substring(7); // Hilangkan <!MRK>

    // Konversi markdown ke HTML jika tersedia library
    if (typeof marked !== 'undefined') {
      processedCode = marked.parse(markdownContent);
    } else {
      // Jika tidak ada library marked, tampilkan sebagai teks mentah
      processedCode = `<pre>${escapeHtml(markdownContent)}</pre>`;
    }
  } else {
    // Mode HTML
    title = extractTitleFromHTML(code);
    processedCode = code;
  }

  // Pastikan fungsi updatePreview tersedia sebelum dipanggil
  if (typeof updatePreview === 'function') {
    // Kirim informasi apakah ini mode markdown atau bukan
    const isMarkdown = code.trim().startsWith('<!MRK>');
    updatePreview(processedCode, isMarkdown);
  } else {
    console.warn("Fungsi updatePreview tidak ditemukan");
  }

  const modalPreview = document.getElementById("modalPreview");
  if (modalPreview && modalPreview.style.display === "flex") {
    const previewTitle = document.getElementById("previewTitle");
    if (previewTitle) {
      previewTitle.textContent = `Pratinjau : ${title}`;
    }
  }

  const splitLayout = document.getElementById("split-layout");
  if (splitLayout && splitLayout.style.display === "flex") {
    const splitPreviewTitle = document.getElementById("splitPreviewTitle");
    if (splitPreviewTitle) {
      splitPreviewTitle.textContent = `Pratinjau : ${title}`;
    }
  }
}


if (editor) {
  editor.on("change", updateAllPreviews);
}

// ┌──────────────────────────────┐
// │ FAB & MODAL                  │
// └──────────────────────────────┘
const iconDefault = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="16 18 22 12 16 6"></polyline>
  <polyline points="8 6 2 12 8 18"></polyline>
</svg>`;

const iconClose = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;

const fab = document.getElementById("fab");
const fabMainBtn = fab ? fab.querySelector(".main") : null;

function updateFabIcon() {
  if (fabMainBtn) {
    fabMainBtn.innerHTML = fab.classList.contains("open") ? iconClose : iconDefault;
  }
}

if (fabMainBtn) {
  fabMainBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fab.classList.toggle("open");
    updateFabIcon();
  });
}

document.addEventListener("click", (e) => {
  if (fab && !fab.contains(e.target)) {
    fab.classList.remove("open");
    updateFabIcon();
  }
});

// ┌──────────────────────────────┐
// │ SALIN                        │
// └──────────────────────────────┘
function showCopyNotification() {
  const notif = document.getElementById("copyNotification");
  if (notif) {
    notif.classList.remove("hide");
    notif.classList.add("show");
    setTimeout(() => {
      notif.classList.remove("show");
      notif.classList.add("hide");
    }, 2000);
    setTimeout(() => notif.classList.remove("hide"), 2500);
  }
}

const fabCopy = document.getElementById("fabCopy");
if (fabCopy) {
  fabCopy.addEventListener("click", () => {
    if (editor) {
      navigator.clipboard.writeText(editor.getValue()).then(() => {
        showCopyNotification();
        if (fab) {
          fab.classList.remove("open");
          updateFabIcon();
        }
      }).catch((err) => {
        console.error('Gagal menyalin teks:', err);
        alert("Gagal menyalin.");
      });
    } else {
      alert("Editor tidak tersedia.");
    }
  });
}

// ┌──────────────────────────────┐
// │ HAPUS SEMUA (FAB)            │
// └──────────────────────────────┘
const fabClear = document.getElementById("fabClear");
if (fabClear) {
  fabClear.addEventListener("click", () => {
    if (confirm("Yakin ingin menghapus semua isi editor? Ini akan mengosongkan editor.")) {
      clearAllSavedData();
    }
    if (fab) {
      fab.classList.remove("open");
      updateFabIcon();
    }
  });
}

// ┌──────────────────────────────┐
// │ PRATINJAU MODAL              │
// └──────────────────────────────┘
const fabPreview = document.getElementById("fabPreview");
if (fabPreview) {
  fabPreview.addEventListener("click", () => {
    if (!editor) {
      console.error("Editor belum diinisialisasi!");
      return;
    }

    const code = editor.getValue();
    const title = extractTitleFromHTML(code);
    const previewTitle = document.getElementById("previewTitle");
    if (previewTitle) {
      previewTitle.textContent = `Pratinjau : ${title}`;
    }

    updateAllPreviews();

    const modal = document.getElementById("modalPreview");
    if (modal) {
      modal.style.display = "flex";
      modal.style.opacity = "0";
      void modal.offsetWidth;
      modal.style.opacity = "1";
      modal.classList.add("fade-in-active");
    }

    if (fab) {
      fab.classList.remove("open");
      updateFabIcon();
    }
  });
}

// ┌──────────────────────────────┐
// │ MODE SPLIT                   │
// └──────────────────────────────┘
const splitViewBtn = document.getElementById("splitViewBtn");
if (splitViewBtn) {
  splitViewBtn.addEventListener("click", () => {
    const modalPreview = document.getElementById("modalPreview");

    if (modalPreview) {
      modalPreview.classList.add("modal-fade-out");
    }

    setTimeout(() => {
      if (modalPreview) {
        modalPreview.style.display = "none";
        modalPreview.classList.remove("modal-fade-out");
      }

      const editorContainer = document.querySelector(".CodeMirror");
      const editorSplitContainer = document.getElementById("editor-split-container");

      if (editorContainer && editorSplitContainer) {
        editorSplitContainer.appendChild(editorContainer);
      }

      if (!editor) {
        console.error("Editor belum diinisialisasi!");
        return;
      }

      const code = editor.getValue();
      const title = extractTitleFromHTML(code);
      const splitPreviewTitle = document.getElementById("splitPreviewTitle");
      if (splitPreviewTitle) {
        splitPreviewTitle.textContent = `Pratinjau : ${title}`;
      }

      const defaultLayout = document.getElementById("default-layout");
      if (defaultLayout) {
        defaultLayout.style.display = "none";
      }

      const splitLayout = document.getElementById("split-layout");
      if (splitLayout) {
        splitLayout.style.display = "flex";
        void splitLayout.offsetWidth;
        splitLayout.classList.add("active");
      }
    }, 300);
  });
}

const closeSplitBtn = document.getElementById("closeSplitBtn");
if (closeSplitBtn) {
  closeSplitBtn.addEventListener("click", () => {
    const splitLayout = document.getElementById("split-layout");
    if (splitLayout) {
      splitLayout.classList.remove("active");
      splitLayout.classList.add("closing");
    }

    setTimeout(() => {
      const editorContainer = document.querySelector(".CodeMirror");
      const editorContainerParent = document.getElementById("editor-container");

      if (editorContainer && editorContainerParent) {
        editorContainerParent.appendChild(editorContainer);
      }

      if (splitLayout) {
        splitLayout.classList.remove("closing");
        splitLayout.style.display = "none";
      }

      const defaultLayout = document.getElementById("default-layout");
      if (defaultLayout) {
        defaultLayout.style.display = "flex";
      }

      if (editor) {
        editor.focus();
      }
    }, 400);
  });
}

// ┌──────────────────────────────┐
// │ MODAL TIPS & DEVELOPER       │
// └──────────────────────────────┘
const fabTips = document.getElementById("fabTips");
if (fabTips) {
  fabTips.addEventListener("click", () => {
    const modalTips = document.getElementById("modalTips");
    if (modalTips) {
      modalTips.style.display = "flex";
    }
    if (fab) {
      fab.classList.remove("open");
      updateFabIcon();
    }
  });
}

const fabDeveloper = document.getElementById("fabDeveloper");
if (fabDeveloper) {
  fabDeveloper.addEventListener("click", () => {
    const developerModal = document.getElementById("developerModal");
    if (developerModal) {
      developerModal.style.display = "flex";
    }
    if (fab) {
      fab.classList.remove("open");
      updateFabIcon();
    }
  });
}

// ┌──────────────────────────────┐
// │ TUTUP MODAL                  │
// └──────────────────────────────┘
// Tutup modal Preview
const closePreviewModal = document.getElementById('closePreviewModal');
const modalPreview = document.getElementById('modalPreview');

if (closePreviewModal && modalPreview) {
  closePreviewModal.onclick = () => {
    modalPreview.classList.remove("fade-in-active");
    modalPreview.style.display = "none";
  };

  modalPreview.onclick = (e) => {
    if (e.target === modalPreview) {
      modalPreview.classList.remove("fade-in-active");
      modalPreview.style.display = "none";
    }
  };
}

// Tutup modal Tips
const closeTipsModal = document.getElementById('closeTipsModal');
const modalTips = document.getElementById('modalTips');

if (closeTipsModal && modalTips) {
  closeTipsModal.onclick = () => {
    modalTips.classList.remove("fade-in-active");
    modalTips.style.display = "none";
  };

  modalTips.onclick = (e) => {
    if (e.target === modalTips) {
      modalTips.classList.remove("fade-in-active");
      modalTips.style.display = "none";
      }
    };
  }

// Tutup modal Developer
const closeDeveloperModal = document.getElementById('closeDeveloperModal');
const developerModal = document.getElementById('developerModal');

if (closeDeveloperModal && developerModal) {
  closeDeveloperModal.onclick = () => {
    developerModal.classList.remove("fade-in-active");
    developerModal.style.display = "none";
  };

  developerModal.onclick = (e) => {
    if (e.target === developerModal) {
      developerModal.classList.remove("fade-in-active");
      developerModal.style.display = "none";
    }
  };
}


// ┌──────────────────────────────┐
// │ PROXY CONTENT LOADER         │
// └──────────────────────────────┘
// Fungsi untuk membuat URL proxy untuk konten eksternal
function createProxyUrl(targetUrl) {
  // Validasi URL target
  try {
    new URL(targetUrl);
  } catch (e) {
    console.error('Invalid URL:', targetUrl);
    return null;
  }

  // Buat URL proxy sederhana
  // Di sini kita bisa menggunakan layanan proxy atau endpoint khusus
  // Untuk saat ini, kita gunakan teknik sederhana dengan mengemas konten
  const proxyUrl = `data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loading...</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background: #1e1f29;
                color: #f8f8f2;
            }
            .loading {
                text-align: center;
                padding: 20px;
            }
            iframe {
                width: 100%;
                height: calc(100vh - 100px);
                border: none;
            }
        </style>
    </head>
    <body>
        <div class="loading">Memuat konten eksternal...</div>
        <iframe src="${encodeURIComponent(targetUrl)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
        <script>
            // Tangani link di dalam iframe
            window.addEventListener('message', function(e) {
                if (e.data.type === 'openLinkModal') {
                    // Teruskan pesan ke parent window
                    parent.postMessage(e.data, '*');
                }
            });

            // Tangani link langsung di halaman ini
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
                    e.preventDefault();

                    // Kirim pesan ke parent window untuk membuka link di modal
                    parent.postMessage({
                        type: 'openLinkModal',
                        url: link.href,
                        source: 'proxy'
                    }, '*');
                }
            });
        </script>
    </body>
    </html>
  `.replace(/\n\s*/g, '').trim();

  return proxyUrl;
}

// ┌──────────────────────────────┐
// │ HANDLER LINK DI IFRAME EKSTERNAL │
// └──────────────────────────────┘
// Tambahkan event listener untuk iframe eksternal
const externalFrame = document.getElementById('externalFrame');
if (externalFrame) {
  // Tangani pesan dari iframe eksternal
  window.addEventListener('message', function(event) {
    // Pastikan pesan berasal dari iframe eksternal kita
    if (event.source === externalFrame.contentWindow && event.data.type === 'openLinkModal') {
      const url = event.data.url;

      // Validasi URL sebelum membukanya (menggunakan fungsi dari link-handler.js)
      if (typeof isValidUrl !== 'undefined' && isValidUrl(url)) {
        // Buka link di modal link eksternal menggunakan proxy
        const modal = document.getElementById('linkModal');
        const iframe = document.getElementById('externalFrame');

        // Tampilkan modal
        modal.style.display = 'flex';

        // Muat URL di iframe menggunakan proxy
        const proxyUrl = createProxyUrl(url);
        if (proxyUrl) {
          iframe.src = proxyUrl;
        } else {
          alert('URL tidak valid: ' + url);
        }
      } else {
        alert('URL tidak valid: ' + url);
      }
    }
  });

  // Fungsi untuk menangani navigasi di dalam iframe eksternal
  let currentIframeUrl = externalFrame.src;
  setInterval(() => {
    if (externalFrame.contentWindow && externalFrame.src !== currentIframeUrl) {
      currentIframeUrl = externalFrame.src;
    }
  }, 1000); // Cek setiap detik
}

// ┌──────────────────────────────┐
// │ INISIALISASI                 │
// └──────────────────────────────┘
// Panggil initDB saat script dimuat
initDB();

// Setelah editor dimuat dan data dipulihkan, perbarui mode dan highlight
setTimeout(() => {
  if (editor) {
    updateEditorMode();
    highlightMRK();
  }
}, 1000); // Delay 1 detik untuk memastikan semua data sudah dimuat
