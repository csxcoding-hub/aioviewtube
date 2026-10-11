# LoopTube PRO - YouTube Looper & Background Player

Aplikasi pemutar dan pengulang video/playlist YouTube otomatis (*loop* tanpa henti siklikal 1 s/d N), mendukung integrasi resmi akun Google untuk interaksi sah (Like, Subscribe, Komentar tercatat di YouTube Studio Analytics), pemutaran audio di latar belakang (*background audio visualizer*), dan mode desktop Windows (.exe x64 & x86).

Dikembangkan oleh **[Kios Kode](https://kioskode.my.id/)**  
- **Website**: [https://kioskode.my.id/](https://kioskode.my.id/)  
- **WhatsApp**: 089690361144  
- **Email**: cs.kioskode@gmail.com  

---

## 🚀 Cara Build Aplikasi Windows (.exe) di GitHub (Otomatis)

Proyek ini telah dilengkapi dengan workflow **GitHub Actions** (`.github/workflows/build-windows.yml`) yang siap melakukan kompilasi otomatis file installer Windows (`.exe` untuk 64-bit dan 32-bit/x86 serta versi Portable).

### Cara Menjalankan Build di GitHub:

1. **Push Repository ke GitHub**:
   Upload atau push seluruh folder proyek ini ke repository GitHub Anda (cabang `main` atau `master`).
   ```bash
   git init
   git add .
   git commit -m "feat: LoopTube PRO build ready"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

2. **Jalankan Build Otomatis**:
   - Begitu Anda melakukan `git push`, GitHub Actions akan otomatis memulai proses build pada mesin Windows (`windows-latest`).
   - Atau, buka tab **Actions** di halaman repository GitHub Anda.
   - Pilih workflow **"Build Windows App (x64 & x86)"** di bilah kiri.
   - Klik tombol **"Run workflow"** -> **"Run workflow"**.

3. **Unduh File .EXE (Artifacts)**:
   - Tunggu proses build selesai (sekitar 3–5 menit dengan tanda centang hijau).
   - Klik proses build yang telah selesai tersebut.
   - Gulir ke bagian paling bawah ke bagian **Artifacts**.
   - Unduh **`LoopTube-Windows-Binaries.zip`** yang berisi:
     - Installer Setup 64-bit (`LoopTube Setup 1.0.0.exe`)
     - Installer Setup 32-bit (`LoopTube Setup 1.0.0-ia32.exe`)
     - Versi Portable langsung jalan tanpa install (`LoopTube 1.0.0.exe` & `ia32.exe`)

4. **Membuat Rilis Otomatis (GitHub Releases)**:
   - Cukup buat Git Tag versi, misalnya:
     ```bash
     git tag v1.0.0
     git push origin v1.0.0
     ```
   - GitHub Actions akan otomatis membuat halaman **Release** publik di repository Anda dengan semua file `.exe` siap diunduh oleh pengguna.

---

## 💻 Cara Menjalankan & Build di Komputer Lokal

### Prasyarat
- Node.js versi 20+
- NPM

### Menjalankan Mode Web (Development):
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

### Menguji Build Web:
```bash
npm run build
```

### Mengemas Aplikasi Windows (.exe) secara Lokal:
```bash
npm install --save-dev electron electron-builder
npm run electron:pack
```
File installer `.exe` akan dihasilkan di dalam folder `release/`.
