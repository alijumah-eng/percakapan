# Hiwar · Percakapan Arab sehari-hari

Aplikasi pembelajaran percakapan bahasa Arab fusha untuk pemula. Frontend React + TypeScript + Vite. Backend Netlify Functions dan penyimpanan Netlify Blobs. Audio memakai Web Speech API di browser, tanpa API key TTS.

## Fitur yang sudah tersedia

- 12 tema: perkenalan, kelas, keluarga, rutinitas, waktu, kantin, pasar, tempat tinggal, arah, hobi, kesehatan, perjalanan.
- Total 72 giliran dialog, 36 kosakata, dan 36 soal pilihan ganda.
- Teks Arab berharakat dengan arah RTL; terjemahan dan transliterasi dapat disembunyikan.
- TTS per kalimat, seluruh dialog, pilihan suara Arab, pengaturan kecepatan, tombol berhenti, penanda kalimat aktif. Pemutaran baru membatalkan pemutaran lama.
- Latihan peran Ahmad/Ali dengan teks jawaban tersembunyi sampai dibuka. Ini latihan mandiri, bukan pengenalan suara atau penilaian pelafalan.
- Kuis diperiksa di backend; kunci jawaban tidak dikirim bersama endpoint materi.
- Progres anonim tersimpan di server dan disalin ke localStorage sebagai cache baca.
- Kode pemulihan untuk mengakses progres yang sama di perangkat lain, tanpa akun/email.
- Pencarian tema, dashboard progres, ekspor laporan JSON, dan hapus progres server.
- Tata letak responsif hijau sage, krem, dan putih dengan navigasi seluler.

## Menjalankan di komputer

Prasyarat: Node.js 22.13+ dan npm. Ekstrak folder ini lalu buka terminal di folder yang memiliki `package.json`.

```bash
npm install
npm run dev
```

Buka alamat yang dicetak Vite, biasanya http://localhost:5173. API lokal berjalan di 127.0.0.1:3001. Vite meneruskan `/api` ke server tersebut. Data lokal tersimpan dalam `.local-data/`, yang diabaikan Git. Tutup dengan Ctrl+C.

```bash
npm test
npm run build
```

`npm run preview` hanya mempratinjau hasil frontend. Untuk fitur backend lokal, gunakan `npm run dev`. API Netlify berjalan setelah deployment repository.

## Unggah ke GitHub

Buat repository kosong di GitHub. Dari folder proyek:

```bash
git init
git add .
git commit -m "Build Hiwar Arabic learning app"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

Ganti USERNAME dan NAMA-REPOSITORY. Jika repository sudah terhubung, cukup commit dan push perubahan. Jangan unggah `node_modules`, `.local-data`, `.env`, atau kode pemulihan pribadi. Setelah instalasi di komputer, commit `package-lock.json` yang dihasilkan npm agar versi dependensi transitif terkunci.

## Deployment Netlify

1. Masuk Netlify, pilih tambah proyek dan impor repository GitHub.
2. Pilih repository proyek ini.
3. Jika isi folder ini berada di root repository, kosongkan Base directory. Jika diunggah sebagai subfolder `hiwar/`, isi Base directory dengan `hiwar`.
4. Build command: `npm run build`.
5. Publish directory: `dist`.
6. Functions directory: `netlify/functions`.
7. Deploy. Pengaturan lain sudah tersedia di `netlify.toml`, termasuk Node 22 dan routing API.
8. Buka situs melalui HTTPS. Coba materi, kuis, muat ulang, pemulihan kode di browser lain, dan penghapusan progres.

Tidak memerlukan API key TTS atau database eksternal. SDK Netlify Blobs menggunakan konteks Netlify Functions secara otomatis. Jika penyimpanan tidak tersedia pada akun/konteks deployment, endpoint progres mengembalikan 503 dengan pesan yang terlihat di antarmuka. Periksa dukungan Blobs dan log Functions di dashboard Netlify. Kuota hosting, Functions, dan Blobs mengikuti paket Netlify.

Gunakan impor GitHub untuk aplikasi lengkap. Mengunggah folder `dist` saja hanya menyediakan frontend dan tidak memasang backend.

## Struktur

```text
src/
  main.tsx           Antarmuka dan alur belajar
  tts.ts             Kontrol TTS browser dan antrean suara
  style.css          Tampilan responsif
  types.ts           Tipe data frontend
