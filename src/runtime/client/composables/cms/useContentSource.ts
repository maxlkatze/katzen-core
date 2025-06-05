import { type Ref, ref } from 'vue'
import type { ContentValue, StoredContent } from '../../../types/ContentTypes'
import { useEditContentStorage } from './useEditContentStorage'
import { toRef, useRuntimeConfig } from '#imports'

const isCMSUser = ref(false)
const storedContentRegistry = ref<Map<string, StoredContent>>(new Map())

export const useContentSource = () => {
  // COMPONENTS AND COMPOSABLES READ FROM THIS STATE,
  // TWO PATHS ARE READ FROM: RUNTIME CONFIG AND EDIT CONTENT STORAGE
  // THE EDIT CONTENT STORAGE IS REACTIVE WHILE THE RUNTIME CONFIG IS NOT
  // THE CONTENT SOURCE NEEDS A SWITCHABLE STATE TO DIFFERENTIATE BETWEEN CMS USERS AND LIVE USERS

  const runtimeConfig = useRuntimeConfig()
  const content = runtimeConfig.public.content as Record<string, ContentValue>
  const editContentStorage = useEditContentStorage()

  const enableCMSMode = async () => {
    if (import.meta.server) return
    await editContentStorage.loadContent()
    isCMSUser.value = true
  }

  const getContentByKey = (key: string, defaultValue: ContentValue): Ref<ContentValue> | ContentValue => {
    if (isCMSUser.value) {
      // if value is not found declare it with the defaultValue
      if (!editContentStorage.editContent.value[key]) {
        editContentStorage.editContent.value[key] = defaultValue
      }
      // return still reactively bound value
      return toRef(editContentStorage.editContent.value, key, defaultValue)
    }
    // if value not found return the defaultValue
    if (!content[key]) {
      return defaultValue
    }
    return content[key]
  }

  const registerStoredContent = (key: string, storedContent: StoredContent) => {
    storedContentRegistry.value.set(key, storedContent)
  }

  const getStoredContentByKey = (key: string): StoredContent | undefined => {
    return storedContentRegistry.value.get(key)
  }

  return {
    enableCMSMode,
    getContentByKey,
    registerStoredContent,
    getStoredContentByKey,
    isCMSUser,
    editContentStorage,
    content,
  }
}
