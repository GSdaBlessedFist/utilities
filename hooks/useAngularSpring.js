// 2026-01-20 16:20
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * useAngularSpring
 * 
 * Generic spring-damper hook for 3D rotations.
 * 
 * @param {Object} params
 * @param {THREE.Object3D} params.objectRef - The object whose rotation will be controlled
 * @param {number} params.axis - Axis index: 0=x, 1=y, 2=z
 * @param {number} [params.stiffness=6] - Spring stiffness
 * @param {number} [params.damping=0.6] - Damping coefficient
 * @param {Function} [params.getMotionInput] - Optional function returning motion input delta each frame
 * @param {number} [params.swingFactor=0.3] - Scaling for motion input effect
 * @param {number} [params.restAngle=0] - Angle object returns to at rest
 */
export function useAngularSpring({
    objectRef,
    axis,
    stiffness = 6,
    damping = 0.6,
    getMotionInput,
    swingFactor = 0.3,
    restAngle = 0,
}) {
    const theta = useRef(0)
    const omega = useRef(0)
    const prevInput = useRef(0)
    const restRotation = useRef(null)

    useEffect(() => {
        if (!objectRef.current) return
        if (!restRotation.current) restRotation.current = objectRef.current.rotation.clone()
    }, [objectRef])

    useFrame((_, dt) => {
        if (!objectRef.current || !restRotation.current) return

        // -------------------------------
        // Motion input kick
        // -------------------------------
        if (getMotionInput) {
            const input = getMotionInput()
            const delta = input - prevInput.current
            prevInput.current = input
            theta.current -= delta * swingFactor
        }

        // -------------------------------
        // Spring-damper physics
        // -------------------------------
        const error = theta.current - restAngle
        const alpha = -stiffness * error - damping * omega.current
        omega.current += alpha * dt
        theta.current += omega.current * dt

        // -------------------------------
        // Apply rotation
        // -------------------------------
        const r = restRotation.current.clone()
        if (axis === 0) r.x += theta.current
        if (axis === 1) r.y += theta.current
        if (axis === 2) r.z += theta.current

        objectRef.current.rotation.copy(r)
    })
}
