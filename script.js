/**
 * AgriPredict Logic
 * Kombinasi simulasi backend Laravel & Python FastAPI ke murni Vanilla JS.
 */

// 1. Mock Data dari Laravel (Dashboard Summary)
const fetchLaravelData = () => {
    return {
        status: 'success',
        kpi: {
            potensi_kenaikan_harga: '12.5%',
            penghematan_logistik: 'Rp 2.4JT',
            kontrak_pasokan_aktif: 4
        },
        rekomendasi_smart_matching: [
            { petani: 'Poktan Makmur Jaya', lokasi: 'Kediri, Jatim', komoditas: 'Cabai Rawit', volume: '500 kg', harga_estimasi: 'Rp 42.000/kg', alasan: 'Jarak Terdekat (15km)', status: 'Cocok 98%' },
            { petani: 'Tani Makmur', lokasi: 'Nganjuk, Jatim', komoditas: 'Bawang Merah', volume: '1.2 Ton', harga_estimasi: 'Rp 28.500/kg', alasan: 'Volume Sesuai Target', status: 'Cocok 95%' },
            { petani: 'KUD Subur', lokasi: 'Demak, Jateng', komoditas: 'Bawang Merah', volume: '800 kg', harga_estimasi: 'Rp 29.000/kg', alasan: 'Harga Terbaik', status: 'Cocok 88%' }
        ]
    };
};

// 2. Mock Algoritma dari FastAPI (Holt-Winters Price Prediction)
const generateFastAPIData = (commodity, days = 10) => {
    let base_price = 40000;
    if (commodity === 'bawang') base_price = 25000;
    if (commodity === 'beras') base_price = 15000;

    // Helper: random number between mix/max
    const rand = (min, max) => Math.random() * (max - min) + min;

    // Histori (30 hari)
    const labels_hist = Array.from({ length: 30 }, (_, i) => `Hari-${i + 1}`);
    const aktual_hist = Array.from({ length: 30 }, () => Math.floor(base_price + rand(-2000, 2000)));
    const prediksi_hist = aktual_hist.map(aktual => Math.floor(aktual + rand(-1000, 1000)));

    // Future
    const future_labels = Array.from({ length: days }, (_, i) => `+${i + 1} Hari`);
    let current_trend = aktual_hist[aktual_hist.length - 1];
    const future_predict = [];

    for (let i = 0; i < days; i++) {
        current_trend += rand(200, 800); // Trend naik pelan
        future_predict.push(Math.floor(current_trend));
    }

    return {
        status: "success",
        commodity: commodity,
        mape_accuracy: 94.8,
        historical_data: {
            labels: labels_hist,
            actual_prices: aktual_hist,
            fitted_prices: prediksi_hist
        },
        future_prediction: {
            labels: future_labels,
            predicted_prices: future_predict
        }
    };
};

/* --- LOGIC PER FITUR --- */

// Global Market Chart Instances
let historicalChart = null;
let correlationChart = null;

// Fitur: Market Trends (Gov Focus)
function initMarketTrends() {
    updateMarketCharts();
    loadRegionalStatus();
    loadInflationWatchlist();
}

// 1. Regional Supply Heatmap
const regionalSupplyData = [
    { region: 'Jawa Timur', commodity: 'Cabai Rawit', status: 'Surplus', stock: '+1.500 Ton', icon: 'bx-up-arrow-circle', color: 'var(--primary-color)' },
    { region: 'DKI Jakarta', commodity: 'Cabai Rawit', status: 'Defisit', stock: '-850 Ton', icon: 'bx-down-arrow-circle', color: 'var(--danger-color)' },
    { region: 'Jawa Barat', commodity: 'Bawang Merah', status: 'Aman', stock: '+200 Ton', icon: 'bx-check-circle', color: 'var(--accent-color)' },
    { region: 'Sumatera Utara', commodity: 'Bawang Merah', status: 'Defisit', stock: '-420 Ton', icon: 'bx-down-arrow-circle', color: 'var(--danger-color)' }
];

