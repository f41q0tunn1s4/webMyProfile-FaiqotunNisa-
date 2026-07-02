// --- 1. PROTEKSI LOGIN (SATPAM) ---
if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Akses Ditolak! Silahkan login terlebih dahulu.");
    window.location.href = "../login.html"; // Keluar folder profile ke login
}

// Fungsi Logout
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "../login.html";
}

// --- 2. SETUP PROFIL & GREETING ---
const namaLengkap = "Faiqotun Nisa";
const headerTitle = document.querySelector('h1');
if (headerTitle) {
    headerTitle.textContent = "Profil: " + namaLengkap;
}

// --- 3. JAM DIGITAL ---
const jamDigital = document.createElement('div');
jamDigital.id = 'jam-digital';
jamDigital.style.cssText = "text-align: center; font-weight: bold; color: white; margin-bottom: 20px;";
if (headerTitle) {
    headerTitle.after(jamDigital);
}

setInterval(() => {
    const sekarang = new Date();
    jamDigital.textContent = sekarang.toLocaleTimeString();
}, 1000);

// --- 4. TOGGLE DARK MODE ---
const btnDarkMode = document.createElement('button');
btnDarkMode.textContent = "Tema";
btnDarkMode.style.cssText = "position: fixed; bottom: 20px; right: 20px; padding: 10px; background: deeppink; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;";
document.body.appendChild(btnDarkMode);

btnDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        document.body.style.backgroundColor = "#222";
        document.body.style.color = "#fff";
    } else {
        document.body.style.backgroundColor = "#de4472"; // Warna asli kamu
        document.body.style.color = "#333";
    }
});

// --- 5. ASYNC FUNCTION: MENAMPILKAN ARTIKEL DARI DATABASE MYSQL ---
const API_URL = 'http://localhost:3000/api';

async function loadCmsArticles() {
    const container = document.getElementById('display-articles');
    if (!container) return; // Keamanan jika elemen tidak ditemukan

    try {
        // Ambil data artikel dari backend menggunakan fetch dan async/await
        const respon = await fetch(`${API_URL}/artikel`);
        const data = await respon.json();

        if (data.length === 0) {
            container.innerHTML = "<p style='color: white;'>Belum ada artikel terbaru.</p>";
            return;
        }

        // Membalik urutan agar artikel terbaru dari database muncul paling atas (reverse)
        const latestArticles = [...data].reverse();
        
        container.innerHTML = latestArticles.map(item => {
            // Format tanggal agar manis dibaca
            const opsiTanggal = { year: 'numeric', month: 'short', day: 'numeric' };
            const tanggalFormat = new Date(item.tanggal).toLocaleDateString('id-ID', opsiTanggal);

            return `
                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 6px solid deeppink; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); color: #333; text-align: left;">
                    <h3 style="color: deeppink; margin-top: 0;">${item.judul}</h3>
                    <p>${item.konten}</p>
                    <small style="color: #888;">Diterbitkan: ${tanggalFormat}</small>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Gagal memuat artikel di halaman profil:', error);
        container.innerHTML = "<p style='color: white;'>Gagal terhubung ke server database.</p>";
    }
}

// --- 6. ASYNC FUNCTION: INISIALISASI PETA LOKASI DOMISILI & PUBLIKASI ---
async function initProfileMap() {
    const mapEl = document.getElementById('profile-map');
    if (!mapEl) return;

    // Koordinat Cilacap (UNUGHA/Domisili)
    const defaultLat = -7.7256;
    const defaultLon = 109.0095;

    // Inisialisasi map
    const map = L.map(mapEl).setView([defaultLat, defaultLon], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    // Pin Domicile
    const domicileIcon = L.divIcon({
        className: 'map-pin',
        html: '<span style="font-size: 2rem; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));">📍</span>',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34]
    });

    L.marker([defaultLat, defaultLon], { icon: domicileIcon })
        .addTo(map)
        .bindPopup('<strong>Faiqotun Nisa</strong><br>Domisili: Cilacap, Jawa Tengah')
        .openPopup();

    // Plot artikel yang memiliki lokasi GPS
    try {
        const respon = await fetch(`${API_URL}/artikel`);
        const articles = await respon.json();
        const located = articles.filter(s => s.lat !== null && s.lon !== null);

        const latLngs = [[defaultLat, defaultLon]];

        located.forEach(item => {
            const latVal = parseFloat(item.lat);
            const lonVal = parseFloat(item.lon);

            const articleIcon = L.divIcon({
                className: 'map-pin',
                html: '<span style="font-size: 1.75rem; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));">📷</span>',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -34]
            });

            const marker = L.marker([latVal, lonVal], { icon: articleIcon }).addTo(map);
            
            const popupContent = `
                <div style="width: 180px; font-family: 'Poppins', sans-serif;">
                    ${item.foto ? `<img src="${item.foto}" style="width:100%; height:80px; object-fit:cover; border-radius:6px; margin-bottom: 5px; border: 1px solid #ddd;" />` : ''}
                    <h4 style="margin: 5px 0 2px; font-size:12px; font-weight:600; color:#333;">${item.judul}</h4>
                    <p style="margin: 0; font-size:10px; color:#666;">Diterbitkan: ${new Date(item.tanggal).toLocaleDateString('id-ID')}</p>
                </div>
            `;
            marker.bindPopup(popupContent);
            latLngs.push([latVal, lonVal]);
        });

        if (latLngs.length > 1) {
            map.fitBounds(latLngs, { padding: [40, 40] });
        }
    } catch (err) {
        console.error('Gagal mengambil data artikel untuk peta profil:', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadCmsArticles();
    initProfileMap();
});