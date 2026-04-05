import * as THREE from 'three';

// 1. Scene Setup
const container = document.getElementById('accretion-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Accretion Disc Geometry
const particleCount = 5000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    // Math to create a circular orbital ring
    const radius = 2 + Math.random() * 3;
    const angle = Math.random() * Math.PI * 2;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Slight vertical wobble
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    // SNW Cyan Gradient
    colors[i * 3] = 0.38;     // R (62)
    colors[i * 3 + 1] = 0.75; // G (192)
    colors[i * 3 + 2] = 1.0;  // B (255)
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const disc = new THREE.Points(geometry, material);
scene.add(disc);

// 3. Central Singularity (The "Truth" Core)
const coreGeo = new THREE.SphereGeometry(0.1, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

camera.position.z = 8;
camera.position.y = 4;
camera.lookAt(0, 0, 0);

// 4. Animation Loop (The Physics Simulation)
let velocity = 0.005;

function animate() {
    requestAnimationFrame(animate);

    // Spin the disc based on Kinetic Velocity
    disc.rotation.y += velocity;
    
    // Update HUD Value
    document.getElementById('velocity-value').innerText = (velocity * 100).toFixed(3);

    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

