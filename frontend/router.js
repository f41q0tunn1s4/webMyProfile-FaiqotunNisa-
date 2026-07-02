// router.js

/**
 * Fungsi Utama untuk mengaktifkan navigasi SPA tanpa reload
 */
export function initRouter() {
  // Cegat semua klik pada link navigasi yang memiliki atribut data-link
  document.body.addEventListener('click', async (e) => {
    const link = e.target.closest('a[data-link]');
    
    if (link) {
      e.preventDefault(); // Menghentikan browser dari hard reload halaman
      const targetUrl = link.href;

      // Jalankan View Transition API jika didukung oleh browser saat ini
      if (document.startViewTransition) {
        document.startViewTransition(async () => {
          await loadPageContent(targetUrl);
        });
      } else {
        // Fallback otomatis jika browser versi lama (tidak mendukung animasi)
        await loadPageContent(targetUrl);
      }
    }
  });

  // Menangani tombol Back dan Forward (kembali/maju) pada browser user
  window.addEventListener('popstate', () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => loadPageContent(window.location.pathname));
    } else {
      loadPageContent(window.location.pathname);
    }
  });
}

/**
 * Fungsi Async untuk mengambil dan memperbarui konten halaman secara dinamis
 */
async function loadPageContent(url) {
  try {
    // 1. Ambil file HTML dari halaman tujuan menggunakan fetch (Async JS)
    const response = await fetch(url);
    const htmlText = await response.text();

    // 2. Ubah teks HTML kasar menjadi objek DOM agar bisa dimanipulasi
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 3. Ambil kontainer utama halaman saat ini dan halaman baru
    const currentContent = document.getElementById('main-content');
    const newContent = doc.getElementById('main-content');

    if (currentContent && newContent) {
      // Ganti isi konten lama dengan konten baru secara instan di dalam transisi
      currentContent.innerHTML = newContent.innerHTML;
      
      // Update judul tab browser agar sesuai dengan halaman baru
      document.title = doc.title; 
      
      // Ubah alamat URL di address bar browser tanpa memicu reload halaman
      window.history.pushState({}, '', url); 
      
      // Picu event kustom agar fitur lain (seperti animasi ikan/kamera) tahu halaman sudah berganti
      window.dispatchEvent(new CustomEvent('page-changed', { detail: { url } }));
    }
  } catch (error) {
    console.error('Gagal memuat halaman secara SPA:', error);
  }
}