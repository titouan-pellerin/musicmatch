import { UserMesh } from './UserMesh';
import * as THREE from 'three';
import raf from '../utils/Raf';

export class MainScene extends THREE.Scene {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.OrthographicCamera;
  // controls: OrbitControls;
  sizes: { width: number; height: number };
  cameraFrustumSize = 1000;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.fog = new THREE.Fog(0xffffff, 2, 8);
    this.canvas = canvas;

    // this.camera = new THREE.PerspectiveCamera(
    //   55,
    //   this.sizes.width / this.sizes.height,
    //   0.1,
    //   100,
    // );
    const aspect = this.sizes.width / this.sizes.height;
    this.camera = new THREE.OrthographicCamera(
      (this.cameraFrustumSize * aspect) / -2,
      (this.cameraFrustumSize * aspect) / 2,
      this.cameraFrustumSize / 2,
      this.cameraFrustumSize / -2,
      1,
      1000,
    );
    this.camera.zoom = 100;
    this.camera.updateProjectionMatrix();

    this.camera.position.set(0, 0, 3);

    // this.controls = new OrbitControls(this.camera, this.canvas);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.05;
    // this.controls.update();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.add(this.camera);

    // const ambientLight = new THREE.AmbientLight(0.2);
    // const pointLight = new THREE.PointLight(1.8);
    // pointLight.position.set(1, 1, 0);

    // this.add(ambientLight, pointLight);

    window.addEventListener('resize', this.resize.bind(this));

    raf.subscribe('three', this.update.bind(this));
    raf.subscribe('userMeshMaterial', UserMesh.update.bind(this));
  }

  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    const aspect = this.sizes.width / this.sizes.height;
    this.camera.left = (-this.cameraFrustumSize * aspect) / 2;
    this.camera.right = (this.cameraFrustumSize * aspect) / 2;
    this.camera.top = this.cameraFrustumSize / 2;
    this.camera.bottom = -this.cameraFrustumSize / 2;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  update() {
    // this.controls.update();

    this.renderer.render(this, this.camera);
  }
}
