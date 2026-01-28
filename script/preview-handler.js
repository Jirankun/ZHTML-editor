// Fungsi untuk memperbarui pratinjau dengan sanitasi
function updatePreview(editorContent, isMarkdown = false) {
    // Dapatkan referensi ke iframe
    const liveFrame = document.getElementById('liveFrame');
    const previewFrame = document.getElementById('previewFrame');

    // Buat konten yang disanitasi
    let safeContent;
    if (!editorContent || !editorContent.trim()) {
        // Jika konten kosong, tampilkan pesan peringatan
        safeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pratinjau Kosong</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        text-align: center;
                        color: #666;
                        user-select: none;
                    }
                    h2 {
                        color: #999;
                    }
                </style>
            </head>
            <body>
                <h1>(⁠≧⁠▽⁠≦⁠)</h1>
                <h2>Gak ada yang mau di tampilin</h2>
                <h4>isi Kode di workspace-nya dulu ya,entar kalo udah ada,bakalan aku tunjukin kok hasil nya.</h4>
            </body>
            </html>
        `;
    } else if (isMarkdown) {
        // Mode markdown - konversi ke HTML jika memungkinkan
        let htmlContent = editorContent;

        // Hapus <!MRK> dari konten jika ada
        if (editorContent.trim().startsWith('<!MRK>')) {
            htmlContent = editorContent.substring(7);
        }

        if (typeof marked !== 'undefined') {
            htmlContent = marked.parse(htmlContent);
        } else {
            // Jika tidak ada library marked, konversi markdown sederhana secara manual
            htmlContent = convertSimpleMarkdown(htmlContent);
        }

        // Buat HTML lengkap untuk preview markdown
        // Penting: Jangan lewatkan konten markdown melalui safePreview karena akan menghilangkan format
        safeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Markdown Preview</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .markdown-body { line-height: 1.6; }
                    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; }
                    p { margin-bottom: 16px; }
                    ul, ol { margin-bottom: 16px; }
                    pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; }
                    code { background-color: #f4f4f4; padding: 2px 4px; }
                    strong { font-weight: bold; }
                    em { font-style: italic; }
                    blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-left: 0; }
                    img { max-width: 100%; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
    } else {
        // Untuk konten HTML biasa, gunakan safePreview untuk keamanan
        safeContent = safePreview(editorContent);
    }

    // Fungsi untuk update iframe dengan force refresh
    function updateIframe(iframe, content) {
        if (iframe) {
            try {
                // Clear srcdoc untuk force refresh
                iframe.srcdoc = '';
                // Set timeout kecil untuk memastikan clear
                setTimeout(() => {
                    iframe.srcdoc = content;
                }, 10);
            } catch (e) {
                console.error('Error updating iframe:', e);
                // Fallback ke method lama
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(content);
                doc.close();
            }
        }
    }

    // Update kedua iframe dengan konten yang aman
    updateIframe(liveFrame, safeContent);
    updateIframe(previewFrame, safeContent);
}

// Fungsi untuk escape HTML (untuk keamanan)
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Fungsi untuk konversi markdown sederhana
function convertSimpleMarkdown(md) {
  // Escape HTML untuk keamanan
  let html = escapeHtml(md);

  // Proses inline markdown (bold, italic, code, link, dll) di dalam teks
  // Bold: **text** atau __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* atau _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Code: `code`
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Link: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Gambar: ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');

  // Pisahkan teks menjadi baris-baris untuk memproses blok markdown
  let lines = html.split('\n');
  let result = [];
  let inUl = false; // Untuk melacak apakah kita sedang dalam list

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Proses heading
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)[0].length;
      const content = line.substring(level + 1);
      line = `<h${level}>${content}</h${level}>`;
    }
    // Proses list
    else if (line.match(/^\s*[-*]\s/)) {
      // Jika sebelumnya bukan dalam list, mulai list baru
      if (!inUl) {
        line = `<ul><li>${line.substring(2)}</li>`;
        inUl = true;
      } else {
        // Jika sudah dalam list, tambahkan list item
        line = `<li>${line.substring(2)}</li>`;
      }
    }
    // Jika dalam list tapi baris ini bukan list, akhiri list
    else if (inUl && !line.match(/^\s*[-*]\s/) && line.trim() !== '') {
      result.push('</ul>'); // Akhiri list sebelumnya
      inUl = false;
      // Lanjutkan pemrosesan baris ini sebagai paragraf
      if (line.trim() !== '') {
        line = `<p>${line}</p>`;
      }
    }
    // Proses blockquote
    else if (line.match(/^>\s/)) {
      line = `<blockquote>${line.substring(2)}</blockquote>`;
    }
    // Jika bukan heading, list, atau blockquote, anggap sebagai paragraf
    else if (line.trim() !== '') {
      line = `<p>${line}</p>`;
    }
    // Baris kosong tetap kosong
    else {
      line = '';
    }

    result.push(line);
  }

  // Jika masih dalam list di akhir, akhiri list
  if (inUl) {
    result.push('</ul>');
  }

  // Gabungkan hasil
  html = result.join('');

  return html;
}

// Fungsi untuk membuka modal pratinjau
function openPreviewModal() {
    // Dapatkan konten dari editor (misalnya CodeMirror)
    let editorContent;
    if (typeof CodeMirror !== 'undefined' && window.editor) {
        editorContent = window.editor.getValue();
    } else {
        // Jika tidak ada CodeMirror, ambil dari textarea
        const editorTextarea = document.getElementById('editor');
        editorContent = editorTextarea ? editorTextarea.value : '';
    }

    // Update pratinjau di modal
    updatePreview(editorContent);

    // Tampilkan modal
    const modal = document.getElementById('modalPreview');
    modal.style.display = 'flex';
}

// Event listener untuk tombol pratinjau
document.addEventListener('DOMContentLoaded', function() {
    // Tombol pratinjau di FAB
    const fabPreviewBtn = document.getElementById('fabPreview');
    if (fabPreviewBtn) {
        fabPreviewBtn.addEventListener('click', function() {
            openPreviewModal();
        });
    }

    // Tombol tutup modal pratinjau
    const closePreviewBtn = document.getElementById('closePreview');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', function() {
            const modal = document.getElementById('modalPreview');
            modal.style.display = 'none';
        });
    }

    // Juga tutup modal saat klik di overlay
    const modalPreview = document.getElementById('modalPreview');
    if (modalPreview) {
        modalPreview.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }

    // Tombol pratinjau langsung (split view)
    const splitViewBtn = document.getElementById('splitViewBtn');
    if (splitViewBtn) {
        splitViewBtn.addEventListener('click', function() {
            // Logika untuk membuka mode split view
            document.getElementById('default-layout').style.display = 'none';
            document.getElementById('split-layout').style.display = 'block';

            // Update pratinjau saat pertama kali membuka split view
            if (typeof CodeMirror !== 'undefined' && window.editor) {
                updatePreview(window.editor.getValue());
            }
        });
    }

    // Tombol tutup split view
    const closeSplitBtn = document.getElementById('closeSplitBtn');
    if (closeSplitBtn) {
        closeSplitBtn.addEventListener('click', function() {
            document.getElementById('split-layout').style.display = 'none';
            document.getElementById('default-layout').style.display = 'block';
        });
    }
});

// Fungsi untuk mendeteksi apakah konten adalah markdown
function isMarkdownContent(content) {
    return content && content.trim().startsWith('<!MRK>');
}

// Jika menggunakan CodeMirror, tambahkan event listener untuk update otomatis
if (typeof CodeMirror !== 'undefined') {
    // Tunggu sampai editor siap
    setTimeout(function() {
        if (window.editor) {
            // Update pratinjau saat ada perubahan di editor (tanpa debounce untuk refresh cepat)
            window.editor.on('change', function() {
                const content = window.editor.getValue();
                const isMarkdown = isMarkdownContent(content);
                updatePreview(content, isMarkdown);
            });
        }
    }, 1000);
}
