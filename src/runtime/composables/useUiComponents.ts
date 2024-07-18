import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { ComponentType, useUiStore } from '../stores/UiStore'
import type { KatzenUIComponent, KatzenUIOptions } from '~/src/runtime/stores/UiStore'
import { useRuntimeConfig } from '#app'

interface FetchedContentType {
  content: Record<string, unknown>
}

interface ImageContent {
  src: string
  alt: string
}

export const fetchedContent: FetchedContentType = { content: {} }

export const loadFetchContent = async () => {
  interface ContentResponse {
    body: {
      content: Record<string, unknown>
    }
  }
  const data = await $fetch<ContentResponse>('/content-cms', {
    method: 'POST',
  })
  if (data === null) {
    console.error('No content fetched')
    return
  }
  fetchedContent.content = data.body.content

  for (const key in fetchedContent.content) {
    useUiStore().updateUiContent(key, fetchedContent.content[key])
  }
}

export const getContent = () => {
  if (Object.keys(fetchedContent.content).length === 0) {
    return useRuntimeConfig().public.content as Record<string, unknown> || {}
  }
  return fetchedContent.content
}

export const getContentByKey = <T = string>(key: string) => {
  const content = getContent()
  if (content[key]) {
    return content[key] as T
  }
  return undefined
}

export const useKatzeRichText = (options: KatzenUIOptions) => {
  const uiStore = useUiStore()
  const component: KatzenUIComponent = { type: ComponentType.RichText, options, content: getContentByKey(options.key) }
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
  const component: KatzenUIComponent = { type: ComponentType.Text, options, content: getContentByKey(options.key) }
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

  console.log('contentRef', contentRef)

  return contentRef as T
}
