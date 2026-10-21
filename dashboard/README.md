# DATA SLAYER - Dashboard Analisis Kesenjangan Pendidikan Indonesia

> **Data Analytics Competition (DAC)**  
> **Tema:** "Lotere Alamat" & Dekomposisi Disparitas Pendidikan Multidimensi di Indonesia  
> **Koleksi Data:** BPS Susenas 2023–2025 & Publikasi IPM BPS  

---

## 📌 Ringkasan Alur Cerita (2 Halaman)

Dashboard ini dibangun sesuai dengan arahan konsep pada berkas `DRAFT DATASLAYER.pdf` dan pemetaan data di `Sumber_Data_dan_Kerangka_Dashboard_DAC.xlsx`:

### Halaman 1: "Lotere Alamat" (*The Postal Lottery*)
* **Panel Kiri (Selektor Profil Anak):**
  * Memungkinkan pengguna memilih 4 atribut latar belakang anak:
    1. **Provinsi Domisili** (38 Provinsi di Indonesia).
    2. **Klasifikasi Wilayah** (Perkotaan vs Perdesaan).
    3. **Kuintil Pengeluaran Ekonomi Keluarga** (Kuintil 1 / Terbawah sampai Kuintil 5 / Teratas).
    4. **Jenis Kelamin** (Laki-laki vs Perempuan).
  * **Profil Pembanding Otomatis (*Baseline Reference*):** Secara otomatis mencocokkan profil anak dari **Kuintil 5 Perkotaan** di provinsi yang sama sebagai tolok ukur kesempatan optimal.
* **4 Kartu KPI Utama:**
  1. **Peluang Tamat SMA:** Probabilitas kelulusan anak berprofil tersebut.
  2. **Opportunity Gap:** Selisih poin persentase (*pp*) terhadap profil pembanding.
  3. **Faktor Penghambat Terbesar:** Analisis komparatif penarik penurunan peluang (Ekonomi, Spasial, atau Desa-Kota).
  4. **Peringkat Provinsi:** Posisi relatif provinsi domisili di tingkat nasional.
* **Funnel "Tangga yang Bocor" (SD $\rightarrow$ SMP $\rightarrow$ SMA $\rightarrow$ Perguruan Tinggi):**
  * Menampilkan dua seri bar berdampingan (*Profil Terpilih* vs *Profil Pembanding*).
  * Menyoroti kebocoran dramatis yang mulai terjadi secara masif pada transisi **SMP ke SMA** (terutama kuintil terbawah ~52% vs menengah-atas ~68–90%) dan **Perguruan Tinggi**.
* **Simulasi Nyata 100 Ikon Orang (*Waffle Person Grid*):**
  * Grid 100 ikon orang interaktif dengan kalimat dinamis:  
    *“Dari 100 anak berprofil ini, sekitar X yang lulus SMA (berbanding Y pada profil pembanding)”*.
* **Kejujuran Model (*Estimasi Indikatif*):**
  * Dilengkapi catatan transparansi rumus model estimasi berlapis:
    $$\text{Peluang}(j) \approx \min\Big(100\%, P_{\text{nasional}}(j \mid \text{kuintil}) \times R_{\text{provinsi}}(j) \times R_{\text{daerah}}(j) \times R_{\text{gender}}(j)\Big)$$

---

### Halaman 2: "Mengapa Alamat Menentukan?" (*Spatial Causality & Clustering*)
* **Sinkronisasi Filter Antarhalaman:**
  * Provinsi yang dipilih di Halaman 1 otomatis tersinkronisasi sebagai filter aktif di Halaman 2.
* **Peta Spasial & Drill-down Konteks Lokal Jawa Tengah:**
  * Peta interaktif Leaflet 38 provinsi di Indonesia dan titik 35 Kabupaten/Kota di Jawa Tengah.
