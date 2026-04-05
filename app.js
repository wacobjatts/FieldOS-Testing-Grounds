const ctx = document.getElementById('dualChart').getContext('2d');

// 1. Data Buffers
let priceData = Array(60).fill(65000);
let precisionData = Array(60).fill(0.5);
let labels = Array(60).fill('');

const dualChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'MARKET PRICE',
                data: priceData,
                borderColor: '#ffffff',
                borderWidth: 1.5,
                yAxisID: 'yPrice',
                pointRadius: 0,
                tension: 0.1
            },
            {
                label: 'LOGIC PRECISION',
                data: precisionData,
                borderColor: '#62c0ff',
                backgroundColor: 'rgba(98, 192, 255, 0.1)',
                fill: true,
                yAxisID: 'yPrecision',
                pointRadius: 0,
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            yPrice: { position: 'left', grid: { color: '#1a2229' }, ticks: { color: '#8b949e' } },
            yPrecision: { position: 'right', min: 0, max: 1, grid: { display: false }, ticks: { color: '#62c0ff' } },
            x: { display: false }
        },
        plugins: { legend: { display: false } }
    }
});

// 2. Instrument Logic
const instruments = {
    absorption: {
        code: "const n = trades / 10;\nconst decay = Math.exp(-age / 100);\nreturn n * decay;",
        run: (t, a) => Math.max(0, Math.min(1, (t / 10) * Math.exp(-a / 100)))
    }
};

let currentInst = 'absorption';
document.getElementById('code-display').innerText = instruments.absorption.code;

// 3. The Live Loop
function tick() {
    // Simulate Price Move
    let lastPrice = priceData[priceData.length - 1];
    let newPrice = lastPrice + (Math.random() - 0.5) * 100;
    
    // Simulate your TS inputs
    let mockTrades = 5 + Math.sin(Date.now() / 1000) * 5; // Cyclical trade density
    let mockAge = Math.abs(Math.sin(Date.now() / 500)) * 200; // Fluctuating latency
    
    // Run Formula
    let precision = instruments[currentInst].run(mockTrades, mockAge);
    
    // Update Chart
    priceData.push(newPrice); priceData.shift();
    precisionData.push(precision); precisionData.shift();
    
    dualChart.update('none');

    // Update Readouts
    document.getElementById('stat-precision').innerText = (precision * 100).toFixed(1) + "%";
    let divergence = (newPrice / lastPrice - precision).toFixed(4);
    document.getElementById('stat-divergence').innerText = divergence;
}

setInterval(tick, 200);

