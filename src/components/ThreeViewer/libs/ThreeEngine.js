import {nanoid} from 'nanoid';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {strFromU8, unzipSync} from 'three/examples/jsm/libs/fflate.module';

import {ENVIRONMENT_DATA} from 'dataset/environments';
import Lights from './Lights';
import {FitCameraToSelection, ShadowPlane} from './Helpers';
import Composer from './Composer';
import {MESH_HIGHLIGHT_COLOR, SPACE_SIZE} from './Constants';

export default class ThreeEngine {
  /**
   * @param {HTMLDivElement} canvasHolder
   * @param {Object} storeInterface
   */
  constructor(canvasHolder, storeInterface) {
    this.canvasHolder = canvasHolder;
    this.storeInterface = storeInterface;

    this.canvasWidth = canvasHolder.offsetWidth;
    this.canvasHeight = canvasHolder.offsetHeight;
    this.renderRequested = false;
    this.clock = new THREE.Clock();
    this.rayCaster = new THREE.Raycaster();
    this.envMap = null;
    this.meshes = [];
    this.materialData = null;

    //Loading manager
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.storeInterface.setLoaderVisible(true);
    };
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.storeInterface.setLoaderVisible(true);
    };
    this.loadingManager.onLoad = () => {
      this.requestRenderIfNotRequested();
      setTimeout(() => {
        this.storeInterface.setLoaderVisible(false);
      }, [600]);
    };

    /////////////////////////////////////////////////////////////////////////////
    //Scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color('#131313');
    // this.scene.fog = new THREE.Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)

    /////////////////////////////////////////////////////////////////////////////
    //Lights
    this.lights = new Lights();
    this.scene.add(this.lights);

    /////////////////////////////////////////////////////////////////////////////
    //Primitives
    this.unitBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({color: 0xffffff}),
    );
    this.unitBox.visible = false;
    this.scene.add(this.unitBox);

    /////////////////////////////////////////////////////////////////////////////
    //Helpers
    // this.axesHelper = new THREE.AxesHelper(3);
    // this.scene.add(this.axesHelper);

    this.shadowPlane = new ShadowPlane();
    this.scene.add(this.shadowPlane);

    /////////////////////////////////////////////////////////////////////////////
    //Camera
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.canvasWidth / this.canvasHeight,
      0.01,
      SPACE_SIZE * 100,
    );
    this.camera.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE);
    this.camera.lookAt(0, 0, 0);

    /////////////////////////////////////////////////////////////////////////////
    //Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(this.canvasWidth, this.canvasHeight, false);
    this.canvasHolder.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener(
      'mousedown',
      this.onMouseDown.bind(this),
    );
    this.renderer.domElement.addEventListener(
      'mouseup',
      this.onMouseUp.bind(this),
    );
    this.renderer.domElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this),
    );
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener(
      'resize',
      this.requestRenderIfNotRequested.bind(this),
    );

    // Composer
    this.composer = new Composer(this.renderer, this.scene, this.camera);

    /////////////////////////////////////////////////////////////////////////////
    //Camera Controller
    this.cameraController = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.cameraController.minAzimuthAngle = -180;
    this.cameraController.maxAzimuthAngle = 180;
    this.cameraController.dampingFactor = 0.05;
    this.cameraController.enableDamping = false;
    this.cameraController.screenSpacePanning = true;
    this.cameraController.minDistance = 0.3;
    this.cameraController.maxDistance = 1;
    // this.cameraController.minZoom = 0.1;
    // this.cameraController.maxZoom = 1;
    this.cameraController.minPolarAngle = 0.1;
    this.cameraController.maxPolarAngle = Math.PI / 2;
    this.cameraController.enableDamping = true;
    this.cameraController.enableZoom = true;
    this.cameraController.enablePan = false;
    this.cameraController.addEventListener(
      'change',
      this.requestRenderIfNotRequested.bind(this),
    );

    /////////////////////////////////////////////////////////////////////////////
    //Load assets
    //Load outline pattern image
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
    this.objLoader = new OBJLoader(this.loadingManager);
    this.mtlLoader = new MTLLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.imageLoader = new THREE.ImageLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  dispose() {
    this.renderer.dispose();
    this.cameraController.dispose();
    this.meshes = [];

    this.cameraController.removeEventListener(
      'change',
      this.requestRenderIfNotRequested.bind(this),
    );
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener(
      'resize',
      this.requestRenderIfNotRequested.bind(this),
    );
    this.canvasHolder.removeChild(this.renderer.domElement);
    this.canvasHolder.innerHTML = '';
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseDown(event) {}

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseUp(event) {}

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseMove(event) {}

  /**
   * Event handler for key down event
   * @param {Object} event
   */
  onKeyDown(event) {}

  /**
   * Event handler for key up event
   * @param {Object} event
   */
  onKeyUp(event) {}

  resizeRendererToDisplaySize() {
    const canvasWidth = this.renderer.domElement.offsetWidth;
    const canvasHeight = this.renderer.domElement.offsetHeight;
    const needResize =
      canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight;
    if (needResize) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.camera.aspect = this.canvasWidth / this.canvasHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvasWidth, this.canvasHeight);
      this.composer.setSize(this.canvasWidth, this.canvasHeight);
      this.requestRenderIfNotRequested();
    }
  }

  render() {
    this.renderRequested = false;
    this.resizeRendererToDisplaySize();
    this.cameraController.update();
    this.renderer.render(this.scene, this.camera);
    if (this.composer) {
      this.composer.render(this.clock.getDelta());
    }
  }

  requestRenderIfNotRequested() {
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame(this.render.bind(this));
    }
  }

  clearMeshes() {
    this.meshes.forEach(child => {
      child.geometry.dispose();
      child.material.dispose();
      child.parent.remove(child);
    });
    this.meshes.children = [];
  }

  /**
   * @param {*} info
   */
  updateSunLight(info) {
    this.lights.sunLight.visible = info.enabled;
    const color = new THREE.Color(info.color);
    this.lights.sunLight.color.set(color);
    this.lights.sunLight.intensity = info.intensity;
    this.requestRenderIfNotRequested();
  }

  /**
   * @param {*} info
   */
  updateAmbientLight1(info) {
    this.lights.ambientLight1.visible = info.enabled;
    const color = new THREE.Color(info.color);
    this.lights.ambientLight1.color.set(color);
    this.lights.ambientLight1.intensity = info.intensity;
    this.requestRenderIfNotRequested();
  }

  /**
   * @param {*} info
   */
  updateAmbientLight2(info) {
    this.lights.ambientLight2.visible = info.enabled;
    const color = new THREE.Color(info.color);
    this.lights.ambientLight2.color.set(color);
    this.lights.ambientLight2.intensity = info.intensity;
    this.requestRenderIfNotRequested();
  }

  /**
   * @param {Number} index
   * @param {Boolean} enabled
   */
  updateEnvmap(index, enabled) {
    const envTexture = ENVIRONMENT_DATA[index].hdr;
    const pg = new THREE.PMREMGenerator(this.renderer);
    this.rgbeLoader.load(envTexture, texture => {
      texture.rotation = Math.PI;
      texture.offset = new THREE.Vector2(0.5, 0);
      texture.needsUpdate = true;
      texture.updateMatrix();

      pg.compileEquirectangularShader();
      this.envMap = pg.fromEquirectangular(texture).texture;
      this.scene.environment = this.envMap;
      this.scene.background = enabled ? this.envMap : null;
      texture.dispose();
      pg.dispose();
    });
  }

  /**
   * @param {Boolean} enabled
   */
  enableEnvmap(enabled) {
    this.scene.background = enabled ? this.envMap : null;
    this.requestRenderIfNotRequested();
  }

  updateEnvOrientation(index, orientation) {
    const radius =
      Math.cos(THREE.MathUtils.degToRad(ENVIRONMENT_DATA[index].zenith)) *
      SPACE_SIZE;

    this.lights.sunLight.position.x =
      Math.sin(THREE.MathUtils.degToRad(orientation)) * radius;

    this.lights.sunLight.position.z =
      Math.cos(THREE.MathUtils.degToRad(orientation)) * radius;

    this.requestRenderIfNotRequested();
  }

  /**
   * @param {Number} brightness
   */
  updateEnvExposure(brightness) {
    if (this.renderer && this.composer) {
      this.renderer.toneMappingExposure = brightness;
      this.requestRenderIfNotRequested();
    }
  }

  /**
   * @param {Object} materialData
   */
  setMaterialToMeshes(materialData) {
    this.materialData = materialData;

    if (this.meshes.length === 0) {
      return;
    }

    //Set material
    const newMaterial = new THREE.MeshStandardMaterial();
    //Color
    if (materialData.color === '') {
      newMaterial.color.set(null);
    } else {
      newMaterial.color.set(materialData.color);
    }

    //Albedo
    if (materialData.map === '') {
      newMaterial.map = null;
    } else {
      const texture =
        typeof materialData.map === 'string'
          ? this.textureLoader.load(materialData.map)
          : materialData.map;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }

      newMaterial.map = texture;
    }

    //Normal
    if (materialData.normalMap === '') {
      newMaterial.normalMap = null;
    } else {
      const texture =
        typeof materialData.normalMap === 'string'
          ? this.textureLoader.load(materialData.normalMap)
          : materialData.normalMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.normalMap = texture;

      newMaterial.normalScale = new THREE.Vector2(
        materialData.normalScale.x,
        materialData.normalScale.y,
      );
    }

    //Bump
    if (materialData.bumpMap === '') {
      newMaterial.bumpMap = null;
    } else {
      const texture =
        typeof materialData.bumpMap === 'string'
          ? this.textureLoader.load(materialData.bumpMap)
          : materialData.bumpMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.bumpMap = texture;

      newMaterial.bumpScale = materialData.bumpScale;
    }

    //Displacement
    if (materialData.displacementMap === '') {
      newMaterial.displacementMap = null;
    } else {
      const texture =
        typeof materialData.displacementMap === 'string'
          ? this.textureLoader.load(materialData.displacementMap)
          : materialData.displacementMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.displacementMap = texture;

      newMaterial.displacementScale = materialData.displacementScale;
      newMaterial.displacementBias = materialData.displacementBias;
    }

    //Roughness
    if (materialData.roughnessMap === '') {
      newMaterial.roughnessMap = null;
    } else {
      const texture =
        typeof materialData.roughnessMap === 'string'
          ? this.textureLoader.load(materialData.roughnessMap)
          : materialData.roughnessMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.roughnessMap = texture;
    }

    newMaterial.roughness = materialData.roughness;

    //Metalness
    if (materialData.metalnessMap !== '') {
      newMaterial.metalnessMap = null;
    } else {
      const texture =
        typeof materialData.metalnessMap === 'string'
          ? this.textureLoader.load(materialData.metalnessMap)
          : materialData.metalnessMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.metalnessMap = texture;
    }

    newMaterial.metalness = materialData.metalness;

    //Alpha
    if (materialData.alphaMap === '') {
      newMaterial.alphaMap = null;
    } else {
      const texture =
        typeof materialData.alphaMap === 'string'
          ? this.textureLoader.load(materialData.alphaMap)
          : materialData.alphaMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.alphaMap = texture;
    }

    newMaterial.opacity = materialData.opacity;

    //AO
    if (materialData.aoMap === '') {
      newMaterial.aoMap = null;
    } else {
      const texture =
        typeof materialData.aoMap === 'string'
          ? this.textureLoader.load(materialData.aoMap)
          : materialData.aoMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.aoMap = texture;

      newMaterial.aoMapIntensity = materialData.aoMapIntensity;
    }

    //Emissive
    if (materialData.emissiveMap === '') {
      newMaterial.emissiveMap = null;
    } else {
      const texture =
        typeof materialData.emissiveMap === 'string'
          ? this.textureLoader.load(materialData.emissiveMap)
          : materialData.emissiveMap;

      if (materialData.repeat) {
        texture.repeat.set(materialData.repeat.x, materialData.repeat.y);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
      newMaterial.emissiveMap = texture;

      newMaterial.emissiveIntensity = materialData.emissiveIntensity;
    }
    newMaterial.emissive.set(materialData.emissive);

    //Env
    newMaterial.envMapIntensity = materialData.envMapIntensity;
    newMaterial.wireframe = materialData.wireframe;
    newMaterial.transparent = materialData.transparent;
    newMaterial.needsUpdate = true;

    //Set material
    if (this.meshes.length === 1) {
      this.meshes[0].material = newMaterial;
    } else if (this.meshes.length === 2) {
      this.meshes[1].material = newMaterial;
    }

    this.requestRenderIfNotRequested();
  }

  loadModel(file) {
    //Clear
    this.clearMeshes();

    //Load model
    this.gltfLoader.load(file, gltf => {
      if (gltf.scene) {
        this.meshes = [];
        gltf.scene.traverse(child => {
          if (child.type === 'Mesh') {
            child.castShadow = true;
            this.meshes.push(child);
          }
        });
        this.scene.add(gltf.scene);

        //Set material
        this.setMaterialToMeshes(this.materialData);

        //FitCameraToSelection
        FitCameraToSelection(
          this.camera,
          this.meshes,
          1.5,
          this.cameraController,
        );
      }
    });
  }
}
