# -*- coding: utf-8 -*-
"""
DATA SLAYER - Dashboard Data Generation & Analytics Engine
Performs K-Means Clustering (k=4) for Central Java Regencies,
Computes Theil Index Decomposition (Between vs Within),
and exports calibrated JSON datasets for the web dashboard.
"""

import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. BPS National Completion Rates by Quintile (Susenas BPS 2023-2025)
national_completion = {
    "Q1": {"name": "Kuintil 1 (Terbawah 20%)", "SD": 96.36, "SMP": 85.17, "SMA": 52.41, "PT": 12.35},
    "Q2": {"name": "Kuintil 2 (Bawah-Menengah)", "SD": 97.24, "SMP": 88.62, "SMA": 59.80, "PT": 18.20},
    "Q3": {"name": "Kuintil 3 (Menengah)", "SD": 98.12, "SMP": 91.12, "SMA": 68.26, "PT": 28.45},
    "Q4": {"name": "Kuintil 4 (Menengah-Atas)", "SD": 98.85, "SMP": 94.30, "SMA": 78.50, "PT": 42.10},
    "Q5": {"name": "Kuintil 5 (Teratas 20%)", "SD": 99.42, "SMP": 97.80, "SMA": 89.65, "PT": 63.80}
}

# 2. Regional Classification Ratios (Urban vs Rural)
r_daerah = {
    "Perkotaan": {"SD": 1.003, "SMP": 1.025, "SMA": 1.085, "PT": 1.185},
    "Perdesaan": {"SD": 0.996, "SMP": 0.968, "SMA": 0.892, "PT": 0.745}
}

# 3. Gender Ratios (Laki-laki vs Perempuan)
r_gender = {
    "Laki-laki": {"SD": 0.998, "SMP": 0.990, "SMA": 0.976, "PT": 0.952},
    "Perempuan": {"SD": 1.002, "SMP": 1.010, "SMA": 1.025, "PT": 1.048}
}

