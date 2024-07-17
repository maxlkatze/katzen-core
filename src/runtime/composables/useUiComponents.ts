import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { ComponentType, useUiStore } from '../stores/UiStore'
import type { KatzenUIComponent, KatzenUIOptions } from '~/src/runtime/stores/UiStore'
import {useRuntimeConfig} from '#app';
import {useFetch} from '#build/imports';

export let fetchedContent: Record<string, string> = {}

export const loadFetchContent = async () => {
  interface ContentResponse {
    body: {
      content: Record<string, string>
    }
  }
  const data = await $fetch<ContentResponse>('/content-cms', {
    method: 'POST',
  })
  if(data === null) {
    console.error('No content fetched')
    return;
  }
  fetchedContent = data.body.content

  for (const key in fetchedContent) {
    useUiStore().updateUiContent(key, fetchedContent[key])
  }
}

export const getContent = () => {
  if(Object.keys(fetchedContent).length === 0) {
    return useRuntimeConfig().public.content as Record<string, string> || {}
  }
  return fetchedContent
}

export const getContentByKey = (key: string) => {
  const content = getContent()
  if(content[key]) {
    return content[key]
  }
  return ''
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
  return reactiveProperty(options.key)
}

export const useKatzeText = (options: KatzenUIOptions) => {
  const uiStore = useUiStore()
  const component: KatzenUIComponent = { type: ComponentType.Text, options, content: getContentByKey(options.key) }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

const reactiveProperty = (key: string) => {
  const uiStore = useUiStore()
  const { getComponents } = storeToRefs(uiStore)
  const uiComponent = ref(getComponents.value(key))
  const contentRef = ref(uiComponent.value?.content || '')
  // watch getUiContent.value for changes
  watch(uiComponent, (newValue) => {
    contentRef.value = newValue?.content || ''
  }, { deep: true })

  return contentRef
}
