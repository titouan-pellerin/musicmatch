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
  static userMeshesGrid: Map<Vector3, boolean> = new Map();
  static scene: MainScene;
  static userMeshesGroup = new Group();
  static canvas: HTMLCanvasElement;
  static textureloader = new TextureLoader();
  static matcapTexture = UserMesh.textureloader.load('/textures/metal.jpg');
  static userMeshesGroupPositions: Vector3[] = [];
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
    const offsetX = 2.5;
    const offsetY = 3;
    const rowLength = offsetX + 3;
    let newPosition: Vector3 | null = null;
    if (UserMesh.userMeshesGrid.size === 0) {
      newPosition = new Vector3(0, 0, 0);
    } else {
      for (let [position, isOccupied] of UserMesh.userMeshesGrid) {
        if (!isOccupied) {
          console.log('empty spot');

          newPosition = position;
          break;
        }
      }
      if (!newPosition) {
        const lastPos = [...UserMesh.userMeshesGrid.keys()][
          UserMesh.userMeshesGrid.size - 1
        ];
        console.log(lastPos, rowLength);

        newPosition = new Vector3();
        if (lastPos.x <= rowLength) {
          console.log('same row');
          newPosition.x = lastPos.x + offsetX;
          newPosition.y = (lastPos.x - 0.5) % 2 === 0 ? lastPos.y + 0.5 : lastPos.y - 0.5;
        } else {
          console.log('new row');
          newPosition.x = 0;
          newPosition.y = lastPos.y - offsetY;
        }
      }
    }

    this.position.set(newPosition.x, newPosition.y, newPosition.z);
    UserMesh.userMeshesGrid.set(this.position, true);
    console.log('add', UserMesh.userMeshesGrid);

    // this.position.set(UserMesh.rowsIndex * 1.2, UserMesh.columnsIndex * 3, 0);
    // gsap.to(UserMesh.userMeshesGroup.position, {
    //   duration: 0.75,
    //   x: -UserMesh.rowsIndex * 0.6,
    //   y: -UserMesh.columnsIndex * 1.5,
    //   ease: 'power3.out',
    // });

    // if (UserMesh.rowsIndex <= 5) UserMesh.rowsIndex++;
    // else {
    //   UserMesh.rowsIndex = 0;
    //   UserMesh.columnsIndex--;
    // }
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
    console.log('remove animation');

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
    console.log('beforeClone');
    // const clonedMesh = [...UserMesh.userMeshes.values()][0].clone();
    // console.log('afterClone');
    // clonedMesh.positionMesh();
    // const matcapMaterial = (clonedMesh.material as MeshMatcapMaterial).clone();
    // matcapMaterial.onBeforeCompile = (shader) => {
    //   const uniforms = {
    //     uTime: { value: raf.elapsedTime },
    //     uSeed: { value: MathUtils.randFloat(0.1, 1) },
    //   };
    //   shader.uniforms.uTime = uniforms.uTime;
    //   shader.uniforms.uSeed = uniforms.uSeed;

    //   clonedMesh.uniforms = uniforms;

    //   shader.vertexShader = shader.vertexShader.replace(
    //     '#include <common>',
    //     `
    //     #include <common>

    //     uniform float uTime;
    //     uniform float uSeed;

    //     ${noise}
    //     `,
    //   );

    //   shader.vertexShader = shader.vertexShader.replace(
    //     '#include <project_vertex>',
    //     `
    //     #include <project_vertex>

    //     vNormal = normal;
    //     vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
    //     float noiseX = cnoise(vec2(normal.x * modelPosition.z * uSeed, uTime * uSeed));
    //     float noiseY = cnoise(vec2(normal.z * modelPosition.x, uTime + uSeed));
    //     float noiseZ = cnoise(vec2(normal.y * modelPosition.y * uSeed, uTime * uSeed));

    //     modelPosition.x -= sin(noiseX * uSeed + uTime * 4. + uSeed) * .1 * -uSeed;
    //     modelPosition.y += sin(noiseY * 3. + uTime * 3. + uSeed * .10) * .1;
    //     modelPosition.z += atan(noiseZ * uSeed + uTime * 2. + uSeed) * .1;
    //     gl_Position = projectionMatrix * modelPosition * uSeed;
    //     `,
    //   );
    // };
    const newUserMesh = new UserMesh(id, name);
    // clonedMesh.material = matcapMaterial;
    // clonedMesh.nameEl.innerText = name;
    // clonedMesh.nameEl.id = id;

    return newUserMesh;
  }
}
