import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { ComponentType, useUiStore } from '../stores/UiStore'
import type { KatzenUIComponent, KatzenUIOptions } from '~/src/runtime/stores/UiStore'

const uiStore = useUiStore()
const { getComponents } = storeToRefs(uiStore)

export const useKatzeRichText = (options: KatzenUIOptions) => {
  const component: KatzenUIComponent = { type: ComponentType.RichText, options, content: '' }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

export const useKatzeImage = (options: KatzenUIOptions) => {
  const component: KatzenUIComponent = { type: ComponentType.Image, options, content: '' }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

export const useKatzeText = (options: KatzenUIOptions) => {
  const component: KatzenUIComponent = { type: ComponentType.Text, options, content: '' }
  uiStore.addToContextStack(component)
  return reactiveProperty(options.key)
}

const reactiveProperty = (key: string) => {
  const uiComponent = ref(getComponents.value(key))
  const contentRef = ref(uiComponent.value?.content || '')
  // watch getUiContent.value for changes
  watch(uiComponent, (newValue) => {
    contentRef.value = newValue?.content || ''
  }, { deep: true })

  return contentRef
}