server/
  lessons.json       Materi dan kunci jawaban
  api.ts             Logika API dan penilaian kuis
  local.ts           Server lokal dengan penyimpanan berkas
netlify/functions/
  api.ts             Adapter Netlify Blobs
scripts/dev.mjs      Peluncur frontend dan backend lokal
tests/api.test.ts   Pengujian API dengan penyimpanan in-memory
netlify.toml         Pengaturan deployment
```

## Endpoint

| Endpoint | Metode | Fungsi |
| --- | --- | --- |
| `/api/lessons` | GET | Materi tanpa kunci jawaban |
| `/api/progress` | GET | Membaca progres pemilik kode |
| `/api/complete` | POST | Menandai materi selesai, body `{ "lessonId": "1" }` |
| `/api/quiz` | POST | Menilai jawaban, body `{ "lessonId": "1", "answers": [0,1,2] }` |
| `/api/progress` | DELETE | Menghapus progres pemilik kode |

Selain materi publik, endpoint membutuhkan `Authorization: Bearer <kode-64-karakter-hex>`. Kode dibuat browser memakai `crypto.getRandomValues`. Server menyimpan progres di bawah hash SHA-256 kode, bukan kode asli. Tiap materi memiliki satu record progres; nilai kuis memakai hasil terakhir, bukan nilai tertinggi. Penulisan bersamaan untuk materi yang sama memakai hasil penulisan terakhir.

## TTS dan kualitas materi

TTS memakai `speechSynthesis.getVoices()` dan hanya menampilkan suara berbahasa `ar` atau `ar-*`. Browser/perangkat mungkin tidak menyediakan suara Arab. Aplikasi menampilkan petunjuk jika tidak ada suara; materi dan kuis tetap dapat digunakan. Pemasangan suara dilakukan melalui pengaturan sistem, tidak melalui website. Beberapa suara bekerja melalui layanan jaringan, sehingga TTS tidak dijamin offline. Ketersediaan suara laki-laki/perempuan juga bergantung pada perangkat; versi ini menggunakan satu suara pilihan pengguna.

TTS membaca teks Arab berharakat. Transliterasi adalah bantuan baca, bukan standar fonetik yang presisi. Materi menggunakan sapaan laki-laki tunggal dan menyediakan catatan bentuk perempuan. Sebelum digunakan sebagai materi resmi kelas, minta pengajar meninjau harakat, transliterasi, dan hasil suara pada perangkat sasaran. Materi kesehatan hanya latihan bahasa.

## Privasi dan batas cakupan

Kode pemulihan adalah kunci akses. Siapa pun yang memilikinya dapat membaca, mengubah, atau menghapus progres. Ini bukan sistem akun dengan verifikasi identitas. Tidak ada nama, email, rekaman mikrofon, atau data pribadi yang diminta. Menghapus cache/browser tanpa menyimpan kode membuat akses progres lama hilang. Memulihkan kode lain mengganti progres aktif dan tidak menggabungkan data. Ekspor JSON adalah laporan, bukan mekanisme pemulihan.

Google Fonts dimuat dari luar jika koneksi tersedia; tersedia font sistem cadangan. Untuk penyebaran institusi besar, tambahkan autentikasi pengguna, pengendalian trafik sesuai paket hosting, dan kebijakan retensi yang sesuai sebelum menyimpan data siswa yang teridentifikasi.

## Validasi pada lingkungan pembuatan

- Empat pengujian API lulus: kelengkapan materi/kunci tersembunyi, penilaian/isolasi/penghapusan progres, penolakan input tidak valid, serta penanganan kegagalan penyimpanan.
- TypeScript frontend, server lokal, dan tes lolos pemeriksaan.
- Build Vite frontend berhasil menggunakan paket cache yang tersedia.
- Instalasi langsung npm terhalang pembatasan jaringan lingkungan pembuatan. Adapter `@netlify/blobs`, build lengkap melalui `npm run build`, deployment Netlify, serta perilaku TTS/browser belum diuji langsung. Jalankan perintah instalasi/build dan uji deployment di akun Anda.

## Dokumentasi teknologi

- Vite: https://vite.dev/guide/static-deploy.html
- Netlify Functions: https://docs.netlify.com/build/functions/get-started/
- Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
- MDN SpeechSynthesis: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
