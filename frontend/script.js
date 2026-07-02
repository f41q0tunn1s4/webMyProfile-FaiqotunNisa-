// NOTE: script.js sekarang 100% Firebase-based (tanpa fetch ke backend/railway).
// Komponen tabel CRUD & modal detail dirender di `frontend/index.html` (React) via:
// - window.bukaDetailArtikelCloud(id)
// - window.pemicuEditArtikelCloud(id)
// script.js hanya menyimpan utilitas pendukung (login/logout + hook camera/photo dari camera.js jika diperlukan).

// --- 1. PROTEKSI LOGIN (SATPAM) ---
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("isLoggedIn");

    // Stabil untuk GitHub Pages (terutama ketika folder saat ini berbeda: /profile/ vs root /frontend/).
    const path = window.location.pathname;
    if (path.includes('/profile/')) {
        // Berada di frontend/profile/
        window.location.href = '../login.html';
    } else {
        // Berada di frontend/ atau root dashboard
        window.location.href = './login.html';
    }
}


const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Fungsi penerima kiriman data dari camera.js (jika camera.js masih menggunakannya)
let fotoBase64 = "";
window.setCapturedPhoto = function(base64Data) {
    fotoBase64 = base64Data;
};

// Optional: siapkan hook koordinat dari geo.js jika dipakai komponen lain
// (index.html sudah memakai getCurrentCoords dan menyimpan window.capturedCoords)

// Tidak ada lagi kode fetch/API_URL.

