# Karier Nyata — Career-verse

Game simulasi karier berbasis HTML, CSS, dan JavaScript murni. Belum menggunakan framework, iklan, atau pelacakan. Data tersimpan di localStorage perangkat.

## Jalankan game

Karena browser membatasi `fetch()` JSON dari `file://`, jalankan server statis di folder repository:

```bash
python3 -m http.server 8000
```

Buka http://localhost:8000. Alternatif: `npx serve .`. Untuk publikasi, aktifkan GitHub Pages pada branch `main`, folder `/ (root)`.

## Alur permainan

Pilih satu dari lima profesi, baca profil tempat kerja, melamar dan menjawab mini wawancara, lalu menerima/menegosiasikan tawaran. Di kantor, pilih tugas pilihan ganda yang mencerminkan pekerjaan, dapatkan hasil, Info Dunia Nyata, event, evaluasi, dan perkembangan karier. Tombol pada header bisa mengekspor atau mengimpor save JSON.

## Struktur

- `index.html`, `css/styles.css`: dokumen dan antarmuka responsif.
- `js/app.js`: alur layar dan interaksi.
- `js/engine.js`: save, skor, peluang diterima, evaluasi, gaji.
- `js/ui.js`: rendering antarmuka.
- `data/professions/*.json`: definisi profesi.
- `data/companies/*.json`: tempat kerja fiktif.
- `data/brands/brands.json`: katalog brand fiktif.
- `tests/engine.test.js`: unit test engine.

## Menambah profesi

Tambahkan JSON bernama `data/professions/<id>.json`, lalu tambahkan ID file pada daftar `professionIds` di `js/app.js`. Contoh minimal:

```json
{
  "id": "contoh-profesi",
  "name": "Contoh Profesi",
  "icon": "🧰",
  "salaryRange": [5000000, 12000000],
  "summary": "Gambaran profesi.",
  "hardSkills": ["Keahlian A"],
  "softSkills": ["Kolaborasi"],
  "careerLadder": ["Junior", "Senior", "Manajer"],
  "tools": ["Alat kerja"],
  "terms": ["Istilah"],
  "kpis": ["Kualitas"],
  "tasks": [{"title":"Tugas","difficulty":2,"prompt":"Apa langkah terbaik?","options":[{"label":"Pilihan","score":90,"feedback":"Umpan balik."}]}],
  "events": ["Event profesi"],
  "ethicalDilemmas": ["Dilema etis realistis"],
  "realWorld": "Penjelasan edukatif.",
  "educationDisclaimer": false
}
```

Setiap pilihan mini-game sebaiknya punya skor 0–100 dan umpan balik membangun. Untuk profesi medis, hukum, dan keselamatan, `educationDisclaimer` harus true dan materi tidak boleh menggantikan panduan profesional.

## Menambah perusahaan

Tambahkan `data/companies/<id>.json` dengan `id`, `name`, `logo`, `industry`, `size`, `location`, `culture`, `salary: [min,max]`, `roles` (ID profesi), `clients`, `boss`, `coworkers`, `benefits`, `pros`, `cons`, dan `review`. Lalu masukkan ID ke daftar `companyIds` di `js/app.js`. Gunakan nama fiktif dan trade-off yang seimbang. Brand baru dapat ditambahkan ke `data/brands/brands.json`.

## Skema dan cakupan MVP

Data saat ini mencakup Digital Marketer, Programmer, Guru, Perawat, Chef/Koki; 9 tempat kerja fiktif dan 35 brand/klien fiktif. Struktur mendukung perluasan profesi lainnya. Filter perusahaan, drag-and-drop kalender, simulasi kemitraan lintas profesi, dan jalur lengkap semua profesi merupakan pengembangan lanjutan.

## Test

```bash
npm test
```

Test memakai runner bawaan Node.js, tanpa dependency.

## Kontribusi

Buat branch, tambahkan data yang tervalidasi JSON, cek nama dan informasi agar fiktif, jalankan `npm test`, lalu ajukan pull request dengan penjelasan perubahan. Komentar kode menggunakan Bahasa Indonesia.

## Lisensi dan disclaimer

Lisensi MIT (lihat `LICENSE`). Game ini edukatif dan bukan nasihat profesional, medis, hukum, keuangan, atau keselamatan kerja. Angka gaji bersifat ilustratif. Semua nama perusahaan, brand, dan tokoh dalam game ini fiktif. Kemiripan dengan pihak nyata adalah kebetulan.
