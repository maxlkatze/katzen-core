import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { ComponentType, useUiStore } from '../stores/UiStore'
import type { KatzenUIComponent, KatzenUIOptions } from '~/src/runtime/stores/UiStore'
import { useRuntimeConfig } from '#imports'

export interface ImageContent {
  src: string
  alt: string
}

let fetchedContent: Record<string, unknown> | undefined

export const setFetchedContent = (content: Record<string, unknown>) => {
  fetchedContent = content
}

export const getContent = () => {
  if (fetchedContent) {
    return fetchedContent
  }
  return useRuntimeConfig().public.content as Record<string, unknown> || {}
}

export const getContentByKey = <T = string>(key: string, defaultValue: string = '') => {
  const content = getContent()
  if (content[key]) {
    return content[key] as T || defaultValue
  }
  return defaultValue
}

export const useKatzeRichText = (options: KatzenUIOptions) => {
  const uiStore = useUiStore()
  const component: KatzenUIComponent = { type: ComponentType.RichText, options, content: getContentByKey(options.key, options.default) }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

export const useKatzeImage = (options: KatzenUIOptions) => {
  const uiStore = useUiStore()
  const component: KatzenUIComponent = { type: ComponentType.Image, options, content: getContentByKey(options.key) }
  uiStore.addToContextStack(component)
  return reactiveProperty<ImageContent>(options.key)
}

export const useKatzeText = (options: KatzenUIOptions) => {
  const uiStore = useUiStore()
  const component: KatzenUIComponent = { type: ComponentType.Text, options, content: getContentByKey(options.key, options.default) }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

const reactiveProperty = <T = string>(key: string) => {
  const uiStore = useUiStore()
  const { getComponents } = storeToRefs(uiStore)
  const uiComponent = ref(getComponents.value(key))
  const contentRef = ref(uiComponent.value?.content || '')
  // watch getUiContent.value for changes
  watch(uiComponent, (newValue) => {
    contentRef.value = newValue?.content || ''
  }, { deep: true })
  return contentRef as T
}
