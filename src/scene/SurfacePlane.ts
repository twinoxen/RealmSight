import * as THREE from 'three'
import type { SceneManager } from './SceneManager'

/**
 * SurfacePlane
 *
 * Renders a transparent grid plane that shows the user where the system
 * thinks the flat surface is. Animates in when a surface is detected
 * and pulses gently to indicate readiness.
 *
 * On WebXR: positioned from real hit-test results
 * On iOS fallback: positioned on the estimated virtual plane 1.2m in front of camera
 */
export class SurfacePlane {
  private mesh: THREE.Mesh
  private gridHelper: THREE.GridHelper
  private group: THREE.Group
  private visible = false
  private fadeTarget = 0
  private currentOpacity = 0

  constructor(private scene: SceneManager) {
    this.group = new THREE.Group()

    // Transparent base plane
    const planeGeo = new THREE.PlaneGeometry(0.6, 0.6)
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.mesh = new THREE.Mesh(planeGeo, planeMat)
    this.group.add(this.mesh)

    // Grid overlay for the "scanning surface" feel
    this.gridHelper = new THREE.GridHelper(0.6, 6, 0x6366f1, 0x6366f1)
    const gridMat = this.gridHelper.material as THREE.LineBasicMaterial
    gridMat.transparent = true
    gridMat.opacity = 0
    this.group.add(this.gridHelper)

    // Edge border ring
    const ringGeo = new THREE.RingGeometry(0.28, 0.3, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.name = 'ring'
    this.group.add(ring)

    this.group.rotation.x = -Math.PI / 2
    this.group.visible = false
    scene.scene.add(this.group)
  }

  /** Show the plane at a world position (flat surface) */
  show(position: THREE.Vector3, normal?: THREE.Vector3) {
    this.group.position.copy(position)

    if (normal) {
      // Align plane to the detected surface normal
      const up = new THREE.Vector3(0, 1, 0)
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal)
      this.group.quaternion.copy(quat)
    } else {
      this.group.rotation.x = -Math.PI / 2
    }

    if (!this.visible) {
      this.group.visible = true
      this.visible = true
    }
    this.fadeTarget = 1
  }

  /** Smoothly hide the plane */
  hide() {
    this.fadeTarget = 0
  }

  /** Call every frame to animate opacity */
  update(delta: number) {
    if (!this.group.visible) return

    const speed = 3
    this.currentOpacity += (this.fadeTarget - this.currentOpacity) * speed * delta
    const op = this.currentOpacity

    if (op < 0.005) {
      this.group.visible = false
      this.visible = false
      return
    }

    // Gentle pulse
    const pulse = 0.85 + Math.sin(Date.now() / 600) * 0.15

    ;(this.mesh.material as THREE.MeshBasicMaterial).opacity = op * 0.08 * pulse
    const gridMat = this.gridHelper.material as THREE.LineBasicMaterial
    gridMat.opacity = op * 0.35 * pulse

    const ring = this.group.getObjectByName('ring') as THREE.Mesh | undefined
    if (ring) {
      ;(ring.material as THREE.MeshBasicMaterial).opacity = op * 0.7
    }
  }

  dispose() {
    this.scene.scene.remove(this.group)
  }
}
