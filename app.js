import * as THREE from 'three';

const container = document.getElementById('accretion-canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 1. Accretion Disc Geometry
const particleCount = 6000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const radius = 2.2 + Math.random() * 2.8;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    colors[i * 3] = 0.38; colors[i * 3 + 1] = 0.75; colors[i * 3 + 2] = 1.0;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const disc = new THREE.Points(geometry, new THREE.PointsMaterial({ 
    size: 0.018, 
    vertexColors: true, 
    transparent: true, 
    opacity: 0.8, 
    blending: THREE.AdditiveBlending 
}));
scene.add(disc);

const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 32, 32), 
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
scene.add(core);

camera.position.set(0, 6, 9);
camera.lookAt(0, 0, 0);

// 2. HUD Label Projection
const labelHorizon = document.getElementById('label-horizon');
const labelRim = document.getElementById('label-rim');

function projectLabel(element, pos3d) {
    const vector = pos3d.clone().project(camera);
    const x = (vector.x * .5 + .5) * window.innerWidth;
    const y = (vector.y * -.5 + .5) * window.innerHeight;
    element.style.display = 'block';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

// 3. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Warp Physics
    const posAttr = disc.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        const x = posAttr.array[i * 3];
        const z = posAttr.array[i * 3 + 2];
        const dist = Math.sqrt(x * x + z * z);
        posAttr.array[i * 3 + 1] = Math.sin(dist * 2.5 - time * 2.5) * 0.3;
    }
    posAttr.needsUpdate = true;
    disc.rotation.y += 0.004;

    // Position Labels
    const horizonPoint = new THREE.Vector3(1.8, 0, 0).applyMatrix4(disc.matrixWorld);
    const rimPoint = new THREE.Vector3(4.5, 0, 0).applyMatrix4(disc.matrixWorld);
    
    projectLabel(labelHorizon, horizonPoint);
    projectLabel(labelRim, rimPoint);

    const velocity = (0.8 + Math.abs(Math.sin(time * 0.5)) * 1.2).toFixed(3);
    document.getElementById('velocity-value').innerText = velocity;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