* **Scatter Plot Akses vs Capaian & Tipologi K-Means ($k=4$):**
  * Sumbu X: **Dimensi Akses** (APS gabungan 7–18 tahun).
  * Sumbu Y: **Dimensi Capaian** (Rata-rata Lama Sekolah / RLS dan Harapan Lama Sekolah / HLS).
  * 4 Tipologi Hasil Klaster:
    1. 🟢 **Maju Merata:** Akses & Capaian Tinggi (Kota Semarang, Kota Surakarta, Kota Salatiga, Kota Magelang).
    2. 🟡 **Kota Timpang:** Akses Tinggi namun Capaian Masih Disparitas (Kab. Kudus, Kab. Sukoharjo, dkk).
    3. 🔵 **Berkembang:** Akses dan Capaian Menengah (Kab. Banyumas, Klaten, Boyolali, Kendal, dkk).
    4. 🔴 **Tertinggal Struktural:** Akses & Capaian Rendah, Kerentanan Putus Sekolah Usia SMA Tinggi (Kab. Brebes, Pemalang, Wonosobo, Banjarnegara).
* **Dekomposisi Indeks Theil (Bukti Analitis Utama):**
  * Membuktikan fakta empiris penting: **68.2% ketimpangan pendidikan bersumber dari disparitas DALAM provinsi (antar kabupaten/kota)**, jauh melampaui ketimpangan antarprovinsi (31.8%).
* **Dekomposisi Penyebab Opportunity Gap:**
  * Bar kontribusi faktor: Status Ekonomi (48.2%), Wilayah Spasial Provinsi (25.8%), Wilayah Desa-Kota (21.4%), dan Gender (4.6%).

---

## 🎨 Watermark & Ketentuan Desain

Sesuai rubrik kompetisi:
* Terdapat **Watermark Data Slayer** berupa bingkai pink elegan dengan logo `DS` yang terpasang di sisi kanan tengah layar.
* Palet warna dirancang dengan tema gelap modern (*Slate*), didukung aksen pink fuschia signature Data Slayer (`#ec4899` / `#f43f5e`), biru cyan, dan hijau emerald.
* Dilengkapi tombol **Cetak / PDF 2 Hal** yang sudah dioptimalkan melalui *CSS Print Media Queries* agar rapi dicetak sebagai presentasi 2 halaman lanskap tanpa elemen navigasi browser yang mengganggu.

---

## 🚀 Cara Menjalankan Dashboard

### Opsi 1: Buka Langsung di Browser (Paling Praktis)
Cukup buka berkas berikut dengan klik ganda (*double click*):
```
DATA SLAYER/dashboard/index.html
```
Dashboard akan langsung terbuka dan berfungsi penuh di Google Chrome, Microsoft Edge, atau Mozilla Firefox.

### Opsi 2: Jalankan via Local Server Python
Buka PowerShell atau Command Prompt di folder `DATA SLAYER/dashboard` lalu jalankan:
```bash
python start_dashboard.py
```
Perintah ini akan menyalakan server lokal dan otomatis membuka `http://localhost:8080/index.html` di peramban Anda.

### Opsi 3: Regenerasi Data & Pemodelan Ulang (K-Means & Theil)
Jika ingin mengubah data dasar atau menjalankan ulang kalkulasi K-Means dan Indeks Theil:
```bash
python scripts/generate_models.py
```

---

## 📂 Struktur Berkas

```
DATA SLAYER/
├── DRAFT DATASLAYER.pdf                         # Dokumen konsep awal lomba
├── Sumber_Data_dan_Kerangka_Dashboard_DAC.xlsx   # Katalog indikator BPS & rumus acuan
└── dashboard/                                   # Folder khusus implementasi dashboard
    ├── index.html                               # Halaman utama aplikasi dashboard
    ├── start_dashboard.py                       # Skrip peluncur local server
    ├── README.md                                # Dokumentasi lengkap proyek
    ├── css/
    │   └── style.css                            # Tata gaya modern, responsive & print media
    ├── js/
    │   ├── data.js                              # Dataset terkompilasi BPS 38 Prov & 35 Kab Jateng
    │   ├── model.js                             # Kalkulasi model estimasi berlapis & gap analysis
    │   └── app.js                               # Controller interaktif UI, Leaflet map, & Chart.js
    ├── scripts/
    │   └── generate_models.py                   # Mesin analitik Python: K-Means (k=4) & Dekomposisi Theil
    └── data/
        ├── bps_provinces.json                   # Indikator 38 provinsi
        ├── jateng_kabupaten.json                # Data 35 kab/kota Jateng + klaster K-Means
        ├── completion_rates.json                # Tingkat penyelesaian SD-PT per kuintil
        └── theil_decomposition.json             # Hasil dekomposisi Theil & driver gap
```
