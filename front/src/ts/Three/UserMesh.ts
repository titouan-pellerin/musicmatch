import { UserMesh } from './UserMesh';
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
import { noise } from '../../glsl/utils/noise2d';
import raf from '../utils/Raf';

export class UserMesh extends Mesh {
  static userMeshes: Map<string, UserMesh> = new Map();
  static columnsIndex = 0;
  static rowsIndex = 0;
  static scene: MainScene;
  static userMeshesGroup = new Group();
  static canvas: HTMLCanvasElement;
  static textureloader = new TextureLoader();
  static matcapTexture = UserMesh.textureloader.load('/textures/metal.jpg');
  static userMeshesGroupPositions: Vector3[];
  static userMeshesGroupPosition: Vector3;
  static materialParameters: {
    roughness: 0;
    metalness: 1;
    clearcoat: 0.1;
    clearcoatRoughness: number;
  };
  nameEl: HTMLHeadingElement;
  uniforms: {
    uTime: { value: number };
    uSeed: { value: number };
  };
  constructor(id: string, name: string) {
    console.log('constructor');
    const userGeometry = new TorusGeometry(1, 0.09, 64, 64);
    const userMaterial = new MeshMatcapMaterial({});
    const uniforms = {
      uTime: { value: raf.elapsedTime },
      uSeed: { value: MathUtils.randFloat(0.1, 1) },
    };
    userMaterial.matcap = UserMesh.matcapTexture;
    userMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uSeed = uniforms.uSeed;
      console.log(shader.vertexShader);

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        
        uniform float uTime;
        uniform float uSeed;
        
        ${noise}
        `,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        #include <project_vertex>
        
        vNormal = normal;
        vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
        float noiseX = cnoise(vec2(normal.x * modelPosition.z * uSeed, uTime * uSeed));
        float noiseY = cnoise(vec2(normal.z * modelPosition.x, uTime + uSeed));
        float noiseZ = cnoise(vec2(normal.y * modelPosition.y * uSeed, uTime * uSeed));
        
        modelPosition.x -= sin(noiseX * uSeed + uTime * 4. + uSeed) * .1 * -uSeed;
        modelPosition.y += sin(noiseY * 3. + uTime * 3. + uSeed * .10) * .1;
        modelPosition.z += atan(noiseZ * uSeed + uTime * 2. + uSeed) * .1;
        gl_Position = projectionMatrix * modelPosition * uSeed;
        `,
      );
    };

    super(userGeometry, userMaterial);
    this.uniforms = uniforms;
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
    gsap.to(UserMesh.userMeshesGroup.position, {
      duration: 0.75,
      x: -UserMesh.rowsIndex * 0.6,
      y: -UserMesh.columnsIndex * 1.5,
      ease: 'power3.out',
    });

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

    const scaleFactor = UserMesh.scene.camera.zoom / 125;
    this.nameEl.style.transform = `translate(-50%, -50%) translate(${x}px,calc(${y}px + ${
      12 * scaleFactor
    }rem)) scale(${scaleFactor})`;
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
        12 * scaleFactor
      }rem)) scale(${scaleFactor})`;
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
    const matcapMaterial = (clonedMesh.material as MeshMatcapMaterial).clone();
    matcapMaterial.onBeforeCompile = (shader) => {
      const uniforms = {
        uTime: { value: raf.elapsedTime },
        uSeed: { value: MathUtils.randFloat(0.1, 1) },
      };
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uSeed = uniforms.uSeed;

      clonedMesh.uniforms = uniforms;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        
        uniform float uTime;
        uniform float uSeed;
        
        ${noise}
        `,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        #include <project_vertex>
        
        vNormal = normal;
        vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
        float noiseX = cnoise(vec2(normal.x * modelPosition.z * uSeed, uTime * uSeed));
        float noiseY = cnoise(vec2(normal.z * modelPosition.x, uTime + uSeed));
        float noiseZ = cnoise(vec2(normal.y * modelPosition.y * uSeed, uTime * uSeed));
        
        modelPosition.x -= sin(noiseX * uSeed + uTime * 4. + uSeed) * .1 * -uSeed;
        modelPosition.y += sin(noiseY * 3. + uTime * 3. + uSeed * .10) * .1;
        modelPosition.z += atan(noiseZ * uSeed + uTime * 2. + uSeed) * .1;
        gl_Position = projectionMatrix * modelPosition * uSeed;
        `,
      );
    };

    clonedMesh.material = matcapMaterial;
    clonedMesh.nameEl.innerText = name;
    clonedMesh.nameEl.id = id;

    clonedMesh.positionMesh();

    return clonedMesh;
  }
}