function loadRegionalStatus() {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    grid.innerHTML = '';

    regionalSupplyData.forEach(data => {
        const card = document.createElement('div');
        card.className = 'region-card';
        card.style.borderLeftColor = data.color;
        
        card.innerHTML = `
            <div class="region-header">
                <span>${data.region}</span>
                <i class='bx ${data.icon}' style="color: ${data.color}; font-size: 1.2rem;"></i>
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${data.commodity}</div>
            <div class="region-stock" style="color:${data.color};">${data.stock}</div>
            <div style="font-size:0.75rem; background-color:var(--bg-dark); padding:0.25rem 0.5rem; border-radius:4px; max-width:fit-content; margin-top:0.25rem;">Status: <strong>${data.status}</strong></div>
        `;
        grid.appendChild(card);
    });
}

// 2. Inflation Watchlist
const inflationWatchlistData = [
    { commodity: 'Cabai Rawit Merah', avgPrice: 'Rp 65.000', het: 'Rp 40.000', deviation: '+62.5%', status: 'Bahaya Inflasi', badge: 'status-danger' },
    { commodity: 'Beras Premium', avgPrice: 'Rp 16.500', het: 'Rp 14.900', deviation: '+10.7%', status: 'Waspada', badge: 'status-warning' },
    { commodity: 'Bawang Merah', avgPrice: 'Rp 32.000', het: 'Rp 35.000', deviation: '-8.5%', status: 'Terkendali', badge: 'status-high' },
    { commodity: 'Telur Ayam Ras', avgPrice: 'Rp 28.500', het: 'Rp 27.000', deviation: '+5.5%', status: 'Aman', badge: 'status-medium' }
];

