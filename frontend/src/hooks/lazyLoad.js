import { useEffect, useRef } from 'react'

/**
 * Custom hook for lazy loading images using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {string} options.rootMargin - Margin around the root where loading starts (default: '50px')
 * @param {number} options.threshold - Visibility threshold (default: 0)
 * @returns {Object} Object containing imageRefs and observerRef
 */
export function useLazyLoad(options = {}) {
  const { rootMargin = '50px', threshold = 0 } = options
  const imageRefs = useRef({})
  const observerRef = useRef(null)

  // Initialize Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            const src = img.getAttribute('data-src')
            
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              observerRef.current?.unobserve(img)
            }
          }
        })
      },
      { rootMargin, threshold }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [rootMargin, threshold])

  // Observe all images with data-src attribute
  const observeImages = () => {
    if (observerRef.current) {
      Object.values(imageRefs.current).forEach((img) => {
        if (img && img.getAttribute('data-src')) {
          observerRef.current?.observe(img)
        }
      })
    }
  }

  // Clear and re-observe images (useful when list changes)
  const resetObserver = () => {
    if (observerRef.current) {
      Object.values(imageRefs.current).forEach((img) => {
        if (img) {
          observerRef.current?.unobserve(img)
        }
      })
      imageRefs.current = {}
      observeImages()
    }
  }

  return {
    imageRefs,
    observerRef,
    observeImages,
    resetObserver,
  }
}
