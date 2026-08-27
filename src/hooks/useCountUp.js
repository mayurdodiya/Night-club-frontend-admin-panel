import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number') {
      setValue(0)
      return
    }
    const start = performance.now()
    const from = 0

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}
