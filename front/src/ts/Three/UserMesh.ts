import gsap from 'gsap';
import {
  Camera,
  Group,
  Mesh,
  MeshBasicMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import fragmentShader from '../../glsl/UserMesh/fragment.glsl';
import vertexShader from '../../glsl/UserMesh/vertex.glsl';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import raf from '../utils/Raf';

export class UserMesh extends Group {
  static userMeshes: Map<string, Group> = new Map();
  static lastMeshPos: Vector3;
  static fontLoader = new FontLoader();
  static userMaterial = new ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  static textMaterial = new MeshBasicMaterial();
  textGeometry: TextGeometry | null = null;
  textMesh: Mesh | null = null;
  userGeometry: SphereGeometry;
  userMesh: Mesh;

  constructor() {
    super();

    this.userGeometry = new SphereGeometry(1, 8, 8);
    this.userMesh = new Mesh(this.userGeometry, UserMesh.userMaterial);
    this.add(this.userMesh);

    // UserMesh.fontLoader.load('/fonts/HelveticaNeueLTPro.json', (font) => {
    //   this.textGeometry = new TextGeometry(name, {
    //     font: font,
    //     size: 0.3,
    //     height: 1,
    //     curveSegments: 12,
    //     bevelThickness: 0,
    //     bevelSize: 0,
    //     bevelSegments: 0,
    //   });
    //   this.textGeometry.center();
    //   UserMesh.textMaterial.color = new Color('#000000');
    //   this.textMesh = new Mesh(this.textGeometry, UserMesh.textMaterial);
    //   console.log(UserMesh.textMaterial);

    //   this.textMesh.position.y = -1.7;
    //   this.add(this.textMesh);
    // });
  }

  // async load(id: string) {
  //   // const model = await this.gltfLoader.loadAsync('/models/ring.gltf');
  //   // console.log(model.scene);
  //   // const geometry = model.scene.children[0].geometry;
  //   return this.userMesh;
  // }

  static update() {
    UserMesh.userMaterial.uniforms.uTime.value = raf.elapsedTime;
  }

  static remove(id: string, scene: Scene) {
    // const keys = [...UserMesh.userMeshes.keys()];
    // const values = [...UserMesh.userMeshes.values()];
    // const index = keys.indexOf(id);
    // const meshToRemove = values[index];
    const meshToRemove = UserMesh.userMeshes.get(id) as Group;
    // const meshToRemove = UserMesh.userMeshes.get(id) as Group;
    gsap.to(meshToRemove.scale, {
      duration: 0.75,
      x: 0,
      y: 0,
      z: 0,
      ease: 'power3',
      onComplete: () => {
        scene.remove(meshToRemove);
        UserMesh.userMeshes.delete(id);
      },
    });
  }
}
