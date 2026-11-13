# Career Verse — Catatan Pengembangan 3D

## Vertical slice 0.2

### Ditambahkan
- Avatar pemain dari geometri Three.js: kepala, rambut, badan, lengan, dan kaki.
- Kontrol third-person dengan WASD/tombol panah dan Shift.
- Kamera mengikuti posisi pemain.
- Scene kantor dengan lantai, dinding, jendela, meja, monitor, kursi, tanaman, mesin kopi, dan NPC placeholder.
- Prompt interaksi saat pemain mendekati meja kerja.
- Tombol E membuka aktivitas kerja sesuai profesi yang tersimpan.
- Pilihan aktivitas menggunakan sistem `applyWorldTask` yang sudah ada dan menyinkronkan hasil ke save utama.
- Save bawaan dipulihkan otomatis hanya ketika browser belum mempunyai save lokal.

### Validasi
- `node --check` untuk modul utama: lulus.
- `npm test`: 31/31 lulus.
- Uji visual WebGL headless: belum berhasil dijalankan karena Chromium pada lingkungan build tidak dapat menginisialisasi ANGLE/EGL. Perlu pengujian langsung di browser desktop.

### Batasan yang masih ada
- Satu scene kantor; belum open-world.
- NPC masih placeholder statis, belum memiliki AI, jadwal, atau percakapan.
- Animasi jalan masih berupa ayunan anggota tubuh sederhana.
- Belum ada collision fisik dengan furnitur, navigasi kota, rumah, mal 3D, kendaraan, cuaca, atau siklus 24 jam.
- Three.js diambil dari CDN, sehingga koneksi internet diperlukan.

## Stage 2 — NPC, interaksi kantor, dan ritme waktu
- Bu Ratna kini bergerak ringan di area kantor dengan rutinitas patroli sederhana.
- Pemain dapat berbicara dengan Bu Ratna melalui tiga respons; pilihan memengaruhi relasi, reputasi, stres, kepuasan, atau skill.
- Mesin kopi dapat digunakan untuk memulihkan energi dan mengurangi stres, dengan batas statistik 0–100.
- Jam dunia bergerak selama sesi, menampilkan hari dan jam, mengubah intensitas cahaya siang, serta menyimpan waktu terakhir saat dunia ditutup.
- Interaksi menggunakan objek terdekat, sehingga tombol E tidak lagi selalu memicu meja kerja.
