# MATRIKS SUMBER KEBENARAN BERLAPIS (SOURCE OF TRUTH V3)
> **Klasifikasi Fakta: Bukti Nyata vs Batasan Keamanan**

- **Dashboard:** `OBSERVED_UI` (Elemen tersembunyi telah diisolasi).
- **Cari Harga:** `TESTED_READ_ONLY` (Didukung bukti 2-pass behavioral assertion).
- **Duplikat Harga:** `TESTED_READ_ONLY` (Didukung bukti kontrol paginasi PREV/NEXT).
- **Edit Harga:** `OBSERVED_UI` (Form terbuka; mutasi simpan berstatus `BLOCKED_PRODUCTION_SAFETY`).
- **Diskon & Brosur:** `OBSERVED_UI` (Daftar terbukti; submit mutasi berstatus `BLOCKED_PRODUCTION_SAFETY`).
- **Role Pengguna:** `ROLE_UNVERIFIED` (Akun `NANA` diverifikasi di UI; role lain `UNKNOWN / NOT_VERIFIED`).
