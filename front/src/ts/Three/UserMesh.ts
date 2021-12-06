import cursor from './../utils/Cursor';
import { MainScene } from './MainScene';
import gsap from 'gsap';
import {
  Group,
  MathUtils,
  Mesh,
  MeshMatcapMaterial,
  TextureLoader,
  TorusGeometry,
  Vector3,
} from 'three';
import commonReplaceVertexShader from '../../glsl/UserMesh/commonReplace.glsl?raw';
import projectReplaceVertexShader from '../../glsl/UserMesh/projectReplace.glsl?raw';
import raf from '../utils/Raf';

export class UserMesh extends Mesh {
  static userMeshes: Map<string, UserMesh> = new Map();
  static userMeshesGrid: Map<Vector3, boolean> = new Map();
  static lastPos = new Vector3(0, 0, 0);
  static scene: MainScene;
  static userMeshesGroup = new Group();
  static canvas: HTMLCanvasElement;
  static textureloader = new TextureLoader();
  static matcapTexture = UserMesh.textureloader.load('/textures/metal.jpg');
  static userMeshesGroupPositions: Vector3[] = [];
  static userMeshesGroupPosition = new Vector3();
  nameEl: HTMLHeadingElement;
  uniforms: {
    uTime: { value: number };
    uSeed: { value: number };
  };
  constructor(id: string, name: string) {
    const userGeometry = new TorusGeometry(1, 0.09, 64, 64);

    const userMaterial = new MeshMatcapMaterial();
    const uniforms = {
      uTime: { value: raf.elapsedTime },
      uSeed: { value: MathUtils.randFloat(0.1, 0.5) },
    };
    userMaterial.matcap = UserMesh.matcapTexture;
    userMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uSeed = uniforms.uSeed;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        commonReplaceVertexShader,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        projectReplaceVertexShader,
      );
    };

    super(userGeometry, userMaterial);
    this.uniforms = uniforms;
    this.nameEl = document.createElement('h2');
    this.nameEl.innerText = name;
    this.nameEl.id = id;
    this.nameEl.classList.add('user-name', 'hidden', 'hoverable');
    document.querySelector('.labels')?.appendChild(this.nameEl);
    cursor.updateArray();

    this.positionMesh();
  }

  positionMesh() {
    const offsetX = 2.5;
    const offsetY = 3;
    const rowLength = offsetX + 3;
    let newPosition: Vector3 | null = null;
    if (UserMesh.userMeshesGrid.size === 0) {
      newPosition = new Vector3(0, 0, 0);
    } else {
      for (let [position, isOccupied] of UserMesh.userMeshesGrid) {
        if (!isOccupied) {
          newPosition = position.clone();
          UserMesh.userMeshesGrid.delete(position);
          break;
        }
      }
      if (!newPosition) {
        newPosition = new Vector3();
        if (UserMesh.lastPos.x <= rowLength) {
          newPosition.x = UserMesh.lastPos.x + offsetX;
          newPosition.y =
            (UserMesh.lastPos.x - 0.5) % 2 === 0
              ? UserMesh.lastPos.y + 0.5
              : UserMesh.lastPos.y - 0.5;
        } else {
          newPosition.x = 0;
          newPosition.y = UserMesh.lastPos.y - offsetY;
        }
        UserMesh.lastPos = newPosition;
      }
    }

    this.position.set(newPosition.x, newPosition.y, newPosition.z);
    UserMesh.userMeshesGrid.set(this.position, true);
    console.log(UserMesh.userMeshesGrid);

    gsap.to(UserMesh.userMeshesGroup.position, {
      duration: 0.75,
      ease: 'power3.out',
      x: -newPosition.x * 0.5,
      y: -newPosition.y,
      z: 0,
    });
    UserMesh.userMeshesGroupPosition.set(-newPosition.x * 0.5, -newPosition.y, 0);
    // UserMesh.userMeshesGroup.position.set(-newPosition.x * 0.5, -newPosition.y * 0.5, 0);

    const tempV = new Vector3();

    this.updateWorldMatrix(true, false);
    this.getWorldPosition(tempV);

    tempV.project(UserMesh.scene.camera);

    const x = (tempV.x * 0.5 + 0.5) * UserMesh.canvas.clientWidth;
    const y = (tempV.y * -0.5 + 0.5) * UserMesh.canvas.clientHeight;

    const scaleFactor = UserMesh.scene.camera.zoom / 125;
    this.nameEl.style.transform = `translate(-50%, -50%) translate(${x}px,calc(${y}px + ${
      14 * scaleFactor
    }vh)) scale(${scaleFactor})`;
  }

  static update() {
    UserMesh.userMeshes.forEach((userMesh) => {
      userMesh.uniforms.uTime.value = raf.elapsedTime;
      const tempV = new Vector3();

      userMesh.updateWorldMatrix(true, false);
      userMesh.getWorldPosition(tempV);

      tempV.project(UserMesh.scene.camera);

      const x = (tempV.x * 0.5 + 0.5) * UserMesh.canvas.clientWidth;
      const y = (tempV.y * -0.5 + 0.5) * UserMesh.canvas.clientHeight;
      const scaleFactor = UserMesh.scene.camera.zoom / 100;

      userMesh.nameEl.style.transform = `translate(-50%, -50%) translate(${x}px,calc(${y}px + ${
        14 * scaleFactor
      }vh)) scale(${scaleFactor})`;
    });
  }

  static remove(id: string) {
    const meshToRemove = UserMesh.userMeshes.get(id) as UserMesh;
    document.getElementById(id)?.classList.add('hidden');
    UserMesh.userMeshesGrid.set(meshToRemove.position, false);
    console.log(UserMesh.userMeshesGrid);

    gsap.to(meshToRemove.rotation, {
      duration: 0.75,
      x: 0,
      y: 0,
      z: Math.PI,
      ease: 'power4.out',
    });
    gsap.to(meshToRemove.scale, {
      duration: 0.75,
      x: 0,
      y: 0,
      z: 0,
      ease: 'power3.in',
      onComplete: () => {
        UserMesh.userMeshesGroup.remove(meshToRemove);
        UserMesh.userMeshes.delete(id);
        document.getElementById(id)?.remove();
      },
    });
  }

  static cloneUser(id: string, name: string) {
    const newUserMesh = new UserMesh(id, name);
    return newUserMesh;
  }
}
