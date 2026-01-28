// Script untuk menangani auto-refresh preview dan modal link eksternal

// Auto-refresh preview saat halaman dimuat atau user kembali
document.addEventListener('DOMContentLoaded', function() {
  // Update preview saat load
  updateAllPreviews();

  // Update preview saat visibility change (user kembali ke tab)
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      updateAllPreviews();
    }
  });

  // Tangani link di modal tips untuk membuka modal link eksternal
  const modalTips = document.getElementById('modalTips');
  if (modalTips) {
    modalTips.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link && link.href) {
        e.preventDefault();
        // Tutup modal tips
        modalTips.classList.remove("fade-in-active");
        modalTips.style.display = 'none';
        // Buka modal link eksternal dengan URL yang diklik
        const linkModal = document.getElementById('linkModal');
        const externalFrame = document.getElementById('externalFrame');
        linkModal.style.display = 'flex';
        // Set timeout kecil untuk memastikan modal muncul
        setTimeout(() => {
          externalFrame.src = link.href;
        }, 100);
      }
    });
  }
});

// Fungsi untuk membuka modal developer dengan URL tertentu
function openDeveloperModal(url) {
  const developerModal = document.getElementById('developerModal');
  const developerFrame = document.getElementById('developerFrame');

  if (url) {
    developerFrame.src = url;
  } else {
    developerFrame.src = 'dev.html'; // Fallback
  }

  developerModal.style.display = 'flex';
}

// Tangani pesan dari iframe untuk membuka link di modal
window.addEventListener('message', function(event) {
  if (event.data.type === 'openLinkModal') {
    const url = event.data.url;
    const source = event.data.source;

    if (source === 'preview') {
      // Buka modal link eksternal
      const linkModal = document.getElementById('linkModal');
      const externalFrame = document.getElementById('externalFrame');

      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        linkModal.style.display = 'flex';
        setTimeout(() => {
          externalFrame.src = url;
        }, 100);
      } else {
        // Untuk link relatif, mungkin tampilkan pesan error
        alert('Link tidak valid atau tidak didukung.');
      }
    }
  }
});

// Tutup modal link saat klik close
document.getElementById('closeLinkModal').addEventListener('click', function() {
  const linkModal = document.getElementById('linkModal');
  const externalFrame = document.getElementById('externalFrame');
  linkModal.style.display = 'none';
  externalFrame.src = 'about:blank'; // Clear iframe
});

// Tutup modal link saat klik di luar
document.getElementById('linkModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
    document.getElementById('externalFrame').src = 'about:blank';
  }
});

// Tutup modal developer saat klik close
document.getElementById('closeDeveloperModal').addEventListener('click', function() {
  const developerModal = document.getElementById('developerModal');
  const developerFrame = document.getElementById('developerFrame');
  developerModal.style.display = 'none';
  developerFrame.src = 'about:blank'; // Clear iframe
});

// Tutup modal developer saat klik di luar
document.getElementById('developerModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
    document.getElementById('developerFrame').src = 'about:blank';
  }
});
