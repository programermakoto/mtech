import * as THREE from "./build/three.module.js";
import Stats from "./jsm/libs/stats.module.js";
import { FlyControls } from "./jsm/controls/FlyControls.js";
import { Lensflare, LensflareElement } from "./jsm/objects/Lensflare.js";

let container, stats;
let camera, scene, renderer;
let controls;

const clock = new THREE.Clock();

init();
animate();

function init() {
    container = document.createElement("div");
    document.querySelector("header").appendChild(container);

    // カメラ
    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        15000
    );
    camera.position.z = 250;

    // シーン
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0, 0, 0); 
    scene.fog = new THREE.Fog(scene.background, 3500, 15000);

    // ボックスを追加
    const size = 250;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
    });

    for (let i = 0; i < 2000; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        scene.add(mesh);
    }

    // 平行光線
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, -1, 0).normalize();
    dirLight.color.setHSL(0.1, 0.7, 0.5);
    scene.add(dirLight);

    // レンズフレア
    const textureLoader = new THREE.TextureLoader();
    const textureFlare = textureLoader.load("./threejs-image/LensFlare.png");
    addLight(0.08, 0.3, 0.9, 0, 0, -1000);

    function addLight(h, s, l, x, y, z) {
        const light = new THREE.PointLight(0xffffff, 2, 2000);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        scene.add(light);

        const lensflare = new Lensflare();
        lensflare.addElement(
            new LensflareElement(textureFlare, 700, 0, light.color)
        );
        light.add(lensflare);
    }

    // レンダラー
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // コントロール
    controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 2000;
    controls.rollSpeed = Math.PI / 50;
    controls.autoForward = false;
    controls.dragToLook = false;

    // stats
    stats = new Stats();
    // container.appendChild(stats.dom);

    // ウィンドウリサイズ
    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    const delta = clock.getDelta();
    controls.update(delta);
    renderer.render(scene, camera);
}
