import * as THREE from 'three'
import type { SceneManager } from '@scene/SceneManager'

export type ARMode = 'webxr' | 'camera-fallback' | 'none'

/**
 * Manages the WebXR immersive-ar session on Android Chrome.
 * Falls through to camera-fallback mode on iOS Safari / unsupported browsers.
 */
export class ARSession {
  private xrSession: XRSession | null = null
  private hitTestSource: XRHitTestSource | null = null
  private reticle: THREE.Mesh
  private placedShapes: THREE.Object3D[] = []
  mode: ARMode = 'none'

  constructor(private scene: SceneManager) {
    // Reticle — floating ring showing where a shape will be placed
    const geo = new THREE.RingGeometry(0.08, 0.1, 32)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide })
    this.reticle = new THREE.Mesh(geo, mat)
    this.reticle.visible = false
    this.reticle.matrixAutoUpdate = false
    scene.scene.add(this.reticle)
  }

  /** Check if WebXR immersive-ar is available */
  static async isSupported(): Promise<boolean> {
    if (!navigator.xr) return false
    try {
      return await navigator.xr.isSessionSupported('immersive-ar')
    } catch {
      return false
    }
  }

  /** Start WebXR AR session */
  async startWebXR(): Promise<void> {
    if (!navigator.xr) throw new Error('WebXR not available')

    this.xrSession = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'plane-detection'],
      domOverlay: { root: document.getElementById('root')! },
    })

    this.scene.renderer.xr.setReferenceSpaceType('local')
    await this.scene.renderer.xr.setSession(this.xrSession)

    // Set up hit-test source
    const refSpace = await this.xrSession.requestReferenceSpace('viewer')
    this.hitTestSource = (await this.xrSession.requestHitTestSource!({ space: refSpace })) ?? null

    this.scene.renderer.setAnimationLoop(this.xrRenderLoop)
    this.mode = 'webxr'

    this.xrSession.addEventListener('end', () => {
      this.hitTestSource?.cancel()
      this.hitTestSource = null
      this.xrSession = null
      this.reticle.visible = false
      this.mode = 'none'
    })
  }

  /** Place a shape at the current reticle position (call on tap) */
  placeShape() {
    if (!this.reticle.visible) return
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    this.reticle.matrix.decompose(pos, quat, scale)
    this.spawnShape(pos, quat)
  }

  /** Place a shape at an estimated position (iOS fallback tap) */
  placeShapeAtScreen(x: number, y: number) {
    // Raycast from camera through tap NDC coords onto a virtual plane 1.2m in front
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2(
      (x / window.innerWidth) * 2 - 1,
      -((y / window.innerHeight) * 2 - 1)
    )
    raycaster.setFromCamera(ndc, this.scene.camera)

    // Virtual surface plane: faces the camera, 1.2m in front of it
    const cameraDir = new THREE.Vector3()
    this.scene.camera.getWorldDirection(cameraDir)
    const planeOrigin = this.scene.camera.position.clone().addScaledVector(cameraDir, 1.2)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      cameraDir.clone().negate(),
      planeOrigin
    )

    const target = new THREE.Vector3()
    const hit = raycaster.ray.intersectPlane(plane, target)

    // Fallback: if ray misses plane, place 1.2m along ray direction
    if (!hit) {
      target.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, 1.2)
    }

    this.spawnShape(target, new THREE.Quaternion())
  }

  private spawnShape(pos: THREE.Vector3, quat: THREE.Quaternion) {
    const colors = [0x6366f1, 0x10b981, 0xf59e0b, 0xef4444, 0x3b82f6]
    const color = colors[this.placedShapes.length % colors.length]

    // Alternate between box and sphere for variety
    const geo =
      this.placedShapes.length % 2 === 0
        ? new THREE.BoxGeometry(0.1, 0.1, 0.1)
        : new THREE.SphereGeometry(0.06, 16, 16)

    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    mesh.quaternion.copy(quat)
    mesh.castShadow = true

    this.scene.scene.add(mesh)
    this.placedShapes.push(mesh)
  }

  private xrRenderLoop = (_: number, frame: XRFrame | null) => {
    if (!frame || !this.hitTestSource) return

    const hitTestResults = frame.getHitTestResults(this.hitTestSource)
    if (hitTestResults.length > 0) {
      const refSpace = this.scene.renderer.xr.getReferenceSpace()!
      const hit = hitTestResults[0].getPose(refSpace)
      if (hit) {
        this.reticle.visible = true
        this.reticle.matrix.fromArray(hit.transform.matrix)
      }
    } else {
      this.reticle.visible = false
    }

    this.scene.renderer.render(this.scene.scene, this.scene.camera)
  }

  async stop() {
    await this.xrSession?.end()
  }

  clearShapes() {
    this.placedShapes.forEach(s => this.scene.scene.remove(s))
    this.placedShapes = []
  }
}
