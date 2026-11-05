# Panduan GitHub — ATC Workspace Shelter Indonesia

Kode ini adalah ekspor aplikasi ATC Workspace untuk divisi Accounting, Tax dan Compliance. Sumber aplikasi yang sudah dipublikasikan dipulihkan dari commit `ea715be163064a04eef67fceaaf55e4e3eb80c45`; panduan ini ditambahkan khusus untuk salinan GitHub.

Aplikasi aktif: https://shelter-atc-hub.royal-spice-7914.chatgpt.site

## Isi repository

- `app/`: dashboard tiga divisi, autentikasi dan API aktivitas/anggota/komentar.
- `lib/`: aturan hak akses, validasi, tipe data dan contoh tampilan.
- `db/` dan `drizzle/`: skema database dan migrasi struktur awal.
- `worker/`, `scripts/` dan `vite.config.ts`: runtime Vinext/Cloudflare Workers dan build.
- `pnpm-lock.yaml`: dependensi yang dikunci untuk reproduksi instalasi.
- `.openai/hosting.json`: identitas serta konfigurasi deployment Sites yang sudah ada; berisi binding `DB`, bukan kredensial.

Repository hanya berisi kode dan struktur database. Data operasional, akun anggota, database produksi, token akses, file environment, hasil build dan dependensi yang terpasang tidak disertakan.

## Menjalankan pada komputer developer

Gunakan Node.js minimal 22.13.0 dan pnpm 11.25.0. Dari folder hasil clone:

```sh
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_deep_shockwave.sql
pnpm dev
```

Buka URL yang dicetak server development. Pada clone bersih dengan profil portable, URL biasanya menggunakan localhost:5173. Pengaturan development portable menyediakan login simulasi khusus loopback melalui tautan masuk; mekanisme simulasi tidak disertakan dalam build produksi. Buka aplikasi, klik Masuk, lalu periksa menu Anggota tim setelah login development. Database lokal terpisah dari database produksi.

Migrasi struktur awal dijalankan satu kali pada database lokal baru. Jika membuat perubahan skema, tambahkan migrasi baru; jangan mengubah migrasi yang sudah diterapkan. File `.sites-runtime/` dan `.wrangler/` berisi keadaan lokal dan tidak boleh dikirim ke GitHub.

Pemeriksaan tipe:

```sh
pnpm exec tsc --noEmit
```

## Deploy dan autentikasi produksi

Aplikasi memerlukan runtime server Cloudflare Workers/Vinext dan database D1. Hosting statis saja tidak menjalankan API atau penyimpanan bersama aplikasi ini.

Deployment Sites yang sudah ada menggunakan Sign in with ChatGPT, akses situs privat, dan pemeriksaan keanggotaan pada setiap endpoint. Pertahankan integrasi tersebut ketika memperbarui situs yang sama. Untuk hosting di luar Sites, siapkan penyedia autentikasi tepercaya dan sesuaikan kode server yang membaca identitas; jangan mempercayai header identitas yang dapat dikirim langsung oleh pengunjung. Proses inisialisasi admin pertama mengasumsikan situs masih privat khusus pemilik sampai inisialisasi selesai.

Ekspor ke GitHub menyimpan kode sumber. Perubahan atau push GitHub belum otomatis memublikasikan ulang situs yang sudah berjalan; pipeline deployment perlu dikonfigurasi tersendiri apabila diperlukan. Jangan memasukkan token Cloudflare, token GitHub atau kredensial produksi ke repository. Gunakan penyimpanan secrets pada platform deployment.

## Akses tim

Admin mendaftarkan nama, email akun ChatGPT dan divisi pada menu Anggota tim, kemudian memberikan akses situs kepada email yang sama melalui pengaturan berbagi Sites. Pendaftaran aplikasi dan izin membuka situs adalah dua lapisan terpisah. Anggota dapat melihat semua divisi, memperbarui divisi sendiri dan berkomentar lintas divisi; pemantau hanya membaca.

Accurate Online dan Coretax tetap menjadi aplikasi sumber. Dashboard ini belum menarik data dari keduanya secara otomatis.
