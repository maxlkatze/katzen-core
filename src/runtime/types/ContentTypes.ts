import type { Ref } from 'vue'
// CODE DEFINITIONS
export type ContentDefinition = {
  key: string
  default: ContentValue
}

export type ContentImage = {
  src: string
  alt: string
}

// CUSTOM COMPONENT TYPES
export type CustomComponentAttribute = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'richtext' | 'image' | 'array'
  arrayItemType?: 'string' | 'number' | 'boolean' | 'object' | 'richtext' | 'image' // For array types
  default: unknown
}

export type CustomComponentContentType = string | number | boolean | Record<string, unknown> | ContentImage

export type CustomComponentSchema = {
  [key: string]: CustomComponentAttribute
}

// For arrays, we store the content as plain array of objects
export type CustomComponentArrayValue = Record<string, unknown>[]

export type CustomComponentDefinition = {
  key: string
  schema: CustomComponentSchema
  default?: Record<string, unknown> | Record<string, unknown>[] // Single object or array of objects
  isArray?: boolean // Whether this custom component should be an array of items
}

// CONTENT TYPES
export enum ContentType {
  Text = 'text',
  RichText = 'richText',
  Image = 'image',
  CustomComponent = 'customComponent',
}

export type StoredContent = {
  type: ContentType
  options: ContentDefinition | CustomComponentDefinition
  content: ContentValue | Ref<ContentValue>
}

export type ContentValue = string | ContentImage | Record<string, unknown> | CustomComponentArrayValue
