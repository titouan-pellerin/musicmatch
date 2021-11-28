import { UserMesh } from './UserMesh';
import raf from '../utils/Raf';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  AmbientLight,
  MOUSE,
  OrthographicCamera,
  Scene,
  TOUCH,
  WebGLRenderer,
} from 'three';

export class MainScene extends Scene {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.OrthographicCamera;
  controls: OrbitControls;
  sizes: { width: number; height: number };
  cameraFrustumSize = 1000;
  reduced = false;
  constructor(canvas: HTMLCanvasElement) {
    super();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.canvas = canvas;
    UserMesh.scene = this;
    UserMesh.canvas = canvas;
    this.add(UserMesh.userMeshesGroup);

    const aspect = this.sizes.width / this.sizes.height;
    this.camera = new OrthographicCamera(
      (this.cameraFrustumSize * aspect) / -2,
      (this.cameraFrustumSize * aspect) / 2,
      this.cameraFrustumSize / 2,
      this.cameraFrustumSize / -2,
      1,
      1000,
    );
    this.camera.zoom = 125;
    this.camera.updateProjectionMatrix();

    this.camera.position.set(0, 0, 3);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableRotate = false;
    this.controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN,
    };
    this.controls.touches = {
      ONE: TOUCH.PAN,
      TWO: TOUCH.DOLLY_PAN,
    };
    this.controls.update();

    const ambientLight = new AmbientLight(100);
    this.add(ambientLight);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.add(this.camera);

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
    this.controls.update();
    this.renderer.render(this, this.camera);
  }
}
