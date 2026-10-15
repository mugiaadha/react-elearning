# Autonomous Context Protocol

1. Mandatory Context Ingestion:
   - Di awal setiap task atau sebelum membuat/mengubah kode apa pun, kamu WAJIB membaca file `PROJECT_CONTEXT.md` sebagai sumber kebenaran (single source of truth) arsitektur project ini.

2. Auto-Update Obligation:
   - Setiap kali kamu membuat fitur baru, menambah endpoint API di Laravel, menambah model/migration, menambah route frontend, atau mengubah dependensi/alur data, kamu WAJIB secara otomatis memperbarui bagian yang relevan di `PROJECT_CONTEXT.md` pada langkah terakhir sebelum menyelesaikan tugas.
   - Jangan pernah menunggu atau meminta instruksi pengguna untuk memperbarui file ini. Lakukan secara proaktif dan mandiri.

3. Execution Mode:
   - Jaga isi `PROJECT_CONTEXT.md` tetap ringkas, padat, berbasis tabel/bullet points, dan hemat token (hindari menyalin bongkahan kode panjang).

4. Permission & Execution Rule:
   - Jalankan semua perintah terminal dan perubahan file secara langsung tanpa meminta konfirmasi manual pengguna, kecuali untuk operasi destruktif berisiko tinggi (seperti `git reset --hard` atau drop database).