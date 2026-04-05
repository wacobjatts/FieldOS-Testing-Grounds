import * as THREE from 'three';

// --- INITIALIZATION ---
const container = document.getElementById('accretion-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// --- 3D ACCRETION DISC (CENTER) ---
const particleCount = 4000;
const geometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    const r = 2.5 + Math.random() * 2.5;
    const a = Math.random() * Math.PI * 2;
    posArray[i * 3] = Math.cos(a) * r;
    posArray[i * 3 + 2] = Math.sin(a) * r;
}
geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const disc = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.015, color: 0x62c0ff, transparent: true, opacity: 0.6 }));
scene.add(disc);
scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })));

camera.position.set(0, 5, 8);
camera.lookAt(0, 0, 0);

// --- KINETIC PRECISION LOGIC (The Manifold Engine) ---
// This simulates your 'absorptionprecision.ts' variables
let tradesCount = 0;
let lastUpdateTime = Date.now();

function animate() {
    requestAnimationFrame(animate);
    const now = Date.now();
    const time = now * 0.001;

    // 1. Simulating your TS Logic: sampleSignificance & temporalHonesty
    tradesCount = (Math.sin(time * 0.5) * 5) + 5; // Simulates 0 to 10 trades
    const sampleSignificance = Math.max(0, Math.min(1, tradesCount / 10));
    
    const bookAgeMs = (now - lastUpdateTime) % 500; // Simulates data age decay
    const temporalHonesty = Math.exp(-bookAgeMs / 100);
    
    const precision = sampleSignificance * temporalHonesty;

    // 2. APPLYING TO UI: Strange New Worlds 'Clarity' degradation
    const buyChamber = document.querySelector('.chamber.buy');
    const sellChamber = document.querySelector('.chamber.sell');
    const blade = document.getElementById('price-blade');
    const precisionText = document.getElementById('precision-percent');

    // Absorption State (Chamber Heights)
    const buyAbsorption = 40 + Math.sin(time) * 20; 
    const sellAbsorption = 50 + Math.cos(time) * 15;
    buyChamber.style.height = `${buyAbsorption}%`;
    sellChamber.style.height = `${sellAbsorption}%`;

    // Price Blade (The Equilibrium)
    blade.style.top = `${50 + Math.sin(time * 0.8) * 30}%`;

    // PRECISION EFFECT: Stale/Low-sample data becomes hazy and dim
    const manifoldGlow = precision * 0.8;
    const manifoldBlur = (1 - precision) * 8; // Max 8px blur when precision is 0
    
    buyChamber.style.opacity = manifoldGlow;
    sellChamber.style.opacity = manifoldGlow;
    buyChamber.style.filter = `blur(${manifoldBlur}px)`;
    sellChamber.style.filter = `blur(${manifoldBlur}px)`;
    
    precisionText.innerText = `${(precision * 100).toFixed(0)}%`;
    precisionText.style.color = precision > 0.5 ? '#62c0ff' : '#ff9d00';

    // 3. DISC ANIMATION
    disc.rotation.y += 0.005;
    const posAttr = disc.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        const x = posAttr.array[i * 3];
        const z = posAttr.array[i * 3 + 2];
        const d = Math.sqrt(x * x + z * z);
        posAttr.array[i * 3 + 1] = Math.sin(d * 2 - time * 2) * 0.2;
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