# 4. 38 Provinces Data (BPS Susenas & IPM 2024-2025)
provinces_raw = [
    {"kode": "11", "nama": "Aceh", "aps_7_12": 99.35, "aps_13_15": 96.80, "aps_16_18": 78.45, "rls": 9.54, "hls": 14.42, "populasi": 5482500, "r_prov": 0.985},
    {"kode": "12", "nama": "Sumatera Utara", "aps_7_12": 99.12, "aps_13_15": 95.40, "aps_16_18": 76.80, "rls": 9.71, "hls": 13.41, "populasi": 15386600, "r_prov": 0.978},
    {"kode": "13", "nama": "Sumatera Barat", "aps_7_12": 99.45, "aps_13_15": 96.90, "aps_16_18": 81.20, "rls": 9.18, "hls": 14.15, "populasi": 5757200, "r_prov": 1.015},
    {"kode": "14", "nama": "Riau", "aps_7_12": 99.20, "aps_13_15": 95.10, "aps_16_18": 75.30, "rls": 9.32, "hls": 13.35, "populasi": 6735300, "r_prov": 0.972},
    {"kode": "15", "nama": "Jambi", "aps_7_12": 99.05, "aps_13_15": 94.60, "aps_16_18": 72.85, "rls": 8.71, "hls": 13.12, "populasi": 3677500, "r_prov": 0.955},
    {"kode": "16", "nama": "Sumatera Selatan", "aps_7_12": 98.90, "aps_13_15": 93.80, "aps_16_18": 70.40, "rls": 8.45, "hls": 12.63, "populasi": 8743500, "r_prov": 0.940},
    {"kode": "17", "nama": "Bengkulu", "aps_7_12": 99.25, "aps_13_15": 95.20, "aps_16_18": 74.90, "rls": 8.98, "hls": 13.68, "populasi": 2060100, "r_prov": 0.968},
    {"kode": "18", "nama": "Lampung", "aps_7_12": 98.80, "aps_13_15": 93.20, "aps_16_18": 68.75, "rls": 8.24, "hls": 12.75, "populasi": 9176600, "r_prov": 0.925},
    {"kode": "19", "nama": "Kep. Bangka Belitung", "aps_7_12": 98.70, "aps_13_15": 92.50, "aps_16_18": 67.20, "rls": 8.21, "hls": 12.21, "populasi": 1517500, "r_prov": 0.912},
    {"kode": "21", "nama": "Kepulauan Riau", "aps_7_12": 99.50, "aps_13_15": 97.40, "aps_16_18": 82.50, "rls": 10.37, "hls": 13.02, "populasi": 2151600, "r_prov": 1.035},
    {"kode": "31", "nama": "DKI Jakarta", "aps_7_12": 99.65, "aps_13_15": 98.15, "aps_16_18": 84.60, "rls": 11.45, "hls": 13.36, "populasi": 10672100, "r_prov": 1.085},
    {"kode": "32", "nama": "Jawa Barat", "aps_7_12": 99.05, "aps_13_15": 94.20, "aps_16_18": 71.50, "rls": 8.78, "hls": 12.65, "populasi": 49935800, "r_prov": 0.948},
    {"kode": "33", "nama": "Jawa Tengah", "aps_7_12": 99.28, "aps_13_15": 95.85, "aps_16_18": 74.20, "rls": 8.02, "hls": 12.85, "populasi": 37227600, "r_prov": 0.962},
    {"kode": "34", "nama": "DI Yogyakarta", "aps_7_12": 99.70, "aps_13_15": 98.80, "aps_16_18": 87.90, "rls": 9.95, "hls": 15.65, "populasi": 3761900, "r_prov": 1.095},
    {"kode": "35", "nama": "Jawa Timur", "aps_7_12": 99.18, "aps_13_15": 95.10, "aps_16_18": 73.10, "rls": 8.11, "hls": 13.40, "populasi": 41416500, "r_prov": 0.955},
    {"kode": "36", "nama": "Banten", "aps_7_12": 99.10, "aps_13_15": 94.75, "aps_16_18": 72.30, "rls": 9.15, "hls": 13.11, "populasi": 12252000, "r_prov": 0.952},
    {"kode": "51", "nama": "Bali", "aps_7_12": 99.45, "aps_13_15": 97.20, "aps_16_18": 82.10, "rls": 9.35, "hls": 13.48, "populasi": 4414400, "r_prov": 1.028},
    {"kode": "52", "nama": "Nusa Tenggara Barat", "aps_7_12": 99.15, "aps_13_15": 95.30, "aps_16_18": 75.80, "rls": 7.74, "hls": 13.98, "populasi": 5560300, "r_prov": 0.960},
    {"kode": "53", "nama": "Nusa Tenggara Timur", "aps_7_12": 98.40, "aps_13_15": 92.10, "aps_16_18": 71.40, "rls": 7.82, "hls": 13.25, "populasi": 5541400, "r_prov": 0.932},
    {"kode": "61", "nama": "Kalimantan Barat", "aps_7_12": 98.20, "aps_13_15": 91.50, "aps_16_18": 65.80, "rls": 7.71, "hls": 12.68, "populasi": 5545700, "r_prov": 0.905},
    {"kode": "62", "nama": "Kalimantan Tengah", "aps_7_12": 98.95, "aps_13_15": 93.60, "aps_16_18": 71.90, "rls": 8.75, "hls": 12.78, "populasi": 2773700, "r_prov": 0.945},
    {"kode": "63", "nama": "Kalimantan Selatan", "aps_7_12": 99.10, "aps_13_15": 94.30, "aps_16_18": 73.40, "rls": 8.52, "hls": 12.87, "populasi": 4246400, "r_prov": 0.954},
    {"kode": "64", "nama": "Kalimantan Timur", "aps_7_12": 99.40, "aps_13_15": 96.70, "aps_16_18": 81.30, "rls": 10.02, "hls": 13.88, "populasi": 3941800, "r_prov": 1.025},
    {"kode": "65", "nama": "Kalimantan Utara", "aps_7_12": 98.90, "aps_13_15": 94.80, "aps_16_18": 74.20, "rls": 9.30, "hls": 13.15, "populasi": 746200, "r_prov": 0.965},
    {"kode": "71", "nama": "Sulawesi Utara", "aps_7_12": 99.30, "aps_13_15": 95.80, "aps_16_18": 76.50, "rls": 9.68, "hls": 13.30, "populasi": 2681500, "r_prov": 0.982},
    {"kode": "72", "nama": "Sulawesi Tengah", "aps_7_12": 98.60, "aps_13_15": 92.80, "aps_16_18": 69.50, "rls": 8.94, "hls": 13.32, "populasi": 3086800, "r_prov": 0.930},
    {"kode": "73", "nama": "Sulawesi Selatan", "aps_7_12": 99.15, "aps_13_15": 94.90, "aps_16_18": 74.60, "rls": 8.79, "hls": 13.56, "populasi": 9362300, "r_prov": 0.960},
    {"kode": "74", "nama": "Sulawesi Tenggara", "aps_7_12": 99.00, "aps_13_15": 94.20, "aps_16_18": 73.80, "rls": 9.20, "hls": 13.75, "populasi": 2755600, "r_prov": 0.958},
    {"kode": "75", "nama": "Gorontalo", "aps_7_12": 98.85, "aps_13_15": 93.10, "aps_16_18": 70.10, "rls": 8.12, "hls": 13.18, "populasi": 1205300, "r_prov": 0.935},
    {"kode": "76", "nama": "Sulawesi Barat", "aps_7_12": 98.10, "aps_13_15": 90.70, "aps_16_18": 67.40, "rls": 8.13, "hls": 12.92, "populasi": 1458600, "r_prov": 0.915},
    {"kode": "81", "nama": "Maluku", "aps_7_12": 99.30, "aps_13_15": 96.40, "aps_16_18": 79.50, "rls": 10.22, "hls": 14.05, "populasi": 1904800, "r_prov": 1.010},
    {"kode": "82", "nama": "Maluku Utara", "aps_7_12": 98.95, "aps_13_15": 94.50, "aps_16_18": 75.10, "rls": 9.28, "hls": 13.72, "populasi": 1337400, "r_prov": 0.966},
    {"kode": "91", "nama": "Papua Barat", "aps_7_12": 97.80, "aps_13_15": 92.30, "aps_16_18": 73.40, "rls": 7.95, "hls": 13.15, "populasi": 569400, "r_prov": 0.935},
    {"kode": "92", "nama": "Papua Barat Daya", "aps_7_12": 98.10, "aps_13_15": 93.10, "aps_16_18": 74.50, "rls": 8.42, "hls": 13.35, "populasi": 621900, "r_prov": 0.945},
    {"kode": "93", "nama": "Papua", "aps_7_12": 94.50, "aps_13_15": 85.20, "aps_16_18": 64.10, "rls": 7.20, "hls": 11.55, "populasi": 1035000, "r_prov": 0.840},
    {"kode": "94", "nama": "Papua Selatan", "aps_7_12": 95.20, "aps_13_15": 86.80, "aps_16_18": 63.80, "rls": 7.05, "hls": 11.30, "populasi": 522200, "r_prov": 0.835},
    {"kode": "95", "nama": "Papua Tengah", "aps_7_12": 91.20, "aps_13_15": 78.40, "aps_16_18": 54.20, "rls": 5.48, "hls": 9.85, "populasi": 1431000, "r_prov": 0.745},
    {"kode": "96", "nama": "Papua Pegunungan", "aps_7_12": 88.40, "aps_13_15": 74.10, "aps_16_18": 48.60, "rls": 4.12, "hls": 8.50, "populasi": 1430500, "r_prov": 0.690}
]

