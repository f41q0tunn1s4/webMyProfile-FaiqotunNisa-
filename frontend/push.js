/**
 * Konversi kunci VAPID base64-url menjadi Uint8Array.
 * pushManager.subscribe() mewajibkan applicationServerKey berupa Uint8Array.
 * 
 * @param {string} base64String 
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Apakah browser mendukung Web Push? */
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Aktifkan notifikasi: minta izin -> subscribe -> kirim ke server.
 * @returns {Promise<boolean>} true bila berhasil subscribe
 */
export async function enablePush() {
  if (!isPushSupported()) {
    alert('Peramban Anda tidak mendukung notifikasi push.');
    return false;
  }
  
  // 1) Minta izin notifikasi (Notification API)
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('Izin notifikasi ditolak oleh pengguna.');
    return false;
  }
  
  try {
    // 2) Pastikan Service Worker aktif dan siap
    const reg = await navigator.serviceWorker.ready;
  
    // 3) Ambil kunci publik VAPID dari server
    const keyRes = await fetch('/api/push/vapidPublicKey');
    if (!keyRes.ok) throw new Error('Konfigurasi Web Push di server belum lengkap.');
    const { publicKey } = await keyRes.json();
  
    // 4) Buat atau gunakan kembali push subscription
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
  
    // 5) Simpan data subscription di server database/file
    const saveRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });

    if (!saveRes.ok) throw new Error('Gagal mendaftarkan subscription di server.');
  
    alert('Notifikasi berhasil diaktifkan! 🔔');
    return true;
  } catch (err) {
    console.error('[push] Gagal mengaktifkan notifikasi:', err);
    alert(err.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.');
    return false;
  }
}

/**
 * Inisialisasi tombol perizinan notifikasi di antarmuka pengguna
 */
export function initPushUI() {
  const btn = document.getElementById('btn-enable-push');
  if (!btn) return;
  
  // Sembunyikan tombol jika push tidak didukung atau perizinan telah diberikan sebelumnya
  if (!isPushSupported() || Notification.permission === 'granted') {
    btn.style.display = 'none';
    return;
  }
  
  btn.style.display = 'inline-flex';
  btn.addEventListener('click', async () => {
    const ok = await enablePush();
    if (ok) {
      btn.style.display = 'none';
    }
  });
}
