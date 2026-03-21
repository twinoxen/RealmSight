import * as THREE from 'three'

/**
 * PlaceAnimation
 *
 * Plays a "build-in" animation when a shape is first placed:
 * - Scale: starts at 0, springs to 1 with slight overshoot
 * - Position: rises up ~4cm from the surface
 * - Particle burst: small debris particles shoot out from the base
 *
 * Self-contained — just call play(mesh, onComplete) and forget it.
 */

interface ActiveAnimation {
  mesh: THREE.Object3D
  particles: THREE.Points | null
  elapsed: number
  duration: number
  startY: number
  targetY: number
  onComplete?: () => void
}

// Spring easing with overshoot
function springEase(t: number): number {
  const c4 = (2 * Math.PI) / 3
  if (t === 0) return 0
  if (t === 1) return 1
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export class PlaceAnimationSystem {
  private active: ActiveAnimation[] = []
  private scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /** Kick off the build-in animation for a newly placed mesh */
  play(mesh: THREE.Object3D, onComplete?: () => void) {
    const startY = mesh.position.y - 0.06
    const targetY = mesh.position.y
    mesh.position.y = startY
    mesh.scale.setScalar(0.01)

    const particles = this.createBurst(mesh.position)

    this.active.push({
      mesh,
      particles,
      elapsed: 0,
      duration: 0.55,
      startY,
      targetY,
      onComplete,
    })
  }

  /** Call every frame with delta time */
  update(delta: number) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const anim = this.active[i]
      anim.elapsed += delta
      const t = Math.min(anim.elapsed / anim.duration, 1)
      const eased = springEase(t)

      // Scale spring
      anim.mesh.scale.setScalar(eased)

      // Rise from surface
      anim.mesh.position.y = anim.startY + (anim.targetY - anim.startY) * eased

      // Particles fade out in first half
      if (anim.particles) {
        const pMat = anim.particles.material as THREE.PointsMaterial
        pMat.opacity = Math.max(0, 1 - t * 2.5)
        if (pMat.opacity <= 0) {
          this.scene.remove(anim.particles)
          anim.particles = null
        }
      }

      if (t >= 1) {
        anim.mesh.scale.setScalar(1)
        anim.mesh.position.y = anim.targetY
        if (anim.particles) this.scene.remove(anim.particles)
        anim.onComplete?.()
        this.active.splice(i, 1)
      }
    }
  }

  private createBurst(position: THREE.Vector3): THREE.Points {
    const count = 12
    const positions = new Float32Array(count * 3)
    const velocities: THREE.Vector3[] = []

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x
      positions[i * 3 + 1] = position.y
      positions[i * 3 + 2] = position.z

      const angle = (i / count) * Math.PI * 2
      velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * 0.08,
          Math.random() * 0.04 + 0.01,
          Math.sin(angle) * 0.08
        )
      )
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.015,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)

    // Animate particles outward (simple immediate offset)
    const pos = geo.attributes.position as THREE.BufferAttribute
    velocities.forEach((v, i) => {
      pos.setXYZ(i, position.x + v.x, position.y + v.y, position.z + v.z)
    })
    pos.needsUpdate = true

    this.scene.add(points)
    return points
  }

  dispose() {
    this.active.forEach(a => {
      if (a.particles) this.scene.remove(a.particles)
    })
    this.active = []
  }
}