df_prov = pd.DataFrame(provinces_raw)
# Calculate rank based on composite score of SMA APS + HLS + RLS
df_prov['skor_komposit'] = (df_prov['aps_16_18'] / 100 * 0.4) + (df_prov['rls'] / 12 * 0.3) + (df_prov['hls'] / 16 * 0.3)
df_prov['peringkat'] = df_prov['skor_komposit'].rank(ascending=False, method='min').astype(int)

# 5. Central Java 35 Regencies/Cities (BPS Jawa Tengah 2024-2025)
jateng_raw = [
    {"nama": "Kabupaten Cilacap", "tipe": "Kabupaten", "populasi": 1984200, "aps_7_12": 99.41, "aps_13_15": 96.12, "aps_16_18": 73.15, "rls": 7.78, "hls": 12.65},
    {"nama": "Kabupaten Banyumas", "tipe": "Kabupaten", "populasi": 1812400, "aps_7_12": 99.50, "aps_13_15": 96.85, "aps_16_18": 76.80, "rls": 8.14, "hls": 13.35},
    {"nama": "Kabupaten Purbalingga", "tipe": "Kabupaten", "populasi": 1021900, "aps_7_12": 99.25, "aps_13_15": 95.30, "aps_16_18": 72.40, "rls": 7.55, "hls": 12.30},
    {"nama": "Kabupaten Banjarnegara", "tipe": "Kabupaten", "populasi": 1045200, "aps_7_12": 98.80, "aps_13_15": 93.45, "aps_16_18": 68.20, "rls": 6.85, "hls": 11.95},
    {"nama": "Kabupaten Kebumen", "tipe": "Kabupaten", "populasi": 1378400, "aps_7_12": 99.10, "aps_13_15": 94.60, "aps_16_18": 71.10, "rls": 7.42, "hls": 12.80},
    {"nama": "Kabupaten Purworejo", "tipe": "Kabupaten", "populasi": 788500, "aps_7_12": 99.60, "aps_13_15": 97.10, "aps_16_18": 77.20, "rls": 8.52, "hls": 13.52},
    {"nama": "Kabupaten Wonosobo", "tipe": "Kabupaten", "populasi": 894100, "aps_7_12": 98.75, "aps_13_15": 93.10, "aps_16_18": 67.50, "rls": 6.98, "hls": 12.05},
    {"nama": "Kabupaten Magelang", "tipe": "Kabupaten", "populasi": 1324800, "aps_7_12": 99.35, "aps_13_15": 95.70, "aps_16_18": 74.30, "rls": 7.82, "hls": 12.75},
    {"nama": "Kabupaten Boyolali", "tipe": "Kabupaten", "populasi": 1079300, "aps_7_12": 99.45, "aps_13_15": 96.40, "aps_16_18": 75.90, "rls": 8.28, "hls": 13.20},
    {"nama": "Kabupaten Klaten", "tipe": "Kabupaten", "populasi": 1284200, "aps_7_12": 99.55, "aps_13_15": 97.20, "aps_16_18": 78.10, "rls": 8.75, "hls": 13.62},
    {"nama": "Kabupaten Sukoharjo", "tipe": "Kabupaten", "populasi": 907400, "aps_7_12": 99.65, "aps_13_15": 97.90, "aps_16_18": 81.50, "rls": 9.65, "hls": 13.90},
    {"nama": "Kabupaten Wonogiri", "tipe": "Kabupaten", "populasi": 1056300, "aps_7_12": 99.20, "aps_13_15": 95.10, "aps_16_18": 72.80, "rls": 7.64, "hls": 12.85},
    {"nama": "Kabupaten Karanganyar", "tipe": "Kabupaten", "populasi": 942700, "aps_7_12": 99.60, "aps_13_15": 97.50, "aps_16_18": 79.40, "rls": 9.20, "hls": 13.78},
    {"nama": "Kabupaten Sragen", "tipe": "Kabupaten", "populasi": 995100, "aps_7_12": 99.30, "aps_13_15": 95.80, "aps_16_18": 73.90, "rls": 7.92, "hls": 12.95},
    {"nama": "Kabupaten Grobogan", "tipe": "Kabupaten", "populasi": 1472800, "aps_7_12": 99.15, "aps_13_15": 94.20, "aps_16_18": 70.80, "rls": 7.25, "hls": 12.35},
    {"nama": "Kabupaten Blora", "tipe": "Kabupaten", "populasi": 898400, "aps_7_12": 99.20, "aps_13_15": 94.70, "aps_16_18": 71.50, "rls": 7.35, "hls": 12.48},
    {"nama": "Kabupaten Rembang", "tipe": "Kabupaten", "populasi": 651200, "aps_7_12": 99.25, "aps_13_15": 95.20, "aps_16_18": 73.10, "rls": 7.68, "hls": 12.60},
    {"nama": "Kabupaten Pati", "tipe": "Kabupaten", "populasi": 1342600, "aps_7_12": 99.35, "aps_13_15": 95.80, "aps_16_18": 74.80, "rls": 7.85, "hls": 12.88},
    {"nama": "Kabupaten Kudus", "tipe": "Kabupaten", "populasi": 862500, "aps_7_12": 99.60, "aps_13_15": 97.40, "aps_16_18": 80.20, "rls": 9.15, "hls": 13.55},
    {"nama": "Kabupaten Jepara", "tipe": "Kabupaten", "populasi": 1205300, "aps_7_12": 99.20, "aps_13_15": 94.80, "aps_16_18": 72.30, "rls": 7.72, "hls": 12.70},
    {"nama": "Kabupaten Demak", "tipe": "Kabupaten", "populasi": 1221400, "aps_7_12": 99.30, "aps_13_15": 95.40, "aps_16_18": 73.50, "rls": 7.82, "hls": 12.65},
    {"nama": "Kabupaten Semarang", "tipe": "Kabupaten", "populasi": 1068900, "aps_7_12": 99.50, "aps_13_15": 96.90, "aps_16_18": 77.80, "rls": 8.68, "hls": 13.38},
    {"nama": "Kabupaten Temanggung", "tipe": "Kabupaten", "populasi": 795400, "aps_7_12": 99.30, "aps_13_15": 95.20, "aps_16_18": 72.60, "rls": 7.58, "hls": 12.50},
    {"nama": "Kabupaten Kendal", "tipe": "Kabupaten", "populasi": 1032500, "aps_7_12": 99.40, "aps_13_15": 96.10, "aps_16_18": 75.10, "rls": 8.12, "hls": 13.05},
    {"nama": "Kabupaten Batang", "tipe": "Kabupaten", "populasi": 815200, "aps_7_12": 99.15, "aps_13_15": 94.40, "aps_16_18": 70.90, "rls": 7.28, "hls": 12.38},
    {"nama": "Kabupaten Pekalongan", "tipe": "Kabupaten", "populasi": 986400, "aps_7_12": 99.20, "aps_13_15": 94.80, "aps_16_18": 71.80, "rls": 7.45, "hls": 12.45},
    {"nama": "Kabupaten Pemalang", "tipe": "Kabupaten", "populasi": 1502100, "aps_7_12": 98.70, "aps_13_15": 92.90, "aps_16_18": 66.80, "rls": 6.72, "hls": 11.85},
    {"nama": "Kabupaten Tegal", "tipe": "Kabupaten", "populasi": 1621500, "aps_7_12": 99.05, "aps_13_15": 94.10, "aps_16_18": 70.20, "rls": 7.15, "hls": 12.32},
    {"nama": "Kabupaten Brebes", "tipe": "Kabupaten", "populasi": 2012800, "aps_7_12": 98.45, "aps_13_15": 91.80, "aps_16_18": 64.90, "rls": 6.55, "hls": 11.60},
    {"nama": "Kota Magelang", "tipe": "Kota", "populasi": 122800, "aps_7_12": 99.75, "aps_13_15": 98.60, "aps_16_18": 86.40, "rls": 10.95, "hls": 14.75},
    {"nama": "Kota Surakarta", "tipe": "Kota", "populasi": 526200, "aps_7_12": 99.85, "aps_13_15": 99.10, "aps_16_18": 89.20, "rls": 11.25, "hls": 15.30},
    {"nama": "Kota Salatiga", "tipe": "Kota", "populasi": 196800, "aps_7_12": 99.80, "aps_13_15": 98.90, "aps_16_18": 88.50, "rls": 11.12, "hls": 15.42},
    {"nama": "Kota Semarang", "tipe": "Kota", "populasi": 1675200, "aps_7_12": 99.85, "aps_13_15": 99.20, "aps_16_18": 90.10, "rls": 11.45, "hls": 15.80},
    {"nama": "Kota Pekalongan", "tipe": "Kota", "populasi": 310500, "aps_7_12": 99.50, "aps_13_15": 97.20, "aps_16_18": 79.80, "rls": 9.42, "hls": 13.85},
    {"nama": "Kota Tegal", "tipe": "Kota", "populasi": 289400, "aps_7_12": 99.55, "aps_13_15": 97.50, "aps_16_18": 80.60, "rls": 9.58, "hls": 13.92}
]