function loadInflationWatchlist() {
    const tbody = document.getElementById('watchlistTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    inflationWatchlistData.forEach(row => {
        let actionBtn = row.badge === 'status-danger' 
            ? `<button class="btn-primary btn-sm" style="background-color: var(--danger-color);">Gelar Operasi Pasar</button>` 
            : `<button class="btn-primary btn-sm" style="background-color: var(--bg-dark); color: var(--text-main); border:1px solid var(--border-color);">Patau Rutin</button>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.commodity}</strong></td>
            <td>${row.avgPrice}</td>
            <td>${row.het}</td>
            <td style="color: ${row.deviation.startsWith('+') ? 'var(--danger-color)' : 'var(--primary-color)'}; font-weight:600;">${row.deviation}</td>
            <td><span class="status-badge ${row.badge}">${row.status}</span></td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateMarketCharts() {
    const filter = document.getElementById('trendTimeFilter') ? document.getElementById('trendTimeFilter').value : '1M';
    
    // 1. Historical Trend (Line Chart)
    const ctxHist = document.getElementById('historicalTrendChart').getContext('2d');
    if(historicalChart) historicalChart.destroy();
    
    let labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    let dataCabai = [42000, 43500, 48000, 52000];
    let dataBawang = [31000, 30500, 29000, 27000];
    
    if (filter === '3M') {
        labels = ['Bulan 1', 'Bulan 2', 'Bulan 3'];
        dataCabai = [38000, 45000, 52000];
        dataBawang = [35000, 28000, 27000];
    } else if (filter === '1Y') {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        dataCabai = [40000, 60000, 35000, 52000];
        dataBawang = [25000, 30000, 40000, 27000];
    }
    
    historicalChart = new Chart(ctxHist, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Trend Harga Cabai (Nasional)',
                    data: dataCabai,
                    borderColor: '#ed1c24',
                    backgroundColor: 'rgba(237, 28, 36, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Trend Harga Bawang (Nasional)',
                    data: dataBawang,
                    borderColor: '#0073fe',
                    backgroundColor: 'rgba(0, 115, 254, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Correlation Chart (Harga vs Volume)
    const ctxCorr = document.getElementById('correlationChart').getContext('2d');
    if(correlationChart) correlationChart.destroy();
    
    correlationChart = new Chart(ctxCorr, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Sebaran Wilayah (Harga vs Pasokan)',
                data: [
                    {x: 120, y: 52000, region: 'DKI Jakarta (Defisit)'}, 
                    {x: 800, y: 38000, region: 'Jawa Timur (Surplus)'},
                    {x: 450, y: 45000, region: 'Jawa Tengah (Normal)'},
                    {x: 200, y: 50000, region: 'Sumatera Utara (Defisit)'}
                ],
                backgroundColor: '#9fe400',
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Volume Pasokan (Ton)' } },
                y: { title: { display: true, text: 'Harga Rata-rata (Rp/Kg)' } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(ctx) { return ctx.raw.region + ': ' + ctx.raw.x + ' Ton @ Rp' + ctx.raw.y.toLocaleString('id-ID'); }
                    }
                }
            }
        }
    });
}

// Fitur: Crop Planning
function generatePlantingRecommendation() {
    const container = document.getElementById('planting-recommendations');
    const alertBox = document.getElementById('planning-alerts');
    
    if(alertBox) {
        alertBox.innerHTML = `
            <div class="alert alert-warning mb-3">
                <strong><i class='bx bx-error'></i> Latah Tanam Alert:</strong> Kapasitas lahan Cabai Rawit di radius 50km saat ini sudah mencapai <strong>85%</strong>. Pertimbangkan menanam komoditas alternatif (Kedelai/Jagung) untuk mengurangi risiko <em>oversupply</em> saat panen raya 3 bulan lagi.
            </div>
        `;
    }

    const crops = [
        {name: 'Padi', icon: 'bx-water', desc: 'Cocok ditanam akhir bulan ini menjelang musim hujan. Estimasi panen: 115 Hari.', confidence: '92%'},
        {name: 'Jagung', icon: 'bx-sun', desc: 'Kelembapan tanah saat ini ideal. Permintaan pasar industri pakan diproyeksikan tinggi.', confidence: '88%'},
        {name: 'Kedelai', icon: 'bx-leaf', desc: 'Suhu siang hari mendukung vegetatif. Alternatif paling aman menghindari oversupply cabai.', confidence: '85%'}
    ];
    
    let html = '';
    crops.forEach(crop => {
        html += `
        <div class="planning-card">
            <div class="p-icon"><i class='bx ${crop.icon}'></i></div>
            <div class="p-info">
                <h4>${crop.name} <span class="badge status-high" style="font-size:0.7rem; padding:2px 6px;">Cocok ${crop.confidence}</span></h4>
                <p>${crop.desc}</p>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

// Fitur: Logistics
const logisticsData = [
    {id: 'LOG-8823', rute: 'Blitar → Jakarta', mitra: 'AgroExpress (Cold Chain)', eta: 'Besok, 08:00', status: 'Dalam Perjalanan'},
    {id: 'LOG-8824', rute: 'Nganjuk → Surabaya', mitra: 'TransTani (Truk Bak)', eta: 'Hari Ini, 15:00', status: 'Selesai'},
    {id: 'LOG-8825', rute: 'Ngawi → Semarang', mitra: 'LokalLog (Pickup)', eta: 'Lusa, 10:00', status: 'Menunggu Pengambilan'},
    {id: 'LOG-8826', rute: 'Banyuwangi → Bali', mitra: 'AgroExpress (Fuso)', eta: 'Besok, 12:00', status: 'Dalam Perjalanan'}
];

function loadLogisticsTable(data = logisticsData) {
    const tbody = document.getElementById('logisticsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    data.forEach(item => {
        let badgeClass = 'status-medium';
        if(item.status === 'Selesai') badgeClass = 'status-high';
        if(item.status === 'Dalam Perjalanan') badgeClass = 'status-progress';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td>${item.rute}</td>
                <td>${item.mitra}</td>
                <td>${item.eta}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
            </tr>
        `;
    });
}

function filterLogistics() {
    const query = document.getElementById('logisticsSearch').value.toLowerCase();
    const filtered = logisticsData.filter(item => 
        item.id.toLowerCase().includes(query) || 
        item.rute.toLowerCase().includes(query) ||
        item.mitra.toLowerCase().includes(query)
    );
    loadLogisticsTable(filtered);
}

// Fitur: Theme Toggle & Settings
function toggleTheme() {
    const isDark = document.getElementById('themeToggle').checked;
    if(isDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function saveSettings() {
    const btn = event.target;
    btn.textContent = "Menyimpan...";
    setTimeout(() => {
        btn.textContent = "Disimpan!";
        setTimeout(() => btn.textContent = "Simpan Perubahan", 2000);
    }, 800);
}

// Global Chart Instance
let chartInstance = null;

// Fitur: RBAC Switcher
function switchRole() {
    const role = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value : 'petani';
    document.body.className = document.body.className.replace(/role-\w+/g, '');
    document.body.classList.add('role-' + role);
    
    // Switch logic untuk merender ulang chart Govt jika role pemerintah
    if (role === 'pemerintah') {
        updateMarketCharts();
    } else {
        // Jika sedang di tab Market Trends dan ganti ke Petani, kembali ke dashboard (opsional)
        /*
        const marketTab = document.getElementById('market');
        if (marketTab && marketTab.classList.contains('active')) {
             document.querySelector('[data-target="dashboard"]').click();
        }
        */
    }
}

// Mengupdate DOM setelah siap
document.addEventListener('DOMContentLoaded', () => {
    switchRole();
    loadDashboardSummary();
    updateChart(); // Load initial chart
    
    // Initialize other view components
    initMarketTrends();
    generatePlantingRecommendation();
    loadLogisticsTable();
    
    // Setup Navigation Tabs
    const navItems = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked nav item
            item.classList.add('active');

            // Hide all views
            views.forEach(view => view.classList.remove('active'));
            
            // Show target view
            const targetId = item.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.classList.add('active');
            }
        });
    });
});

// Render KPI & Table
function loadDashboardSummary() {
    const data = fetchLaravelData();
    
    // Set KPIs
    document.getElementById('kpi-kenaikan').textContent = data.kpi.potensi_kenaikan_harga;
    document.getElementById('kpi-penghematan').textContent = data.kpi.penghematan_logistik;
    document.getElementById('kpi-kontrak').textContent = data.kpi.kontrak_pasokan_aktif;

    // Set Table
    const tbody = document.getElementById('matchingTableBody');
    tbody.innerHTML = '';
    
    data.rekomendasi_smart_matching.forEach(row => {
        // Ambil persentase (angka) dari string "Cocok 98%"
        const percentMatch = parseInt(row.status.replace(/\D/g, ''));
        const badgeClass = percentMatch > 90 ? 'status-high' : 'status-medium';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.petani}</strong></td>
            <td>${row.lokasi}</td>
            <td>${row.komoditas} <br><small style="color:var(--text-muted)">Vol: ${row.volume}</small></td>
            <td>${row.harga_estimasi}</td>
            <td><span class="status-badge" style="background-color: var(--bg-dark); color: var(--text-main); border: 1px solid var(--border-color);"><i class='bx bx-info-circle' style="color: var(--primary-color);"></i> ${row.alasan}</span></td>
            <td><span class="status-badge ${badgeClass}">${row.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Fitur: Interaktif KPI Dashboard
function showKpiDetail(type) {
    if (type === 'kenaikan') {
        alert("DETAIL KPI:\n\nBerdasarkan model Holt-Winters, diprediksi terdapat 12.5% potensi kenaikan harga rata-rata komoditas (Cabai Rawit & Bawang Merah) dalam 14 hari ke depan karena faktor cuaca dan tren pasokan wilayah.");
    } else if (type === 'penghematan') {
        alert("DETAIL KPI:\n\nSistem berhasil mengamankan estimasi Rp 2.400.000 dengan konsolidasi muatan (Shared Load) dan pencocokan rute logistik searah (AgroExpress & TransTani) bulan ini.");
    } else if (type === 'kontrak') {
        alert("DETAIL KPI:\n\nSaat ini Anda memiliki 4 Kontrak Pasokan B2B yang sedang aktif dan berjalan, mencakup total pengiriman 3.5 Ton komoditas ke berbagai pabrik/distributor utama.");
    }
}

// Render/Update Chart.js
function updateChart() {
    const commodity = document.getElementById('commoditySelect').value;
    const aiData = generateFastAPIData(commodity, 10);
    
    // Update MAPE Badge
    document.getElementById('mapeValue').textContent = `${aiData.mape_accuracy}%`;

    // Render Actionable Insight
    const insightBox = document.getElementById('actionableInsight');
    insightBox.style.display = 'block';
    if(commodity === 'cabai') {
        insightBox.className = 'alert alert-info mt-3 farmer-only';
        insightBox.innerHTML = `<strong>💡 Actionable Insight:</strong> Harga Cabai Rawit diprediksi <strong>naik signifikan</strong>. Disarankan menahan penjualan hingga H+5 untuk profit maksimal.`;
    } else if (commodity === 'bawang') {
        insightBox.className = 'alert alert-warning mt-3 farmer-only';
        insightBox.innerHTML = `<strong>💡 Actionable Insight:</strong> Harga Bawang Merah <strong>fluktuatif</strong>. Pertimbangkan mengamankan kontrak pasokan sekarang (Smart Matching) untuk mengunci harga jual.`;
    } else {
        insightBox.className = 'alert alert-danger mt-3 farmer-only';
        insightBox.innerHTML = `<strong>💡 Actionable Insight:</strong> Harap Waspada. Harga Beras diprediksi <strong>turun tipis</strong> karena mulainya panen raya di wilayah lain.`;
    }

    // Gabungkan label (Histori + Future)
    const allLabels = [...aiData.historical_data.labels, ...aiData.future_prediction.labels];
    
    // Dataset Aktual (hanya memiliki data histori, sisanya null)
    const dataActual = [...aiData.historical_data.actual_prices, ...Array(10).fill(null)];
    
    // Transform Prediksi (Fitted + Future)
    // Hubungkan poin terakhir history dengan prediksinya agar grafiknya tersambung
    const lastHistoryPredictionPoint = aiData.historical_data.fitted_prices[aiData.historical_data.fitted_prices.length - 1];
    const dataPredicted = [
        ...aiData.historical_data.fitted_prices.slice(0, -1),
        lastHistoryPredictionPoint,
        ...aiData.future_prediction.predicted_prices
    ];

    generateChartUI(allLabels, dataActual, dataPredicted);
}

function generateChartUI(labels, actualData, predictedData) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Gradient untuk garis prediksi
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(159, 228, 0, 0.2)'); // Light primary
    gradientFill.addColorStop(1, 'rgba(159, 228, 0, 0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Harga Aktual',
                    data: actualData,
                    borderColor: '#94a3b8', // Gray muted
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Model Prediksi (Holt-Winters)',
                    data: predictedData,
                    borderColor: '#9fe400', // Primary Green
                    backgroundColor: gradientFill,
                    borderWidth: 3,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#9fe400',
                    pointBorderWidth: 2,
                    pointRadius: (ctx) => {
                        // Hanya tampilkan titik di area prediksi masa depan
                        const index = ctx.dataIndex;
                        return index >= 30 ? 4 : 0; 
                    },
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: { family: "'Outfit', sans-serif" }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    titleFont: { family: "'Outfit', sans-serif", size: 13 },
                    bodyFont: { family: "'Outfit', sans-serif", size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxTicksLimit: 10,
                        font: { family: "'Outfit', sans-serif" }
                    }
                },
                y: {
                    grid: { color: '#e2e8f0', borderDash: [4, 4] },
                    ticks: {
                        font: { family: "'Outfit', sans-serif" },
                        callback: function(value) {
                            // Format ke ribuan k misal 40000 -> 40k
                            return 'Rp ' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}
