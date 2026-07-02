// --- 1. PROTEKSI LOGIN (SATPAM) ---
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}

// Tambahkan listener untuk tombol keluar sistem
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// --- 2. INTEGRASI CMS BACKEND ---
const API_URL = 'http://backend-production-be47c.up.railway.app/api';
const form = document.getElementById('form-artikel');
const listContainer = document.getElementById('container-artikel');

// Variabel penampung data string foto dari camera.js
let fotoBase64 = "";

// Fungsi penerima kiriman data dari camera.js
window.setCapturedPhoto = function(base64Data) {
    fotoBase64 = base64Data;
};

// ASYNC FUNCTION: Mengambil data dan menampilkan ke tabel riwayat (READ)
async function loadArticles() {
    try {
        const respon = await fetch(`${API_URL}/artikel`);
        const data = await respon.json();
        
        listContainer.innerHTML = '';

        if (data.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">Belum ada artikel di database.</td></tr>`;
            return;
        }

        // Tampilkan data loop ke dalam baris tabel HTML
        data.forEach((item) => {
            const tr = document.createElement('tr');
            
            const opsiTanggal = { year: 'numeric', month: 'short', day: 'numeric' };
            const tanggalFormat = new Date(item.tanggal).toLocaleDateString('id-ID', opsiTanggal);

            // Tampilkan foto kecil jika ada, jika kosong set 'Tanpa Foto'
            const tampilanFoto = item.foto 
                ? `<img src="${item.foto}" style="width: 70px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">` 
                : `<span style="color:#aaa; font-size:12px;">Tanpa Foto</span>`;

            tr.innerHTML = `
                <td><strong style="cursor: pointer; color: #475569;" onclick="bukaDetailArtikel(${item.id})">${item.judul}</strong></td>
                <td>${tampilanFoto}</td>
                <td>${tanggalFormat}</td>
                <td style="text-align: right;">
                    <button class="btn-action" onclick="bukaDetailArtikel(${item.id})" style="background: #475569; color: white; padding: 6px 12px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Lihat</button>
                    <button class="btn-action" onclick="editArticle(${item.id}, '${escape(item.judul)}', '${escape(item.konten)}', '${item.foto ? escape(item.foto) : ''}', '${item.lat || ''}', '${item.lon || ''}')" style="background: #ffc107; color: black; padding: 6px 12px; border:none; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:5px;">Edit</button>
                    <button class="btn-action" onclick="deleteArticle(${item.id})" style="background: #ff4d4d; color: white; margin-left:5px; padding: 6px 12px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Hapus</button>
                </td>
            `;
            listContainer.appendChild(tr);
        });
    } catch (error) {
        console.error('Gagal mengambil data artikel:', error);
    }
}

// ASYNC EVENT LISTENER: Menyimpan artikel baru via POST (CREATE)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const judul = document.getElementById('input-judul').value;
    const konten = document.getElementById('input-konten').value;

    try {
        const respon = await fetch(`${API_URL}/artikel-buat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                judul: judul,
                konten: konten,
                foto: fotoBase64, // Mengirim data gambar asli kamera
                lat: window.capturedCoords ? window.capturedCoords.lat : null,
                lon: window.capturedCoords ? window.capturedCoords.lon : null
            })
        });
        
        const hasil = await respon.json();

        if (hasil.message) {
            alert('Sukses! Artikel & Foto berhasil disimpan ke database MySQL.');
            form.reset();
            fotoBase64 = ""; // Bersihkan tampungan gambar setelah sukses
            window.capturedCoords = null; // Reset koordinat global setelah sukses
            
            // Reset status lokasi di UI
            const statusEl = document.getElementById('geo-status');
            if (statusEl) statusEl.textContent = '';

            // Sembunyikan preview gambar dan tunjukkan webcam video kembali
            const previewImg = document.getElementById('preview-foto');
            if (previewImg) previewImg.style.display = 'none';
            const webcamVideo = document.getElementById('webcam');
            if (webcamVideo) webcamVideo.style.display = 'block';
            const btnCapture = document.getElementById('btn-capture');
            if (btnCapture) btnCapture.style.display = 'inline-block';
            const btnRetake = document.getElementById('btn-retake');
            if (btnRetake) btnRetake.style.display = 'none';

            loadArticles(); // Muat ulang tabel secara otomatis
        }
    } catch (error) {
        console.error('Gagal menyimpan artikel (script.js - backend lama):', error);
        // alert('Terjadi kesalahan saat menyambung ke server.'); // <-- Hapus supaya tidak muncul pesan palsu saat XAMPP/backend lama tidak dipakai
    }
});


// FUNCTION: Aksi Menghapus Data (DELETE)
async function deleteArticle(id) {
    if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
        try {
            const respon = await fetch(`${API_URL}/artikel-hapus/${id}`, { method: 'DELETE' });
            const hasil = await respon.json();
            if (hasil.message) {
                alert(hasil.message);
                loadArticles(); // Muat ulang tabel
            }
        } catch (error) {
            console.error('Gagal menghapus artikel:', error);
        }
    }
}

// FUNCTION: Aksi Mengubah Data (UPDATE)
async function editArticle(id, judulEscaped, kontenEscaped, fotoLamaEscaped, latLama, lonLama) {
    const judulLama = unescape(judulEscaped);
    const kontenLama = unescape(kontenEscaped);
    const fotoLama = fotoLamaEscaped ? unescape(fotoLamaEscaped) : null;
    
    const judulBaru = prompt("Ubah Judul Artikel:", judulLama);
    const kontenBaru = prompt("Ubah Isi Konten Artikel:", kontenLama);
    
    if (judulBaru !== null && kontenBaru !== null) {
        try {
            const respon = await fetch(`${API_URL}/artikel-edit/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    judul: judulBaru,
                    konten: kontenBaru,
                    // Logika: Jika ada jepretan foto baru di kamera gunakan fotoBase64, jika tidak tetap pertahankan fotoLama
                    foto: fotoBase64 || fotoLama,
                    // Jika ada tangkapan koordinat baru dari GPS gunakan koordinat baru, jika tidak pertahankan koordinat lama
                    lat: window.capturedCoords ? window.capturedCoords.lat : (latLama ? parseFloat(latLama) : null),
                    lon: window.capturedCoords ? window.capturedCoords.lon : (lonLama ? parseFloat(lonLama) : null)
                })
            });
            const hasil = await respon.json();
            if (hasil.message) {
                alert(hasil.message);
                fotoBase64 = ""; // Reset penampung data kamera setelah sukses edit
                window.capturedCoords = null; // Reset koordinat global
                loadArticles(); // Muat ulang tabel
            }
        } catch (error) {
            console.error('Gagal memperbarui artikel:', error);
        }
    }
}

// Jalankan pemanggilan data pertama kali saat halaman siap dibuka
window.addEventListener('DOMContentLoaded', loadArticles);