# Karier Nyata — Career-verse

Game simulasi karier berbasis web dengan HTML, CSS, dan JavaScript murni. Tanpa framework, iklan, atau pelacakan.

## Cara bermain
Pilih profesi, pilih perusahaan, lamar, jalani wawancara, lalu kerjakan misi harian. Keputusan memengaruhi hasil tugas, energi, stres, reputasi, relasi tim, skill, dan kesempatan promosi. Save disimpan lokal di browser; gunakan ekspor/impor save untuk memindahkannya.

## Melihat game
Buka situs GitHub Pages: https://chrysalunee.github.io/Career-verse/
Jika belum terbarui, tunggu workflow **pages build and deployment** selesai hijau, lalu muat ulang dengan Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac).
Untuk menjalankan lokal, dari folder repo jalankan `python3 -m http.server 8000`, lalu kunjungi http://localhost:8000. Jangan buka `index.html` melalui `file://`, karena browser membatasi pemuatan JSON.

## Struktur project
- `index.html` — halaman utama
- `css/styles.css` — tampilan game
- `js/app.js`, `js/ui.js`, `js/engine.js` — alur, antarmuka, dan logika
- `data/professions/` — data profesi JSON
- `data/companies/` — data perusahaan JSON
- `data/brands/` — katalog brand fiktif
- `tests/engine.test.js` — test logika dasar

## Menambah data
Tambahkan JSON profesi dengan `id`, `name`, `icon`, `salaryRange`, `summary`, `careerLadder`, `tasks`, `events`, `ethicalDilemmas`, dan `realWorld`; setiap task sebaiknya memuat `title`, `difficulty`, `prompt`, dan `options` berisi `label`, `score` (0–100), serta `feedback`. Daftarkan ID file pada array `professionIds` di `js/app.js`.

Data perusahaan memerlukan `id`, `name`, `logo`, `industry`, `size`, `location`, `culture`, `salary` (array min/max), `roles` (ID profesi), `clients`, `boss`, `coworkers`, `benefits`, `pros`, `cons`, dan `review`. Daftarkan ID-nya di `companyIds` pada `js/app.js`. Semua nama harus fiktif.

## Test
Jalankan `npm test` dengan Node.js 18 atau lebih baru.

## Lisensi dan disclaimer
Lisensi MIT (lihat `LICENSE`). Game ini hanya untuk edukasi dan bukan pengganti nasihat profesional, medis, hukum, keuangan, atau keselamatan kerja. Semua nama perusahaan, brand, dan tokoh dalam game ini fiktif. Kemiripan dengan pihak nyata adalah kebetulan.