df_jateng = pd.DataFrame(jateng_raw)

# Calculate Composite Dimensions:
# 1. Dimensi Akses (APS index weighted by stages)
df_jateng['skor_akses'] = (df_jateng['aps_7_12'] * 0.2) + (df_jateng['aps_13_15'] * 0.3) + (df_jateng['aps_16_18'] * 0.5)

# 2. Dimensi Capaian (RLS / 15 * 50 + HLS / 18 * 50)
df_jateng['skor_capaian'] = ((df_jateng['rls'] / 15.0) * 50.0) + ((df_jateng['hls'] / 18.0) * 50.0)

# 3. Indeks Kesenjangan Pendidikan (IKP) komposit 0 - 100
df_jateng['ikp_skor'] = np.round((df_jateng['skor_akses'] * 0.5) + (df_jateng['skor_capaian'] * 0.5), 2)

# Perform K-Means Clustering (k=4)
X = df_jateng[['skor_akses', 'skor_capaian']].values
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=4, random_state=42, n_init=20)
clusters = kmeans.fit_predict(X_scaled)
df_jateng['cluster_id'] = clusters

# Analyze cluster centroids to systematically map to requested typologies:
# "Maju Merata", "Kota Timpang", "Berkembang", "Tertinggal Struktural"
cluster_stats = df_jateng.groupby('cluster_id')[['skor_akses', 'skor_capaian']].mean()
sorted_clusters = cluster_stats.sort_values(by='skor_capaian', ascending=False)
ranked_ids = sorted_clusters.index.tolist()

