/**
 * Ambil koordinat perangkat saat ini.
 * 
 * @param {{ timeout?: number, enableHighAccuracy?: boolean }} [opts]
 * @returns {Promise<{ lat: number, lon: number, accuracy: number } | null>}
 */
export function getCurrentCoords(opts = {}) {
  const { timeout = 5000, enableHighAccuracy = true } = opts;
  
  return new Promise((resolve) => {
    // Geolocation API tidak tersedia (browser lama / non-secure context)
    if (!('geolocation' in navigator)) {
      console.warn('[geo] Geolocation API tidak tersedia');
      resolve(null);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      // Sukses: kembalikan lintang & bujur
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        resolve({ lat: latitude, lon: longitude, accuracy });
      },
      // Gagal (izin ditolak / posisi tak tersedia / timeout): resolve null
      (err) => {
        console.warn('[geo] Gagal ambil lokasi:', err.message);
        resolve(null);
      },
      { enableHighAccuracy, timeout, maximumAge: 0 }
    );
  });
}
