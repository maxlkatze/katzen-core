import { onMounted, onUnmounted, ref, useNuxtApp, useRuntimeConfig } from '#imports'
import type { DeviceTypes } from '~/src/runtime/types/DeviceTypes'
import type { AddonDeviceRecognition } from '~/src/runtime/types/ModuleTypes'

export const useDeviceType = () => {
  const deviceType = useNuxtApp().$device as DeviceTypes
  const { isTablet, isDesktop } = deviceType

  const runtimeConfig = useRuntimeConfig()
  const deviceRecognition = runtimeConfig.public.deviceRecognition as AddonDeviceRecognition
  const { responsiveContainerClass } = deviceRecognition

  const isMobile = ref(deviceType.isMobile)
  const resizeListener = (containerClass: string) => {
    // get div @container width
    const container = document.querySelector(containerClass)
    if (container) {
      const containerWidth = container.clientWidth
      isMobile.value = containerWidth < 768
    }
  }

  const addResizeListener = (containerClass: string) => {
    // add resize listener to .page-size element
    const resizeObserver = new ResizeObserver(() => resizeListener(containerClass))
    const container = document.querySelector(containerClass)
    if (container) {
      resizeObserver.observe(container)
    }
    resizeListener(containerClass)
  }
  if (responsiveContainerClass) {
    const resizeEvent = () => resizeListener(responsiveContainerClass)
    onMounted(() => {
      if (responsiveContainerClass) {
        addResizeListener(responsiveContainerClass)
        window.addEventListener('resize', resizeEvent)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizeEvent)
    })
  }
  return { isMobile, isTablet, isDesktop }
}
