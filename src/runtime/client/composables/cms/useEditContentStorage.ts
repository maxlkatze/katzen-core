import { createStorage, type Storage } from 'unstorage'
import localStorageDriver from 'unstorage/drivers/localstorage'
import type { ContentValue } from '../../../types/ContentTypes'
import { ref, useRuntimeConfig, computed } from '#imports'

const editContent = ref<Record<string, ContentValue>>({})

export const useEditContentStorage = () => {
  // SETUP CONTENT STORAGE => INIT WITH CONTENT FROM RUNTIME CONFIG, VERSION NUMBER INSIDE RUNTIME CONFIG

  // NEW STORAGE STATE IN LOCAL STORAGE ( UNSTORAGE )

  // GLOBAL REACTIVE EDIT CONTENT STATE

  // METHODS: COMPARE WITH RUNTIME CONFIG => GET CHANGES LIST
  // METHODS: SAVE CHANGE TO KEY => SAVE TO LOCAL STORAGE, UPDATE CONTENT STATE
  // METHODS: MERGE CHANGES => RETURNS MERGED LIST BETWEEN RUNTIME CONFIG AND LOCAL STORAGE

  const runtimeConfig = useRuntimeConfig()
  const content = runtimeConfig.public.content as Record<string, ContentValue>
  let editStorage: Storage | undefined = undefined
  const storageItemKey = 'edit-content'

  const loadContent = async () => {
    if (import.meta.client) {
      editStorage = createStorage({
        driver: localStorageDriver({ base: 'cms:' }),
      })
    }
    if (!editStorage) return
    // if storage is empty, set it to the runtime config, else merge it with the runtime config
    if (await editStorage.getItem(storageItemKey) === null) {
      await editStorage.setItem(storageItemKey, content)
    }

    const savedEditContent = await editStorage.getItem(storageItemKey) as Record<string, ContentValue>
    if (savedEditContent === null) {
      console.error('SAVED EDIT CONTENT IS NULL')
      return
    }
    // merge content from runtimeConfig into editStorage, dont replace editStorage changed content with runtimeConfig content
    editContent.value = mergedContent(content, savedEditContent)
  }

  const updateContentByKey = async (key: string, value: ContentValue) => {
    if (!editStorage) return
    editContent.value[key] = value
    await editStorage.setItem(storageItemKey, editContent.value)
  }

  // New function to revert a change back to the original content
  const revertChangeByKey = async (key: string) => {
    if (!editStorage) return

    // If the key exists in the original content, revert to that value
    if (key in content) {
      editContent.value[key] = content[key]
    }
    else {
      // If the key doesn't exist in the original content, remove it
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete editContent.value[key]
    }

    await editStorage.setItem(storageItemKey, editContent.value)
  }

  const getChanges = (
    runtimeContent: Record<string, ContentValue>,
    editContent: Record<string, ContentValue>,
  ): Record<string, ContentValue> => {
    const changes: Record<string, ContentValue> = {}

    for (const key in editContent) {
      // Add to changes if the key doesn't exist in runtime or values are not deeply equal
      if (
        !(key in runtimeContent)
        || !isDeepEqual(runtimeContent[key], editContent[key])
      ) {
        changes[key] = editContent[key]
      }
    }

    return changes
  }

  // Computed property for the current changes
  const changes = computed(() => getChanges(content, editContent.value))

  return {
    loadContent,
    getChanges,
    updateContentByKey,
    revertChangeByKey, // New function
    editContent,
    changes, // New computed property
  }
}

const mergedContent = (runtimeContent: Record<string, ContentValue>, editContent: Record<string, ContentValue>) => {
  const merged = { ...runtimeContent }
  for (const key in editContent) {
    merged[key] = editContent[key]
  }
  return merged
}

const isDeepEqual = (value1: unknown, value2: unknown): boolean => {
  // Handle primitive types or null/undefined
  if (value1 === value2) {
    return true
  }

  // If either is null/undefined or not an object, they're not equal
  if (
    typeof value1 !== 'object'
    || typeof value2 !== 'object'
    || value1 === null
    || value2 === null
  ) {
    return false
  }

  // If they're arrays, compare each element
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false
    }

    return value1.every((item, index) => isDeepEqual(item, value2[index]))
  }

  // For regular objects
  if (!Array.isArray(value1) && !Array.isArray(value2)) {
    const keys1 = Object.keys(value1)
    const keys2 = Object.keys(value2)

    if (keys1.length !== keys2.length) {
      return false
    }

    return keys1.every((key) => {
      return (
        Object.prototype.hasOwnProperty.call(value2, key)
        && isDeepEqual(
          (value1 as Record<string, unknown>)[key],
          (value2 as Record<string, unknown>)[key],
        )
      )
    })
  }

  return false
}
