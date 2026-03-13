// 1. Fetch KPI Dashboard from Laravel Backend & Tampilkan Tanggal
const dateElement = document.getElementById('current-date');
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.innerHTML = `📅 Hari ini: ${new Date().toLocaleDateString('id-ID', options)}`;

document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Panggil endpoint API Laravel B2B Dashboard
        const response = await fetch('http://localhost:8080/api/dashboard-summary');
        
        if (response.ok) {
            const data = await response.json();
            
            // Render KPI Data dari Laravel
            const kpiItems = document.querySelectorAll('.kpi-item h3');
            if (kpiItems.length >= 3) {
                kpiItems[0].innerText = data.kpi.potensi_kenaikan_harga;
                kpiItems[1].innerText = data.kpi.penghematan_logistik;
                
                // Gunakan ID unik untuk Update
                const kontrakCountEl = document.getElementById('kontrak-count');
                if (kontrakCountEl) {
                    kontrakCountEl.innerText = data.kpi.kontrak_pasokan_aktif;
                    // Update variable global agar simulasi pre-order tetap jalan nilainya
                    window.totalKontrakGlobal = data.kpi.kontrak_pasokan_aktif; 
                }
            }
        }
    } catch (error) {
        console.error("Gagal mengambil data B2B Portal dari Laravel Backend", error);
        window.totalKontrakGlobal = 4; // fallback
    }
});

// 2. Logika Navigasi Sidebar (Perpindahan View)
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', function () {
        // Hapus class active dari semua menu
        navItems.forEach(nav => nav.classList.remove('active'));
        // Tambahkan class active ke menu yang diklik
        this.classList.add('active');

        // Sembunyikan semua section
        views.forEach(view => view.classList.remove('active'));

        // Tampilkan section yang sesuai target
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// 3. Konfigurasi Chart.js
const ctx = document.getElementById('predictionChart').getContext('2d');

// Data Mockup
const data10Hari = {
    labels: ['1 Mar', '2 Mar', '3 Mar', '4 Mar', 'Hari Ini', '6 Mar', '7 Mar', '8 Mar', '9 Mar', '10 Mar'],
    aktual: [40000, 41500, 41000, 43000, 44500, null, null, null, null, null],
    prediksi: [null, null, null, null, 44500, 47000, 49500, 52000, 53000, 55000]
};

const data5Hari = {
    labels: ['1 Mar', '2 Mar', '3 Mar', '4 Mar', 'Hari Ini', '6 Mar', '7 Mar', '8 Mar'],
    aktual: [40000, 41500, 41000, 43000, 44500, null, null, null],
    prediksi: [null, null, null, null, 44500, 47000, 49500, 52000]
};

let predictionChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: data10Hari.labels,
        datasets: [
            {
                label: 'Harga Aktual (Rp)',
                data: data10Hari.aktual,
                borderColor: '#1e293b',
                backgroundColor: 'rgba(30, 41, 59, 0.1)',
                borderWidth: 2, fill: true, tension: 0.3, pointBackgroundColor: '#1e293b'
            },
            {
                label: 'Prediksi Naik (Algoritma)',
                data: data10Hari.prediksi,
                borderColor: '#ef4444', borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.3, pointBackgroundColor: '#ef4444'
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                    }
                }
            }
        }
    }
});

// Logika Dropdown Filter Chart
document.getElementById('time-filter').addEventListener('change', function (e) {
    const val = e.target.value;
    if (val === '5') {
        predictionChart.data.labels = data5Hari.labels;
        predictionChart.data.datasets[0].data = data5Hari.aktual;
        predictionChart.data.datasets[1].data = data5Hari.prediksi;
    } else {
        predictionChart.data.labels = data10Hari.labels;
        predictionChart.data.datasets[0].data = data10Hari.aktual;
        predictionChart.data.datasets[1].data = data10Hari.prediksi;
    }
    predictionChart.update();
});

