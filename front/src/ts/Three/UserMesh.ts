import gsap from 'gsap';
import {
  Camera,
  Group,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Shader,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import fragmentShader from '../../glsl/UserMesh/fragment.glsl';
import vertexShader from '../../glsl/UserMesh/vertex.glsl';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import raf from '../utils/Raf';

export class UserMesh extends Group {
  static userMeshes: Map<string, Group> = new Map();
  static userMaterials: Map<string, ShaderMaterial> = new Map();
  static fontLoader = new FontLoader();
  static textMaterial = new MeshBasicMaterial();
  userMaterial: ShaderMaterial;
  userGeometry: TorusGeometry;
  userMesh: Mesh;

  constructor(id: string) {
    super();
    this.userMaterial = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: 0 },
      },
    });
    this.userGeometry = new TorusGeometry(1, 0.1, 64, 64);
    this.userMesh = new Mesh(this.userGeometry, this.userMaterial);
    this.userMesh.rotation.set(Math.PI * 0.3, 0, 0);
    this.add(this.userMesh);

    UserMesh.userMaterials.set(id, this.userMaterial);
    UserMesh.userMeshes.set(id, this);

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
    UserMesh.userMaterials.forEach((userMaterial) => {
      userMaterial.uniforms.uTime.value = raf.elapsedTime;
    });
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
        UserMesh.userMaterials.delete(id);
      },
    });
  }

  static clone(id: string) {
    const clonedMesh = [...UserMesh.userMeshes.values()][0].clone();
    ((clonedMesh.children[0] as Mesh).material as ShaderMaterial) = (
      (clonedMesh.children[0] as Mesh).material as ShaderMaterial
    ).clone();
    const clonedMaterial = (clonedMesh.children[0] as Mesh).material as ShaderMaterial;
    const seed = Math.random();
    clonedMaterial.uniforms.uSeed.value = seed;
    const seedPos = seed > 0.5 ? seed : -seed;
    clonedMesh.position.set(Math.cos(seedPos) * 2, Math.sin(seedPos) * 2, 0);
    clonedMesh.rotation.set(Math.PI * 2 * seed, Math.PI * 2 * seed, Math.PI * 2 * seed);
    // clonedMesh.scale.set(1 + seed, 1 + seed, 1 + seed);
    UserMesh.userMeshes.set(id, clonedMesh);
    UserMesh.userMaterials.set(id, clonedMaterial);

    return clonedMesh;
  }
}
