// camera.js
let mediaStream = null;

/**
 * 1. Mengakses kamera perangkat menggunakan Media Stream API
 */
export async function startCamera(videoElement) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
    
    videoElement.srcObject = mediaStream;
    videoElement.play();
  } catch (error) {
    console.error('Gagal mengakses kamera:', error);
    alert('Tidak dapat mengakses kamera. Pastikan izin telah diberikan.');
  }
}

/**
 * 2. Mengambil gambar & Menerapkan Filter Grayscale + Kirim ke script.js
 */
export function captureAndFilterFrame(videoElement, canvasElement, previewImageElement) {
  const ctx = canvasElement.getContext('2d');
  
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  
  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
  const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const data = imageData.data;
  
  // Algoritma manipulasi piksel hitam-putih
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    
    const grayscale = 0.299 * red + 0.587 * green + 0.114 * blue;
    
    data[i] = grayscale;     
    data[i + 1] = grayscale; 
    data[i + 2] = grayscale; 
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const dataUrl = canvasElement.toDataURL('image/jpeg', 0.9);
  previewImageElement.src = dataUrl;
  previewImageElement.style.display = 'block'; 

  // === JEMBATAN OTOMATIS KE SCRIPT.JS ===
  if (window.setCapturedPhoto) {
    window.setCapturedPhoto(dataUrl);
    console.log("Foto terkirim ke penampung utama!");
  }
}

/**
 * 3. Mematikan fungsi kamera (Lifecycle cleanup)
 */
export function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
    console.log('Kamera dimatikan.');
  }
}