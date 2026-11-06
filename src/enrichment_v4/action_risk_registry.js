const fs = require('fs');
const path = require('path');

const ACTION_RISK_INVENTORY = [
  // --- 1. SAFE_READ_ONLY ---
  {
    action_id: "ACT-RISK-001",
    action_name: "Navigasi Halaman (GET Request)",
    classification: "SAFE_READ_ONLY",
    description: "Kunjungan halaman via metode HTTP GET tanpa query string mutatif.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW"
  },
  {
    action_id: "ACT-RISK-002",
    action_name: "Input Kata Kunci Pencarian (Livewire Component Search)",
    classification: "SAFE_READ_ONLY",
    description: "Pengiriman pembaruan properti komponen Livewire (search) via POST /livewire/update tanpa method call mutatif.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW_WITH_METHOD_INSPECTION"
  },
  {
    action_id: "ACT-RISK-003",
    action_name: "Filter Brand Katalog (Query param & Livewire)",
    classification: "SAFE_READ_ONLY",
    description: "Memfilter tampilan produk berdasarkan merek resmi.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW"
  },
  {
    action_id: "ACT-RISK-004",
    action_name: "Paginasi Tabel (PREV / NEXT Read-Only)",
    classification: "SAFE_READ_ONLY",
    description: "Membuka halaman berikutnya atau sebelumnya pada data tabel.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW_WITH_METHOD_INSPECTION"
  },
  {
    action_id: "ACT-RISK-005",
    action_name: "Dismiss Tour Modal (Lewati / Tutup Panduan)",
    classification: "SAFE_READ_ONLY",
    description: "Menutup modal panduan interaktif driver.js tanpa efek samping server-side.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW"
  },
  {
    action_id: "ACT-RISK-006",
    action_name: "Membaca Detail Brosur (View ID 1103)",
    classification: "SAFE_READ_ONLY",
    description: "Melihat rincian daftar produk dalam brosur tanpa mengubah isi brosur.",
    is_allowed_in_production: true,
    guardrail_policy: "ALLOW"
  },

  // --- 2. MUTATIVE (STRICTLY FORBIDDEN IN PRODUCTION) ---
  {
    action_id: "ACT-RISK-101",
    action_name: "Simpan Perubahan Harga Massal (Edit Harga Submit)",
    classification: "MUTATIVE",
    description: "Menyimpan pembaruan nominal harga jual master produk ke database live.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["save", "store", "update", "updateHarga", "simpan"]
  },
  {
    action_id: "ACT-RISK-102",
    action_name: "Terapkan Diskon ke Toko (Apply Diskon)",
    classification: "MUTATIVE",
    description: "Mengaktifkan potongan harga pada produk di sistem kasir dan penjualan live.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["apply", "applyDiskon", "activate"]
  },
  {
    action_id: "ACT-RISK-103",
    action_name: "Arsipkan Program Diskon (Arsip Diskon)",
    classification: "MUTATIVE",
    description: "Menonaktifkan program diskon berjalan pada database produksi.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["archive", "archiveDiskon", "deactivate"]
  },
  {
    action_id: "ACT-RISK-104",
    action_name: "Tambah Program Diskon Baru",
    classification: "MUTATIVE",
    description: "Menyimpan entri program diskon baru ke tabel promosi.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["create", "store", "tambahDiskon"]
  },
  {
    action_id: "ACT-RISK-105",
    action_name: "Hapus Program Diskon",
    classification: "MUTATIVE",
    description: "Menghapus record diskon dari sistem.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["delete", "destroy", "hapusDiskon"]
  },
  {
    action_id: "ACT-RISK-106",
    action_name: "Tambah / Unggah Brosur Digital",
    classification: "MUTATIVE",
    description: "Mengunggah file PDF/gambar brosur dan menyimpan metadata brosur baru.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["upload", "storeBrosur", "createBrosur"]
  },
  {
    action_id: "ACT-RISK-107",
    action_name: "Hapus Brosur Digital",
    classification: "MUTATIVE",
    description: "Menghapus brosur dari sistem katalog.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["deleteBrosur", "destroyBrosur"]
  },
  {
    action_id: "ACT-RISK-108",
    action_name: "Eksekusi Duplikasi Produk (Duplicate)",
    classification: "MUTATIVE",
    description: "Menggandakan data record produk di database master.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["duplicate", "duplikat", "clone"]
  },
  {
    action_id: "ACT-RISK-109",
    action_name: "Tambah Akun Pengguna / Karyawan",
    classification: "MUTATIVE",
    description: "Menambahkan user baru dan memberikan hak akses.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["createUser", "storeUser", "tambahUser"]
  },
  {
    action_id: "ACT-RISK-110",
    action_name: "Ubah Data Akun Karyawan / Role",
    classification: "MUTATIVE",
    description: "Memodifikasi identitas, password, atau role pengguna.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["editUser", "updateUser"]
  },
  {
    action_id: "ACT-RISK-111",
    action_name: "Hapus Akun Karyawan",
    classification: "MUTATIVE",
    description: "Menghapus user dari sistem.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["deleteUser", "destroyUser"]
  },
  {
    action_id: "ACT-RISK-112",
    action_name: "Sinkronisasi User (Sync Users)",
    classification: "MUTATIVE",
    description: "Memicu sinkronisasi data pengguna dari sistem eksternal HRIS.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["sync", "syncUsers", "sinkronisasiUser"]
  },
  {
    action_id: "ACT-RISK-113",
    action_name: "Sinkronisasi Unit Organisasi (Sync Org Units)",
    classification: "MUTATIVE",
    description: "Memicu sinkronisasi struktur organisasi perusahaan.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["syncOrgUnits", "syncDivisions", "syncDepartments"]
  },
  {
    action_id: "ACT-RISK-114",
    action_name: "Hitung Ulang Harga (Recalculate Prices)",
    classification: "MUTATIVE",
    description: "Mengeksekusi perhitungan ulang formula harga massal.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["recalculate", "hitungUlang"]
  },
  {
    action_id: "ACT-RISK-115",
    action_name: "Aksi Massal Tabel (Bulk Action Execute)",
    classification: "MUTATIVE",
    description: "Menjalankan update massal pada baris tabel yang dicentang.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["bulkAction", "bulkSubmit", "bulkDelete"]
  },
  {
    action_id: "ACT-RISK-116",
    action_name: "Reset Konfigurasi / Data Toko",
    classification: "MUTATIVE",
    description: "Mengembalikan data atau konfigurasi toko ke keadaan semula.",
    is_allowed_in_production: false,
    guardrail_policy: "STRICT_BLOCK",
    method_patterns: ["reset", "restoreDefaults"]
  }
];

function generateActionRiskRegistry(outputPath) {
  const payload = {
    schema_version: "4.0",
    policy: "DENY_BY_DEFAULT",
    generated_at_utc: new Date().toISOString(),
    total_registered_actions: ACTION_RISK_INVENTORY.length,
    safe_read_only_count: ACTION_RISK_INVENTORY.filter(a => a.classification === 'SAFE_READ_ONLY').length,
    mutative_blocked_count: ACTION_RISK_INVENTORY.filter(a => a.classification === 'MUTATIVE').length,
    actions: ACTION_RISK_INVENTORY
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[ActionRiskRegistry V4] action_risk_registry.json berhasil dibuat (${payload.total_registered_actions} aksi terdaftar).`);
  return payload;
}

module.exports = { ACTION_RISK_INVENTORY, generateActionRiskRegistry };

