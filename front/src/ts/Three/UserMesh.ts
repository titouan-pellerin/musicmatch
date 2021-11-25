import { MainScene } from './MainScene';
import gsap from 'gsap';
import { Box3, Group, Mesh, Scene, ShaderMaterial, TorusGeometry, Vector3 } from 'three';
import fragmentShader from '../../glsl/UserMesh/fragment.glsl';
import vertexShader from '../../glsl/UserMesh/vertex.glsl';
import raf from '../utils/Raf';

export class UserMesh extends Mesh {
  static userMeshes: Map<string, UserMesh> = new Map();
  static columnsIndex = 0;
  static rowsIndex = 0;
  static scene: MainScene;
  static userMeshesGroup = new Group();
  static canvas: HTMLCanvasElement;
  nameEl: HTMLHeadingElement;
  constructor(id: string, name: string) {
    console.log('constructor');
    const userGeometry = new TorusGeometry(1, 0.1, 64, 64);
    const userMaterial = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: 0 },
      },
    });
    super(userGeometry, userMaterial);

    this.nameEl = document.createElement('h2');
    this.nameEl.innerText = name;
    this.nameEl.id = id;
    this.nameEl.classList.add('user-name', 'hidden');
    document.querySelector('.labels')?.appendChild(this.nameEl);

    this.positionMesh();
  }

  positionMesh() {
    console.log('position');

    const gridSize = Math.ceil(Math.sqrt(UserMesh.userMeshes.size));
    console.log('grid size', gridSize);
    console.log('rowsIndex', UserMesh.rowsIndex);
    console.log('columnsIndex', UserMesh.columnsIndex);

    this.position.set(UserMesh.rowsIndex * 1.2, UserMesh.columnsIndex * 3, 0);

    // const center = new Vector3();
    // const size = new Vector3();
    // const box = new Box3().setFromObject(UserMesh.userMeshesGroup);
    // box.getCenter(center);
    // box.getSize(size);

    // box.setFromObject(UserMesh.userMeshesGroup);
    // box.getCenter(center);
    // box.getSize(size);

    if (UserMesh.rowsIndex <= 5) UserMesh.rowsIndex++;
    else {
      UserMesh.rowsIndex = 0;
      UserMesh.columnsIndex--;
    }
    const tempV = new Vector3();

    this.updateWorldMatrix(true, false);
    this.getWorldPosition(tempV);

    tempV.project(UserMesh.scene.camera);

    const x = (tempV.x * 0.5 + 0.5) * UserMesh.canvas.clientWidth;
    const y = (tempV.y * -0.5 + 0.5) * UserMesh.canvas.clientHeight;

    this.nameEl.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

    // if (Math.abs(UserMesh.columnsIndex) <= gridSize) UserMesh.columnsIndex--;
    // else UserMesh.columnsIndex = 0;
    // if (UserMesh.columnsIndex >= gridSize) UserMesh.columnsIndex = 0;
  }

  static update() {
    UserMesh.userMeshes.forEach((userMesh) => {
      (userMesh.material as ShaderMaterial).uniforms.uTime.value = raf.elapsedTime;

      const tempV = new Vector3();

      userMesh.updateWorldMatrix(true, false);
      userMesh.getWorldPosition(tempV);

      tempV.project(UserMesh.scene.camera);

      const x = (tempV.x * 0.5 + 0.5) * UserMesh.canvas.clientWidth;
      const y = (tempV.y * -0.5 + 0.5) * UserMesh.canvas.clientHeight;

      userMesh.nameEl.style.transform = `translate(-50%, -50%) translate(${x}px,calc(${y}px + 12rem)`;
    });
  }

  static remove(id: string) {
    const meshToRemove = UserMesh.userMeshes.get(id) as UserMesh;
    document.getElementById(id)?.classList.add('hidden');
    gsap.to(meshToRemove.scale, {
      duration: 0.75,
      x: 0,
      y: 0,
      z: 0,
      ease: 'power3',
      onComplete: () => {
        UserMesh.userMeshesGroup.remove(meshToRemove);
        UserMesh.userMeshes.delete(id);
        document.getElementById(id)?.remove();
      },
    });
  }

  static cloneUser(id: string, name: string) {
    const clonedMesh = [...UserMesh.userMeshes.values()][0].clone();
    (clonedMesh.material as ShaderMaterial) = (
      clonedMesh.material as ShaderMaterial
    ).clone();
    const clonedMaterial = clonedMesh.material as ShaderMaterial;
    const seed = Math.random();
    clonedMaterial.uniforms.uSeed.value = seed;

    clonedMesh.nameEl.innerText = name;
    clonedMesh.nameEl.id = id;

    clonedMesh.positionMesh();

    // clonedMesh.rotation.set(Math.PI * 2 * seed, Math.PI * 2 * seed, Math.PI * 2 * seed);
    // UserMesh.userMeshes.set(id, clonedMesh);
    // UserMesh.userMaterials.set(id, clonedMaterial);

    return clonedMesh;
  }
}
