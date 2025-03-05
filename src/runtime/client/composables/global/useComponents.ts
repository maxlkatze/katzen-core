import { type ContentDefinition, ContentType, type StoredContent } from '../../../types/ContentTypes'
import { useContentSource } from '../cms/useContentSource'

export const useKatzeText = (options: ContentDefinition) => {
  const contentSource = useContentSource()
  const storedContent: StoredContent = { type: ContentType.Text, options, content: contentSource.getContentByKey(options.key, options.default) }
  return storedContent.content
}

export const useKatzeRichText = (options: ContentDefinition) => {
  const contentSource = useContentSource()
  const storedContent: StoredContent = { type: ContentType.RichText, options, content: contentSource.getContentByKey(options.key, options.default) }
  return storedContent.content
}

export const useKatzeImage = (options: ContentDefinition) => {
  const contentSource = useContentSource()
  const storedContent: StoredContent = { type: ContentType.Image, options, content: contentSource.getContentByKey(options.key, options.default) }
  return storedContent.content
}