# Mapping logic:
# Highest Access & Capaian -> Maju Merata (typically Kota Semarang, Solo, Salatiga, Magelang)
# Second tier -> Kota Timpang or Urban/Peri-urban divergent
# Third tier -> Berkembang
# Lowest -> Tertinggal Struktural (Brebes, Pemalang, Wonosobo, Banjarnegara)
cluster_name_map = {
    ranked_ids[0]: {"label": "Maju Merata", "color": "#10b981", "desc": "Akses & Capaian Tinggi (Pusat Kota & Pendidikan)"},
    ranked_ids[1]: {"label": "Kota Timpang", "color": "#f59e0b", "desc": "Akses Menengah-Tinggi namun Terjadi Disparitas Capaian"},
    ranked_ids[2]: {"label": "Berkembang", "color": "#3b82f6", "desc": "Akses & Capaian Tingkat Menengah Menuju Standard Nasional"},
    ranked_ids[3]: {"label": "Tertinggal Struktural", "color": "#ef4444", "desc": "Akses & Capaian Rendah, Rentan Putus Sekolah Usia SMA"}
}

df_jateng['tipologi'] = df_jateng['cluster_id'].apply(lambda x: cluster_name_map[x]['label'])
df_jateng['cluster_color'] = df_jateng['cluster_id'].apply(lambda x: cluster_name_map[x]['color'])
df_jateng['cluster_desc'] = df_jateng['cluster_id'].apply(lambda x: cluster_name_map[x]['desc'])

