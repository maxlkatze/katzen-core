import { type ContentDefinition, ContentType, type StoredContent, type CustomComponentDefinition, type CustomComponentArrayValue } from '../../../types/ContentTypes'
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

export const useKatzeCustomComponent = (options: CustomComponentDefinition) => {
  const contentSource = useContentSource()

  if (options.isArray) {
    // Handle array of custom components
    // Default should be an array of plain objects that match the schema
    const defaultArrayValue: CustomComponentArrayValue = Array.isArray(options.default)
      ? options.default as Record<string, unknown>[]
      : options.default
        ? [options.default as Record<string, unknown>]
        : [generateDefaultAttributes(options.schema)]

    const storedContent: StoredContent = {
      type: ContentType.CustomComponent,
      options,
      content: contentSource.getContentByKey(options.key, defaultArrayValue),
    }

    // Register the stored content so the editor can access schema
    contentSource.registerStoredContent(options.key, storedContent)

    return storedContent.content
  }
  else {
    // Handle single custom component
    // For single components, default should be a plain object
    const defaultValue: Record<string, unknown> = (options.default as Record<string, unknown>) || generateDefaultAttributes(options.schema)

    const storedContent: StoredContent = {
      type: ContentType.CustomComponent,
      options,
      content: contentSource.getContentByKey(options.key, defaultValue),
    }

    // Register the stored content so the editor can access schema
    contentSource.registerStoredContent(options.key, storedContent)

    return storedContent.content
  }
}

// Helper function to generate default attributes from schema
function generateDefaultAttributes(schema: Record<string, { type: string, arrayItemType?: string, default: unknown }>): Record<string, unknown> {
  const attributes: Record<string, unknown> = {}

  for (const [key, attribute] of Object.entries(schema)) {
    if (attribute.type === 'array') {
      // For arrays, create an empty array or use default
      attributes[key] = attribute.default || []
    }
    else if (attribute.type === 'image') {
      // For images, create default image object
      attributes[key] = attribute.default || { src: '', alt: '' }
    }
    else if (attribute.type === 'richtext') {
      // For richtext, create default empty string
      attributes[key] = attribute.default || ''
    }
    else {
      attributes[key] = attribute.default
    }
  }

  return attributes
}
