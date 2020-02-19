import { useRef, useEffect } from 'react'

const isBrowser = typeof window !== `undefined`

export const useScrollPosition = (effect, dependencies, wait) => {
  const position = useRef(getScrollPosition());

  let debounceTime = null;

  const callBack = () => {
    const currPos = getScrollPosition();
    effect({ prevPos: position.current, currPos })
    position.current = currPos
    debounceTime = null
  }

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    const handleScroll = () => {
      if (wait) {
        if (debounceTime === null) {
          //TODO add support for debounce
        }
      } else {
        callBack()
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, dependencies)
}

const getScrollPosition = () => {
  if (!isBrowser) return { x: 0, y: 0 }
  
  let scrollEnd = false;
  if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 15) {
    scrollEnd = true
  }

  return { 
    x: window.scrollX,
    y: window.scrollY,
    endOfScroll: scrollEnd 
  }
}

useScrollPosition.defaultProps = {
  dependencies: [],
  wait: null,
}