import { useRef, useEffect, useState } from 'react'

/**
 * Logs delta times for a subset of state labels dynamically.
 * @param {Object} stateMap - keys are labels, values are state variables
 * @param {Array} initialWatchList - labels to log initially (optional)
 */
export function useDeltaLogger(stateMap, initialWatchList = []) {
    const lastTimesRef = useRef({})
    const [watchList, setWatchList] = useState(initialWatchList)

    // Expose a setter for dynamically updating which labels to watch
    const setWatch = (labels) => {
        setWatchList(labels)
    }

    useEffect(() => {
        const now = performance.now()

        Object.entries(stateMap).forEach(([label, value]) => {
            if (!watchList.includes(label)) return // skip if not being watched

            const lastTime = lastTimesRef.current[label] ?? now
            const delta = (now - lastTime) / 1000
            console.log(
                `%c${delta.toFixed(3)}s%c since "%c${label}%c" last changed — current value: %c${value}`,
                'color: teal; font-weight: bold;',
                '',
                'color: steelblue;font-weight:bold; font-style: italic;',
                '',
                'color: purple; font-weight: bold;'
            )
            lastTimesRef.current[label] = now
        })
    }, [...Object.values(stateMap), watchList]) // re-run on state change or watchList change

    return setWatch
}

/**
 * USAGE:
 * const setWatch = useDeltaLogger({ state, state }, [])
 *
 * Enable watching:
 * setWatch(['stateLabel'])
 *
 * Disable All:
 * setWatch([])
 */
