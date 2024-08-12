/**
 *
 * Katze Animation Library
 * - useScrollAnimation
 * - useTimelineAnimation (WIP)
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import { onMounted, onUnmounted } from '#imports'

interface ScrollAnimationOptions {
  global?: boolean
  screenHeight?: boolean
  element?: Ref<HTMLElement | null>
}

interface UpdateFunction {
  (values: ScrollAnimationValues): void
}

interface ScrollAnimationValues {
  capped: number
  full: number
}

const watchingElements: Map<HTMLElement, UpdateFunction> = new Map()
const globalScrollPercentage = ref<ScrollAnimationValues>({ capped: 0, full: 0 })
const screenHeightPercentage = ref<ScrollAnimationValues>({ capped: 0, full: 0 })

export const useScrollAnimation = (options: ScrollAnimationOptions) => {
  let reactiveScrollProperty = ref<ScrollAnimationValues>({ capped: 0, full: 0 })
  if (options.global) {
    reactiveScrollProperty = globalScrollPercentage
  }
  else if (options.screenHeight) {
    reactiveScrollProperty = screenHeightPercentage
  }
  else if (options.element) {
    // wait for element to be mounted
    onMounted(() => {
      const updateFunction = (values: ScrollAnimationValues) => {
        reactiveScrollProperty.value = values
      }
      watchingElements.set(<HTMLElement>options.element?.value, updateFunction)
    })
  }
  else {
    throw new Error('Please provide an element or set global or screenHeight to true in the options')
  }

  onMounted(() => window.addEventListener('scroll', globalScrollListener))
  onUnmounted(() => window.removeEventListener('scroll', globalScrollListener))

  return reactiveScrollProperty
}

const globalScrollListener = () => {
  const scrollY = window.scrollY

  const globalPercent = scrollY / (document.body.scrollHeight - window.innerHeight)
  globalScrollPercentage.value = { capped: Math.min(1, globalPercent), full: globalPercent }

  const screenHeightPercent = scrollY / window.innerHeight
  screenHeightPercentage.value = { capped: Math.min(1, screenHeightPercent), full: screenHeightPercent }

  watchingElements.forEach((updateFunction, element) => {
    const elementTop = element.getBoundingClientRect().top
    const elementHeight = element.getBoundingClientRect().height
    const cappedValue = Math.max(0, Math.min(1, (elementTop + elementHeight) / window.innerHeight))
    updateFunction({ capped: 1 - cappedValue, full: (-1 * (elementTop / window.innerHeight)) })
  })
}