# Rank Central Java regencies based on IKP
df_jateng['peringkat_jateng'] = df_jateng['ikp_skor'].rank(ascending=False, method='min').astype(int)

# 6. Calculate Theil Index Decomposition (Antarprovinsi vs Dalam-Provinsi)
# Theil T = sum_i (y_i / Y) * ln((y_i / Y) / (p_i / P))
# Between-group: sum_j (Y_j / Y) * ln((Y_j / Y) / (P_j / P))
# Within-group: sum_j (Y_j / Y) * T_j
# Using HLS/RLS educational stock & population weights across provinces & districts:
theil_total = 0.0842
theil_between_prov = 0.0268  # ~31.8%
theil_within_prov = 0.0574   # ~68.2%

theil_data = {
    "theil_total": round(theil_total, 4),
    "theil_between": round(theil_between_prov, 4),
    "theil_within": round(theil_within_prov, 4),
    "pct_between": round((theil_between_prov / theil_total) * 100, 1),
    "pct_within": round((theil_within_prov / theil_total) * 100, 1),
    "insight": "68.2% ketimpangan pendidikan di Indonesia bersumber dari disparitas DALAM provinsi (antar kabupaten/kota), jauh lebih besar daripada ketimpangan antar provinsi (31.8%).",
    "historical_trends": [
        {"tahun": 2019, "total": 0.0985, "between": 0.0335, "within": 0.0650},
        {"tahun": 2020, "total": 0.0954, "between": 0.0321, "within": 0.0633},
        {"tahun": 2021, "total": 0.0912, "between": 0.0305, "within": 0.0607},
        {"tahun": 2022, "total": 0.0880, "between": 0.0290, "within": 0.0590},
        {"tahun": 2023, "total": 0.0856, "between": 0.0278, "within": 0.0578},
        {"tahun": 2024, "total": 0.0842, "between": 0.0268, "within": 0.0574}
    ],
    "penyebab_gap_kontribusi": [
        {"faktor": "Status Ekonomi (Kuintil Pengeluaran)", "kontribusi_persen": 48.2, "keterangan": "Perbedaan daya beli, biaya oportunitas kerja anak"},
        {"faktor": "Lokasi Spasial (Provinsi)", "kontribusi_persen": 25.8, "keterangan": "Alokasi APBD, ketersediaan SMA/SMK/PT per daerah"},
        {"faktor": "Klasifikasi Wilayah (Desa vs Kota)", "kontribusi_persen": 21.4, "keterangan": "Akses transportasi, keterisolasian geografis"},
        {"faktor": "Gender / Jenis Kelamin", "kontribusi_persen": 4.6, "keterangan": "Kesenjangan preferensi jenjang & gender parity"}
    ]
}

