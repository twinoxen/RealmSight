import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { SurfacePlane } from './SurfacePlane'

interface SceneConfig {
  canvas: HTMLElement
  quality: 'full' | 'lite'
}

/**
 * Manages the Three.js renderer, scene graph, camera, and render loop.
 * Owns all 3D state — AR and CV layers interact with SceneManager via its API.
 */
export class SceneManager {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  private clock = new THREE.Clock()
  private controls: OrbitControls | null = null
  private mixers: THREE.AnimationMixer[] = []
  gltfLoader: GLTFLoader
  surfacePlane: SurfacePlane

  constructor(private config: SceneConfig) {
    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({
      antialias: config.quality === 'full',
      alpha: true, // transparent background for camera passthrough
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(
      config.quality === 'lite'
        ? Math.min(window.devicePixelRatio, 1.5)
        : Math.min(window.devicePixelRatio, 2)
    )
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.xr.enabled = true
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    config.canvas.appendChild(this.renderer.domElement)

    // --- Scene ---
    this.scene = new THREE.Scene()

    // --- Camera ---
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
    this.camera.position.set(0, 1.6, 2) // standing eye height for desktop preview

    // --- Lighting ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.2)
    sun.position.set(5, 10, 7)
    sun.castShadow = config.quality === 'full'
    if (config.quality === 'full') {
      sun.shadow.mapSize.set(1024, 1024)
      sun.shadow.camera.near = 0.1
      sun.shadow.camera.far = 50
    }
    this.scene.add(sun)

    // --- glTF Loader with Draco + KTX2 ---
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

    const ktx2Loader = new KTX2Loader()
    ktx2Loader.setTranscoderPath(
      'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/'
    )
    ktx2Loader.detectSupport(this.renderer)

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)
    this.gltfLoader.setKTX2Loader(ktx2Loader)

    // --- Desktop orbit controls (disabled in XR mode) ---
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.target.set(0, 0, 0)

    // Surface plane indicator
    this.surfacePlane = new SurfacePlane(this)

    // --- Resize handler ---
    window.addEventListener('resize', this.onResize)
  }

  /** Start the render loop */
  start() {
    this.renderer.setAnimationLoop(this.render)
  }

  /** Stop the render loop and clean up */
  dispose() {
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    this.controls?.dispose()
    this.renderer.dispose()
    this.config.canvas.removeChild(this.renderer.domElement)
  }

  /** Place a loaded GLTF model at a world position */
  placeModel(
    gltf: { scene: THREE.Object3D; animations: THREE.AnimationClip[] },
    position: THREE.Vector3,
    scale = 1
  ) {
    const model = gltf.scene.clone()
    model.position.copy(position)
    model.scale.setScalar(scale)
    this.scene.add(model)

    if (gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(model)
      gltf.animations.forEach(clip => mixer.clipAction(clip).play())
      this.mixers.push(mixer)
    }

    return model
  }

  /** Remove a model from the scene */
  removeModel(model: THREE.Object3D) {
    this.scene.remove(model)
  }

  private render = () => {
    const delta = this.clock.getDelta()
    this.mixers.forEach(m => m.update(delta))
    this.surfacePlane?.update(delta)
    this.controls?.update()
    this.renderer.render(this.scene, this.camera)
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
