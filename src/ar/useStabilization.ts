import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SceneManager } from '@scene/SceneManager'

/**
 * useStabilization
 *
 * Implements a simple visual-inertial odometry (VIO) fallback using the DeviceMotion API.
 * Since iOS Safari doesn't provide WebXR 6DOF tracking, we use device gyro/accelerometer
 * to estimate the camera's rotation and update the Three.js camera to keep the surface
 * plane relatively stable on screen when the user tilts or pans their phone.
 */
export function useStabilization(
  sceneRef: React.MutableRefObject<SceneManager | null>,
  enabled: boolean
) {
  const initialized = useRef(false)
  const baseRotation = useRef(new THREE.Euler())
  const deviceEuler = useRef(new THREE.Euler())
  const currentQuat = useRef(new THREE.Quaternion())

  useEffect(() => {
    if (!enabled) {
      initialized.current = false
      return
    }

    const scene = sceneRef.current
    if (!scene) return

    // DeviceOrientation provides absolute rotation angles (alpha, beta, gamma)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return

      const alpha = THREE.MathUtils.degToRad(e.alpha)
      const beta = THREE.MathUtils.degToRad(e.beta)
      const gamma = THREE.MathUtils.degToRad(e.gamma)

      // Map device coordinates to Three.js camera coordinates
      // Assuming portrait orientation
      deviceEuler.current.set(beta, alpha, -gamma, 'YXZ')
      const q = new THREE.Quaternion().setFromEuler(deviceEuler.current)

      // Adjust for camera looking along -Z
      const q0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
      q.multiply(q0)
      const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2)
      q.multiply(q1)

      if (!initialized.current) {
        baseRotation.current.copy(deviceEuler.current)
        initialized.current = true
        return
      }

      currentQuat.current.copy(q)

      // We don't apply position changes here, just rotation to keep shapes "planted" when tilting
      scene.camera.quaternion.slerp(currentQuat.current, 0.5) // slerp for smoothness
    }

    // Request permissions for iOS 13+
    const requestAccess = async () => {
      const dev = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
      if (typeof dev.requestPermission === 'function') {
        try {
          const state = await dev.requestPermission()
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        } catch (e) {
          console.warn('[Stabilization] Permission rejected:', e)
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    requestAccess()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      // Reset camera to default
      if (scene) {
        scene.camera.rotation.set(0, 0, 0)
      }
    }
  }, [enabled, sceneRef])
}
