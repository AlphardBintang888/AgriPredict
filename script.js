document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIKA MENU MOBILE (HAMBURGER)
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.getElementById('sidebar');

    // Buka menu saat icon garis tiga diklik
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    // Tutup menu saat icon 'X' diklik
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // ==========================================
    // 2. LOGIKA PINDAH-PINDAH TAB (ROUTING)
    // ==========================================
    const navItems = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah scroll ke atas

            // Ambil target tab dari atribut data-target
            const targetId = item.getAttribute('data-target');

            // Hapus status 'active' dari semua menu sidebar
            navItems.forEach(nav => nav.classList.remove('active'));
            // Tambahkan status 'active' ke menu yang diklik
            item.classList.add('active');

            // Sembunyikan semua konten utama
            views.forEach(view => view.classList.remove('active'));
            // Tampilkan konten yang sesuai dengan ID
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
            }

            // (Opsional) Tutup otomatis sidebar di HP setelah pindah menu
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Simulasi inisialisasi Chart.js (Agar canvas tidak kosong jika library terload)
    initMockCharts();
});

// ==========================================
// 3. FUNGSI-FUNGSI PENDUKUNG (Mock Functions)
// ==========================================

// Fungsi saat Select Role diubah (Petani/Pemerintah)
function switchRole() {
    const role = document.getElementById('roleSelect').value;
    const govOnlyElements = document.querySelectorAll('.gov-only');
    const farmerOnlyElements = document.querySelectorAll('.farmer-only');

    if (role === 'pemerintah') {
        govOnlyElements.forEach(el => el.style.display = 'block');
        farmerOnlyElements.forEach(el => el.style.display = 'none');
        alert("Beralih ke Mode Pemerintah: Akses penuh ke Market Trends.");
    } else {
        govOnlyElements.forEach(el => el.style.display = 'none');
        farmerOnlyElements.forEach(el => el.style.display = 'flex');
        alert("Beralih ke Mode Petani.");
    }
}

// Fungsi interaksi klik KPI
function showKpiDetail(type) {
    console.log(`Menampilkan detail untuk KPI: ${type}`);
}

// Fungsi interaksi ubah komoditas di chart
function updateChart() {
    const commodity = document.getElementById('commoditySelect').value;
    console.log(`Mengambil data prediksi untuk: ${commodity}`);
}

// Fungsi simulasi Chart kosong agar UI rapi
function initMockCharts() {
    const chartIds = ['predictionChart', 'historicalTrendChart', 'correlationChart'];
    chartIds.forEach(id => {
        const ctx = document.getElementById(id);
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                        label: 'Simulasi Data',
                        data: [12, 19, 3, 5, 2],
                        borderColor: '#0D8A5E',
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    });
}

function updateMarketCharts() {
    console.log("Memperbarui grafik pasar...");
}

function generatePlantingRecommendation() {
    alert("Memanggil API Cuaca & Rekomendasi Tanam terbaru...");
}

function filterLogistics() {
    const keyword = document.getElementById('logisticsSearch').value;
    console.log(`Mencari resi: ${keyword}`);
}

function toggleTheme() {
    const isDark = document.getElementById('themeToggle').checked;
    if (isDark) {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
        // Implementasi dark mode lengkap biasanya pakai class .dark-theme di <body>
    } else {
        document.body.style.backgroundColor = '#f4f7f6';
        document.body.style.color = '#333333';
    }
}

function saveSettings() {
    alert("Perubahan profil berhasil disimpan!");
}