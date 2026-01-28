// Fungsi untuk menangani link dari pratinjau
function setupLinkHandler() {
    // Tangani pesan dari iframe pratinjau
    window.addEventListener('message', function(event) {
        if (event.data.type === 'openLinkModal') {
            // Cek apakah pesan datang dari pratinjau (bukan dari developer)
            if (event.data.source === 'preview') {
                openLinkModal(event.data.url);
            }
        }
    });

    // Fungsi untuk membuka modal link
    function openLinkModal(url) {
        // Validasi URL sebelum membukanya
        if (!isValidUrl(url)) {
            alert('URL tidak valid: ' + url);
            return;
        }

        const modal = document.getElementById('linkModal');
        const iframe = document.getElementById('externalFrame');

        // Tampilkan modal
        modal.style.display = 'flex';

        // Muat URL di iframe
        iframe.src = url;
    }

    // Fungsi untuk memvalidasi URL
    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            // Hanya izinkan protokol http dan https
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch (e) {
            // Jika URL tidak valid, coba tambahkan protokol default
            try {
                const parsedUrl = new URL('http://' + url);
                return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
            } catch (e2) {
                return false;
            }
        }
    }

    // Fungsi untuk menutup modal link
    document.getElementById('closeLinkModal').addEventListener('click', function() {
        const modal = document.getElementById('linkModal');
        const iframe = document.getElementById('externalFrame');

        modal.style.display = 'none';
        iframe.src = 'about:blank'; // Kosongkan iframe saat menutup
    });

    // Juga tutup modal saat klik di overlay
    document.getElementById('linkModal').addEventListener('click', function(e) {
        if (e.target === this) {
            const modal = document.getElementById('linkModal');
            const iframe = document.getElementById('externalFrame');

            modal.style.display = 'none';
            iframe.src = 'about:blank';
        }
    });

    // Tangani pesan dari iframe eksternal (untuk link yang diklik di dalam iframe)
    window.addEventListener('message', function(event) {
        // Cek apakah pesan berasal dari iframe eksternal kita
        const externalFrame = document.getElementById('externalFrame');
        if (event.source === externalFrame.contentWindow && event.data.type === 'openLinkModal') {
            const url = event.data.url;

            // Validasi URL sebelum membukanya
            if (isValidUrl(url)) {
                // Buka link di modal link eksternal
                const modal = document.getElementById('linkModal');
                const iframe = document.getElementById('externalFrame');

                // Tampilkan modal
                modal.style.display = 'flex';

                // Muat URL di iframe
                iframe.src = url;
            } else {
                alert('URL tidak valid: ' + url);
            }
        }
    });
}

// Fungsi untuk membuka modal developer
function openDeveloperModal() {
    const modal = document.getElementById('developerModal');
    const iframe = document.getElementById('developerFrame');

    // Tampilkan modal
    modal.style.display = 'flex';

    // Jika src belum diatur atau berbeda, atur ke dev.html
    if (!iframe.src || !iframe.src.includes('dev.html')) {
        iframe.src = 'dev.html';
    }
}

// Panggil fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', setupLinkHandler);

// Tambahkan event listener untuk tombol developer
document.addEventListener('DOMContentLoaded', function() {
    const developerBtn = document.getElementById('fabDeveloper');
    if (developerBtn) {
        developerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openDeveloperModal();
        });
    }

    // Tambahkan event listener untuk tombol tutup modal developer
    const closeDeveloperBtn = document.getElementById('closeDeveloperModal');
    if (closeDeveloperBtn) {
        closeDeveloperBtn.addEventListener('click', function() {
            const modal = document.getElementById('developerModal');
            const iframe = document.getElementById('developerFrame');

            modal.style.display = 'none';
            iframe.src = 'about:blank'; // Kosongkan iframe saat menutup
        });
    }

    // Juga tutup modal saat klik di overlay
    document.getElementById('developerModal').addEventListener('click', function(e) {
        if (e.target === this) {
            const modal = document.getElementById('developerModal');
            const iframe = document.getElementById('developerFrame');

            modal.style.display = 'none';
            iframe.src = 'about:blank';
        }
    });

    // Tambahkan event listener untuk link di modal tips
    const tipsModal = document.getElementById('modalTips');
    if (tipsModal) {
        // Tambahkan event listener untuk semua link di modal tips
        tipsModal.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                const href = e.target.href;

                // Validasi URL sebelum membukanya
                if (isValidUrl(href)) {
                    // Buka link di inappbrowser
                    cordova.InAppBrowser.open(href, '_blank');
                } else {
                    alert('URL tidak valid: ' + href);
                }
            }
        });
    }

    // Tambahkan event listener untuk link di modal developer
    const developerModal = document.getElementById('developerModal');
    if (developerModal) {
        // Tambahkan event listener untuk semua link di modal developer
        developerModal.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                const href = e.target.href;

                // Validasi URL sebelum membukanya
                if (isValidUrl(href)) {
                    // Buka link di inappbrowser
                    cordova.InAppBrowser.open(href, '_blank');
                } else {
                    alert('URL tidak valid: ' + href);
                }
            }
        });
    }

    // Tambahkan event listener untuk tombol tips
    const fabTipsBtn = document.getElementById('fabTips');
    if (fabTipsBtn) {
        fabTipsBtn.addEventListener('click', function() {
            document.getElementById('modalTips').style.display = 'flex';
        });
    }

    // Tambahkan event listener untuk tombol tutup modal tips
    const closeTipsBtn = document.getElementById('closeTips');
    if (closeTipsBtn) {
        closeTipsBtn.addEventListener('click', function() {
            document.getElementById('modalTips').style.display = 'none';
        });
    }

    // Juga tutup modal tips saat klik di overlay
    document.getElementById('modalTips').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Tangani pesan dari iframe untuk membuka link eksternal
    window.addEventListener('message', function(event) {
        if (event.data.type === 'openExternalLink') {
            const url = event.data.url;
            // Validasi URL
            if (isValidUrl(url)) {
                // Buka link di inappbrowser
                cordova.InAppBrowser.open(url, '_blank');
            } else {
                alert('URL tidak valid: ' + url);
            }
        }
    });
});
