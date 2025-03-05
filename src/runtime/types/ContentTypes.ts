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

// CONTENT TYPES
export enum ContentType {
  Text = 'text',
  RichText = 'richText',
  Image = 'image',
}

export type StoredContent = {
  type: ContentType
  options: ContentDefinition
  content: ContentValue | Ref<ContentValue>
}

export type ContentValue = string | ContentImage
