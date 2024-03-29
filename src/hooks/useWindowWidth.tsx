import { useEffect, useState } from 'react'

const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [width])
  return width
}

export default useWindowWidth
