# Career Verse

Career Verse adalah prototipe simulasi karier interaktif berbahasa Indonesia. Proyek ini menggunakan JavaScript ES modules tanpa framework, dengan fondasi visual 3D berbasis Three.js yang dimuat dari CDN.

## Fitur yang tersedia

- Pilihan profesi dan perusahaan fiktif.
- Alur lamaran, wawancara, penawaran kerja, tugas, evaluasi, dan progres karier.
- Sistem jadwal kerja, rapat, pesan, interupsi, deadline, dan ringkasan harian.
- Fondasi lokasi rumah, tempat kerja, mal, dan tempat belajar.
- Scene kantor 3D dengan karakter pemain berbasis geometri 3D.
- Kontrol gerak WASD / tombol panah, Shift untuk bergerak cepat, dan E untuk berinteraksi dengan meja kerja.
- Aktivitas kerja pertama terhubung ke sistem tugas Digital Marketer dan memperbarui progres save.
- Ekspor/impor progres melalui berkas JSON.

## Menjalankan

Gunakan Node.js versi 20 atau lebih baru. Dari folder proyek:

```bash
npm test
```

Untuk membuka game, jalankan server statis lokal (misalnya `npx serve .`) lalu buka URL lokal yang ditampilkan. Jangan membuka `index.html` langsung melalui `file://`, karena proyek memakai ES modules dan `fetch`. Scene 3D membutuhkan koneksi internet untuk mengambil Three.js dari CDN.

## Kontrol dan batasan prototipe

Scene 3D saat ini merupakan vertical slice awal: satu kantor, karakter pemain geometri 3D, gerak third-person, kamera mengikuti karakter, dan satu interaksi tugas kerja. Ini belum merupakan game open-world 3D lengkap. NPC belum memiliki AI/rutinitas, animasi karakter masih sederhana, dan siklus hidup 24 jam, cuaca, rumah, mal, kendaraan, serta interior lain belum dibangun sebagai dunia 3D yang dapat dijelajahi.

## Data progres

Progres permainan tersimpan di `localStorage` browser dengan key `career-verse-save`. Pada profil browser yang belum memiliki save, proyek akan memuat `saves/career-verse-save.json` sebagai save awal (Digital Marketer di Kopi Kilat). Save lokal yang sudah ada tidak akan ditimpa. Gunakan tombol **Ekspor save** untuk membuat cadangan dan **Impor save** untuk memulihkan progres.

## Lisensi dan kredit

Lihat [LICENSE](./LICENSE) dan [CREDITS.md](./CREDITS.md).

### Fitur Stage 2 (3D)
Di kantor, dekati Bu Ratna untuk berbicara dan pilih respons yang memengaruhi statistik karakter. Dekati mesin kopi untuk memulihkan energi. Jam simulasi berjalan selama sesi dan waktu terakhir disimpan ketika dunia 3D ditutup. Tekan E hanya saat prompt interaksi objek muncul. Drag mouse pada area 3D untuk memutar kamera; gerakan WASD mengikuti arah kamera.


## Rencana pengembangan

Audit teknologi, hasil pengujian, keputusan engine jangka panjang, dan roadmap implementasi tersedia di [DEVELOPMENT-ROADMAP.md](./DEVELOPMENT-ROADMAP.md).
