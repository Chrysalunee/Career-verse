# Careerverse — simulasi karier

Game karier statis berbasis HTML, CSS, dan JavaScript murni.

## Menjalankan
GitHub Pages: https://chrysalunee.github.io/Career-verse/. Untuk lokal jalankan `python3 -m http.server 8000` di root repo, lalu buka http://localhost:8000. Jangan buka dengan `file://` karena JSON dimuat menggunakan `fetch`.

## Hari Kerja
Mode **Hari Kerja** membagi hari menjadi slot per jam tanpa timer real-time. Slot tugas, rapat, makan siang terkunci, belajar, fleksibel dan lembur dapat direncanakan. Tombol mulai/lewati menjalankan giliran; sore hari mendapat penalti energi jika makan siang dilewatkan. Lembur opsional memiliki konsekuensi stres dan pengingat bahwa jam serta upah lembur perlu mengikuti peraturan dan perjanjian kerja yang berlaku. Tombol **Mode Ringkas** mempertahankan alur lama satu mini-game per hari.

Rapat stand-up, klien, one-on-one dan brainstorming mengurangi waktu fokus. Persiapan di slot sebelumnya meningkatkan hasil. Deadline proyek dapat dikerjakan beberapa slot dan berlanjut antarhari; status mencakup belum mulai, berjalan, siap review, selesai dan terlambat. Inbox email/chat adalah simulasi lokal—tidak mengirim pesan sungguhan. Balasan sopan, tegas, santai atau defensif memengaruhi stat. Mode Fokus menahan notifikasi non-penting satu slot. Gangguan memberi opsi membantu, menunda atau mengabaikan. Ringkasan akhir hari mencatat produktivitas, tugas, rapat, balasan dan tips.

Field save tambahan: `workdayMode`, `workday` (slot, cursor, lunch, focus, interruption, productivity inputs dan summary), `deadlines`, `inbox` (emails/chats/unread), `dailyHistory`, `workPreferences`. Migrasi menambahkan default tanpa mengubah field lama. Save lama yang belum punya `workdayMode` otomatis memakai `compact` agar alur sebelumnya tidak berubah; save baru memakai `full`. Pilihan preferensi aksesibilitas mendukung gerak dikurangi, teks besar dan mematikan toast.

## Data workday
- `data/workday/schedules.json`: jam kerja per gaya perusahaan (`startup`, `korporasi`, `agency`, `remote`, `freelance`, `default`). Tambahkan gaya lewat properti style dan cocokkan `workStyle` pada data perusahaan.
- `meetings.json`: item rapat dengan `id`, `title`, `hour`, `everyDays`, `duration`, dan `type`.
- `messages.json`: pemicu simulasi inbox dengan sender, subject, text, importance, kind dan daftar balasan.
- `interruptions.json`: contoh gangguan kantor.
- `tips.json`: tips edukasi untuk ringkasan.

Perusahaan atau profesi dapat menambah `workStyle` dan data rapat/pesan. Semua nama/tempat/brand/tokoh adalah fiktif. Pesan phishing hanya latihan, jangan mengklik tautan atau memberikan kata sandi sungguhan.

## Pengujian
Jalankan `npm test` dengan Node.js 18+. Test mencakup engine dan helper Hari Kerja: energi, deadline lintas slot, rapat/persiapan, pemicu pesan dan nada balasan, mode fokus, gangguan, produktivitas, serta migrasi save lama.

## Aksesibilitas dan disclaimer
Navigasi memakai tombol keyboard, fokus terlihat, notifikasi memakai live region sopan dan tidak ada batas waktu real-time. Pengaturan mengurangi gerak, memperbesar teks dan mematikan toast. Game edukatif ini bukan pengganti nasihat profesional/medis/hukum/keselamatan kerja. Semua nama perusahaan, brand, dan tokoh dalam game ini fiktif. Kemiripan dengan pihak nyata adalah kebetulan. Lisensi MIT.
