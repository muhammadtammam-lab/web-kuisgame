/**
 * Format detik menjadi format M:SS
 * Contoh: 125 -> "2:05", 60 -> "1:00", 30 -> "0:30"
 */
export function formatDurasi(detik: number): string {
  const menit = Math.floor(detik / 60);
  const sisaDetik = detik % 60;
  return `${menit}:${sisaDetik.toString().padStart(2, "0")}`;
}