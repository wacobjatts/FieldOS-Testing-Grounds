import * as THREE from 'three';

// 1. Scene & Camera Setup (The Cockpit Viewport)
const container = document.getElementById('accretion-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Accretion Disc Geometry (5,000 High-Energy Particles)
const particleCount = 5000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const radius = 2.5 + Math.random() * 2.5;
    const angle = Math.random() * Math.PI * 2;
    
    positions[i * 3] = Math.cos(angle) * radius;     // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Y (Initial height)
    positions[i * 3 + 2] = Math.sin(angle) * radius; // Z

    // Kinetic Cyan Gradient
    colors[i * 3] = 0.38;     // R
    colors[i * 3 + 1] = 0.75; // G
    colors[i * 3 + 2] = 1.0;  // B
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const disc = new THREE.Points(geometry, material);
scene.add(disc);

// 3. The Central Singularity (Belief Mean)
const coreGeo = new THREE.SphereGeometry(0.12, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// Position Camera for SNW Perspective
camera.position.set(0, 5, 8);
camera.lookAt(0, 0, 0);

// 4. Kinetic Animation Loop (The Warp Simulation)
let velocity = 0.005; 

function animate() {
    requestAnimationFrame(animate);

    // DYNAMIC WARP: Simulate market tension rippling through the disc
    const time = Date.now() * 0.001;
    const posAttr = disc.geometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
        const x = posAttr.array[i * 3];
        const z = posAttr.array[i * 3 + 2];
        const dist = Math.sqrt(x * x + z * z);
        
        // This wave equation creates the "Accretion Ripple"
        posAttr.array[i * 3 + 1] = Math.sin(dist * 2.5 - time * 2) * 0.25;
    }
    posAttr.needsUpdate = true;

    // Spin the system
    disc.rotation.y += velocity;
    
    // Update the HUD Readout
    const displayVal = (velocity * 100 + (Math.abs(Math.sin(time)) * 0.5)).toFixed(3);
    document.getElementById('velocity-value').innerText = displayVal;

    renderer.render(scene, camera);
}

// Ensure responsiveness
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
