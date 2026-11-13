# Karier Nyata — Career-verse

Game simulasi karier berbasis HTML, CSS, dan JavaScript murni. Tanpa framework, iklan, atau pelacakan. Data save tersimpan di localStorage perangkat.

## Jalankan game

Browser membatasi `fetch()` JSON dari `file://`, jadi jalankan server statis di folder repository:

```bash
python3 -m http.server 8000
```

Buka http://localhost:8000. Alternatif: `npx serve .`. Untuk publikasi, aktifkan GitHub Pages pada branch `main`, folder `/ (root)`.

## Cara bermain

Pilih satu dari lima profesi, baca profil dan trade-off tempat kerja, kirim lamaran, ikuti wawancara, lalu tinjau/negosiasikan tawaran. Di kantor, pilih satu tugas per hari, jawab mini-game situasional, dan baca Info Dunia Nyata. Setiap beberapa tugas muncul event yang dapat direspons dengan berdiskusi atau mengambil beban tambahan. Energi, stres, reputasi, relasi tim, skill, tabungan, XP, pencapaian, gajian, evaluasi mingguan, dan promosi berkembang selama permainan. Istirahat memulihkan energi; kursus berbiaya Rp250.000 menaikkan skill. Tersedia ekspor/impor save dari toolbar.

## Struktur

- `index.html`, `css/styles.css`: dokumen dan antarmuka responsif.
- `js/app.js`: alur layar dan interaksi game.
- `js/engine.js`: save, skor, peluang diterima, evaluasi, gaji, promosi.
- `js/ui.js`: rendering antarmuka dan kontrol.
- `data/professions/*.json`: definisi profesi.
- `data/companies/*.json`: tempat kerja fiktif.
- `data/brands/brands.json`: katalog brand fiktif.
- `tests/engine.test.js`: unit test engine.

## Menambah profesi

Tambahkan JSON bernama `data/professions/<id>.json`, lalu masukkan ID ke daftar `professionIds` di `js/app.js`.

```json
{
  "id": "contoh-profesi", "name": "Contoh Profesi", "icon": "🧰",
  "salaryRange": [5000000, 12000000], "summary": "Gambaran profesi.",
  "hardSkills": ["Keahlian"], "softSkills": ["Kolaborasi"],
  "careerLadder": ["Junior", "Senior", "Manajer"], "tools": ["Alat kerja"],
  "terms": ["Istilah"], "kpis": ["Kualitas"],
  "tasks": [{"title":"Tugas","difficulty":2,"prompt":"Apa langkah terbaik?","options":[{"label":"Pilihan","score":90,"feedback":"Umpan balik."}]}],
  "events": ["Event profesi"], "ethicalDilemmas": ["Dilema realistis"],
  "realWorld": "Penjelasan edukatif.", "educationDisclaimer": false
}
```

Pilihan mini-game sebaiknya memiliki skor 0–100 dan umpan balik membangun. Untuk profesi medis, hukum, dan keselamatan, tandai `educationDisclaimer: true`; game tidak menggantikan panduan profesional.

## Menambah perusahaan

Tambahkan `data/companies/<id>.json` dengan `id`, `name`, `logo`, `industry`, `size`, `location`, `culture`, `salary: [min,max]`, `roles` (ID profesi), `clients`, `boss`, `coworkers`, `benefits`, `pros`, `cons`, dan `review`. Masukkan ID ke daftar `companyIds` di `js/app.js`. Tambahkan brand ke `data/brands/brands.json`. Gunakan nama fiktif dan trade-off seimbang.

## Test

```bash
npm test
```

Test menggunakan runner bawaan Node.js, tanpa dependency.

## Kontribusi

Buat branch, tambahkan data JSON valid dan nama fiktif, jalankan `npm test`, lalu ajukan pull request dengan penjelasan perubahan. Komentar kode menggunakan Bahasa Indonesia.

## Lisensi dan disclaimer

Lisensi MIT (lihat `LICENSE`). Game ini edukatif dan bukan nasihat profesional, medis, hukum, keuangan, atau keselamatan kerja. Angka gaji bersifat ilustratif. Semua nama perusahaan, brand, dan tokoh dalam game ini fiktif. Kemiripan dengan pihak nyata adalah kebetulan.