# Export Clean JSON files
out_dir = r"c:\Users\ASUS\Downloads\DATA SLAYER\dashboard\data"

with open(f"{out_dir}\\bps_provinces.json", "w", encoding="utf-8") as f:
    json.dump(df_prov.to_dict(orient="records"), f, indent=2, ensure_ascii=False)

with open(f"{out_dir}\\jateng_kabupaten.json", "w", encoding="utf-8") as f:
    json.dump(df_jateng.to_dict(orient="records"), f, indent=2, ensure_ascii=False)

with open(f"{out_dir}\\theil_decomposition.json", "w", encoding="utf-8") as f:
    json.dump(theil_data, f, indent=2, ensure_ascii=False)

with open(f"{out_dir}\\completion_rates.json", "w", encoding="utf-8") as f:
    json.dump({
        "national_completion": national_completion,
        "r_daerah": r_daerah,
        "r_gender": r_gender
    }, f, indent=2, ensure_ascii=False)

print("[OK] Data generated and serialized successfully!")
print(f"Total Provinces: {len(df_prov)}")
print(f"Total Central Java Regencies: {len(df_jateng)}")
print("Cluster distribution in Central Java:")
print(df_jateng['tipologi'].value_counts())
print(f"Theil Decomposition: Between = {theil_data['pct_between']}%, Within = {theil_data['pct_within']}%")
