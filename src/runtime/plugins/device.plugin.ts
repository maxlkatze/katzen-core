import { reactive } from 'vue'
import type { AddonDeviceRecognition } from '../types/ModuleTypes'
import { defineNuxtPlugin, useRuntimeConfig, useRequestHeaders } from '#imports'
import type { DeviceTypes } from '~/src/runtime/types/DeviceTypes'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const deviceRecognition = runtimeConfig.public.deviceRecognition as AddonDeviceRecognition
  const { defaultUserAgent } = deviceRecognition

  // Server Side
  if (nuxtApp.ssrContext) {
    const headers = useRequestHeaders()
    const userAgent = headers['user-agent'] || defaultUserAgent

    const types = reactive(getDeviceType(userAgent, headers))

    return {
      provide: {
        device: types,
      },
    }
  }

  // Client Side
  const userAgent = navigator.userAgent || defaultUserAgent
  const types = reactive(getDeviceType(userAgent))

  return {
    provide: {
      device: types,
    },
  }
})

const getDeviceType = (userAgent: string, headers?: Record<string, string>): DeviceTypes => {
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  let isTablet = /iPad/i.test(userAgent)
  let isDesktop = !isMobile && !isTablet

  if (!headers) {
    return {
      isMobile,
      isTablet,
      isDesktop,
    }
  }

  if (userAgent === 'Amazon CloudFront') {
    isMobile = headers['cloudfront-is-mobile-viewer'] === 'true'
    isTablet = headers['cloudfront-is-tablet-viewer'] === 'true'
    isDesktop = headers['cloudfront-is-desktop-viewer'] === 'true'
  }
  else if (headers['cf-device-type']) { // Cloudflare
    isMobile = headers['cf-device-type'] === 'mobile'
    isTablet = headers['cf-device-type'] === 'tablet'
    isDesktop = headers['cf-device-type'] === 'desktop'
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}