// 4. Logika Tombol Pre-Order (Simulasi Transaksi)
const btnPreorders = document.querySelectorAll('.btn-preorder');
let totalKontrak = 4; // Berdasarkan angka di KPI

btnPreorders.forEach(btn => {
    btn.addEventListener('click', function () {
        const petani = this.getAttribute('data-petani');
        const komoditas = this.getAttribute('data-komoditas');

        Swal.fire({
            title: 'Konfirmasi Kontrak',
            text: `Apakah Anda yakin ingin mengunci harga ${komoditas} dari ${petani} sesuai rekomendasi sistem?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Buat Kontrak!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Simulasi loading
                Swal.fire({
                    title: 'Memproses Smart-Contract...',
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => { Swal.showLoading(); }
                }).then(() => {
                    // Sukses
                    Swal.fire('Berhasil!', `Kontrak pasokan dengan ${petani} telah aktif.`, 'success');

                    // Ubah tombol jadi 'Terkunci'
                    this.innerHTML = '<i class="fa-solid fa-check"></i> Terkunci';
                    this.disabled = true;

                    // Update angka di KPI Kontrak Pasokan
                    totalKontrak++;
                    document.getElementById('kontrak-count').innerText = totalKontrak;

                    // Animasikan KPI Card agar terlihat perubahannya
                    const kpiCard = document.getElementById('kontrak-count').closest('.kpi-card');
                    kpiCard.style.transform = 'scale(1.05)';
                    kpiCard.style.transition = '0.3s';
                    setTimeout(() => { kpiCard.style.transform = 'scale(1)'; }, 300);
                });
            }
        });
    });
});

// 5. Logika Profil
document.getElementById('user-profile-btn').addEventListener('click', function (e) {
    if (e.target.classList.contains('fa-bell')) {
        Swal.fire('Notifikasi', 'Tidak ada notifikasi baru hari ini.', 'info');
        return;
    }
    document.querySelector('.nav-item[data-target="profil-view"]').click();
});

document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const namaBaru = document.getElementById('profil-nama').value;

    Swal.fire({
        title: 'Menyimpan...',
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false
    }).then(() => {
        document.getElementById('display-nama-umkm').innerText = namaBaru;
        Swal.fire({
            icon: 'success',
            title: 'Tersimpan!',
            text: 'Profil UMKM berhasil diperbarui.',
            confirmButtonColor: '#10b981'
        });
    });
});

// 6. Konfigurasi Analitik Lanjutan (Historical Chart)
const histCtx = document.getElementById('historicalChart').getContext('2d');

const labelsHist = Array.from({ length: 30 }, (_, i) => `Hari-${i + 1}`);
const dataAktualHist = Array.from({ length: 30 }, () => Math.floor(Math.random() * (45000 - 35000) + 35000));
const dataPrediksiHist = dataAktualHist.map(val => val + (Math.random() * 3000 - 1500)); // Variasi prediksi terhadap aktual

let historicalChart = new Chart(histCtx, {
    type: 'line',
    data: {
        labels: labelsHist,
        datasets: [
            {
                label: 'Harga Aktual',
                data: dataAktualHist,
                borderColor: '#1e293b',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Prediksi Model',
                data: dataPrediksiHist,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ': ' + new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                display: false
            }
        }
    }
});

// Fungsi untuk Re-train model (Simulasi Fetch API)
async function retrainModel() {
    const algo = document.getElementById('algo-select').value;
    let algoName = '';
    if (algo === 'holt-winters') algoName = 'Holt-Winters';
    if (algo === 'arima') algoName = 'ARIMA';
    if (algo === 'lstm') algoName = 'LSTM';

    // Munculkan Loading State
    Swal.fire({
        title: `Menyinkronkan dengan Python ML Engine...`,
        html: `Memproses data historis menggunakan algoritma ${algoName}...`,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        // Melakukan Fetch ke backend Python (FastAPI harus running di port 8000)
        const response = await fetch('http://127.0.0.1:8000/api/predict?commodity=cabai&days=30');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update Chart berdasarkan hasil dari Python
        historicalChart.data.labels = data.historical_data.labels;
        historicalChart.data.datasets[0].data = data.historical_data.actual_prices;
        historicalChart.data.datasets[1].data = data.historical_data.fitted_prices;
        historicalChart.update();

        // Tampilkan Sukses dgn Akurasi Aktual
        Swal.fire('Berhasil!', `Model ${data.algorithm} telah dilatih ulang via API. Akurasi saat ini: ${data.mape_accuracy}%`, 'success');
        
    } catch (error) {
        console.error("Gagal terhubung ke ML Engine:", error);
        // Fallback Simulasi jika Python Engine belum dinyalakan oleh user
        const newDataPred = dataAktualHist.map(val => val + (Math.random() * 2000 - 1000));
        historicalChart.data.datasets[1].data = newDataPred;
        historicalChart.update();

        Swal.fire('Berhasil (Mode Offline/Simulasi)!', `Gagal menghubungi http://127.0.0.1:8000. Memastikan Anda telah menyalakan Uvicorn FastAPI. Model simulasi digunakan.`, 'warning');
    }
}

// 7. Konfigurasi Map (Leaflet & OpenStreetMap)
document.addEventListener("DOMContentLoaded", function () {
    // Inisialisasi peta Leaflet
    const map = L.map('map').setView([-7.5921, 112.7264], 7); // Koordinat tengah (contoh: area Jawa Timur)

    // Gunakan OpenStreetMap tile (Gratis & Open Source)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Data Dummy Hotspots Komoditas
    const hotspots = [
        { nama: "Poktan Makmur (Cabai)", lat: -7.2504, lng: 112.6326, color: "#ef4444", jenis: "cabai" },
        { nama: "Tani Jaya Abadi (Bawang)", lat: -7.5469, lng: 112.2265, color: "#8b5cf6", jenis: "bawang" },
        { nama: "KUD Mandiri (Beras)", lat: -7.6046, lng: 111.4558, color: "#f59e0b", jenis: "beras" },
        { nama: "Sentra Cabai Kediri", lat: -7.8228, lng: 112.0119, color: "#ef4444", jenis: "cabai" },
        { nama: "Sentra Bawang Nganjuk", lat: -7.6053, lng: 111.9035, color: "#8b5cf6", jenis: "bawang" }
    ];

    // Simpan referensi marker untuk filter
    const currentMarkers = [];

    function renderMarkers(filterJenis) {
        // Hapus marker yang ada
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers.length = 0;

        hotspots.forEach(spot => {
            if (filterJenis === 'all' || spot.jenis === filterJenis) {
                // Buat custom marker dgn HTML DOM Leaflet DivIcon
                const customIcon = L.divIcon({
                    className: 'custom-leaflet-marker',
                    html: `<div style="background-color: ${spot.color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                // Format konten popup
                const popupContent = `
                    <strong style="font-family: 'Inter', sans-serif; font-size: 14px;">${spot.nama}</strong><br>
                    <span style="font-size: 12px; color: #64748b;">Supply Hotspot Aktif</span>
                `;

                // Tambahkan marker ke peta
                const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
                    .bindPopup(popupContent)
                    .addTo(map);

                currentMarkers.push(marker);
            }
        });
    }

    // Render awal
    renderMarkers('all');

    // Event listener untuk Dropdown Filter Map
    document.getElementById('map-filter').addEventListener('change', function (e) {
        renderMarkers(e.target.value);
    });

    // Paksa map untuk meresize / validasi ukuran saat tab "Pasar Komoditas" diklik agar dirender dengan benar
    document.querySelector('.nav-item[data-target="pasar-view"]').addEventListener('click', function () {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    });
});

// 8. Fitur Berita Agrikultur
document.addEventListener("DOMContentLoaded", function() {
    const newsContainer = document.getElementById('news-container');
    const newsFilter = document.getElementById('news-filter');

    // Data dummy berita (Bisa diganti fetch API nanti)
    const newsData = [
        {
            title: "Pemerintah Siapkan Subsidi Pupuk Spesial Bawang",
            date: "12 Maret 2026",
            kategori: "Kebijakan Pemerintah",
            image: "https://images.unsplash.com/photo-1599813292455-827d057a6e11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            summary: "Menghadapi lonjakan harga, kementerian memastikan alokasi pupuk bersubsidi dialihkan ke sentra bawang merah.",
            url: "https://www.cnbcindonesia.com/search?query=subsidi+pupuk+bawang"
        },
        {
            title: "Prediksi BMKG: Kemarau Panjang Landa Jawa Timur",
            date: "10 Maret 2026",
            kategori: "Terbaru",
            image: "https://images.unsplash.com/photo-1584852899451-9dc5514f7dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            summary: "Petani padi diimbau waspada dan memulai irigasi sumur pompa lebih awal karena fenomena El Nino ringan.",
            url: "https://www.cnbcindonesia.com/search?query=kemarau+panjang+petani"
        },
        {
            title: "Teknik Irigasi Tetes Tingkatkan Hasil Cabai 30%",
            date: "08 Maret 2026",
            kategori: "Populer",
            image: "https://images.unsplash.com/photo-1592982537447-6f2acc6386bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            summary: "Kelompok Tani Makmur berhasil menghemat air hingga 50% dengan teknik Drip Irrigation terbaru.",
            url: "https://www.cnbcindonesia.com/search?query=irigasi+tetes+cabai"
        },
        {
            title: "Harga Gabah Kering Giling Naik Rp500/Kg",
            date: "05 Maret 2026",
            kategori: "Terbaru",
            image: "https://images.unsplash.com/photo-1535242208474-9a2793260dd4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            summary: "Permintaan beras premium di perkotaan mendongkrak daya beli tengkulak di tingkat petani secara signifikan.",
            url: "https://www.cnbcindonesia.com/search?query=harga+gabah+naik"
        }
    ];

    function renderNews(filterValue) {
        if (!newsContainer) return;
        newsContainer.innerHTML = ''; // Clear existing
        
        const filteredData = filterValue === 'terbaru' 
            ? newsData 
            : newsData.filter(news => news.kategori.toLowerCase().includes(filterValue.toLowerCase()));

        filteredData.forEach(news => {
            const cardHTML = `
                <div class="card" onclick="window.open('${news.url}', '_blank')" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                    <img src="${news.image}" alt="${news.title}" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 3px solid var(--primary-light);">
                    <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; color: var(--primary); font-weight: 600;">${news.kategori}</span>
                            <span style="font-size: 11px; color: var(--text-light);"><i class="fa-regular fa-clock"></i> ${news.date}</span>
                        </div>
                        <h3 style="font-size: 16px; margin-bottom: 8px; color: var(--text-dark); line-height: 1.4;">${news.title}</h3>
                        <p style="font-size: 13px; color: var(--text-light); line-height: 1.5; margin-bottom: 15px; flex: 1;">${news.summary}</p>
                        <button class="btn-action" style="width: 100%; font-size: 13px; padding: 8px; background: white; color: var(--primary); border: 1px solid var(--primary);">Baca Selengkapnya <i class="fa-solid fa-arrow-up-right-from-square" style="margin-left:5px; font-size: 11px;"></i></button>
                    </div>
                </div>
            `;
            newsContainer.innerHTML += cardHTML;
        });

        if (filteredData.length === 0) {
            newsContainer.innerHTML = '<p style="color: var(--text-light); padding: 20px;">Tidak ada berita untuk filter ini.</p>';
        }
    }

    // Initial render
    renderNews('terbaru');

    // Filter event listener
    if (newsFilter) {
        newsFilter.addEventListener('change', (e) => {
            renderNews(e.target.value);
        });
    }
});