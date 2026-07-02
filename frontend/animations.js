// animations.js

/**
 * Fungsi untuk membuat elemen ikan/ubur-ubur dekoratif di latar belakang
 */
export function initSeaAnimation() {
  // Cegah duplikasi dekorasi jika fungsi terpanggil kembali saat pindah halaman SPA
  if (document.getElementById('sea-aquarium-bg')) return;

  // 1. Buat kontainer khusus untuk latar belakang animasi
  const aquarium = document.createElement('div');
  aquarium.id = 'sea-aquarium-bg';
  aquarium.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none; /* Agar tidak menghalangi klik pada tombol/form */
    z-index: 0;
    overflow: hidden;
    opacity: 0.4; /* Transparan halus agar teks dashboard tetap terbaca */
  `;
  document.body.appendChild(aquarium);

  // Karakter laut yang akan dianimasikan secara acak
  const seaCreatures = ['🐟', '🐠', '🦑', '🪼', '🐡'];

  // Hormati pengaturan aksesibilitas pengguna (prefers-reduced-motion)
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasReducedMotion) {
    console.log('Animasi laut dimatikan karena preferensi sistem pengguna.');
    return;
  }

  // Buat beberapa makhluk laut secara acak
  for (let i = 0; i < 8; i++) {
    const creature = document.createElement('div');
    creature.innerText = seaCreatures[Math.floor(Math.random() * seaCreatures.length)];
    creature.style.position = 'absolute';
    creature.style.fontSize = `${Math.floor(Math.random() * 20) + 20}px`; // Ukuran acak antara 20px - 40px
    aquarium.appendChild(creature);

    // Jalankan Web Animations API (WAAPI) pada elemen tersebut
    animateCreature(creature);
  }
}

/**
 * Logika pergerakan acak makhluk laut menggunakan Web Animations API
 */
function animateCreature(element) {
  // Tentukan koordinat acak di layar browser
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight;
  const endX = Math.random() * window.innerWidth;
  const endY = Math.random() * window.innerHeight;

  // Atur arah hadap emoji (jika berenang ke kiri, balik badannya)
  const scaleX = endX < startX ? '-1' : '1';

  // Keyframes untuk transisi gerakan (State A menuju State B)
  const keyframes = [
    { transform: `translate(${startX}px, ${startY}px) scaleX(${scaleX})` },
    { transform: `translate(${endX}px, ${endY}px) scaleX(${scaleX})` }
  ];

  // Opsi durasi dan efek kelenturan animasi (Timing Configuration)
  const options = {
    duration: Math.random() * 10000 + 10000, // Kecepatan acak antara 10 - 20 detik
    easing: 'ease-in-out',
    fill: 'forwards'
  };

  // Jalankan animasi secara programatik lewat JS
  const animation = element.animate(keyframes, options);

  // Saat makhluk laut sampai ke tujuan, jalankan animasi baru ke koordinat acak lainnya
  animation.onfinish = () => {
    animateCreature(element);
  };
}