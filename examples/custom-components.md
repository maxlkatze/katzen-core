# Custom Components Examples

This document shows how to use the enhanced custom components with arrays, richtext, and image support.

## Basic Custom Component

```vue
<template>
  <KatzeCustomComponent
    id="hero-section"
    :schema="{
      title: { type: 'string', default: 'Welcome' },
      subtitle: { type: 'richtext', default: 'This is a subtitle' },
      image: { type: 'image', default: { src: '', alt: '' } },
      isVisible: { type: 'boolean', default: true }
    }"
  >
    <template #default="{ attributes }">
      <div v-if="attributes.isVisible" class="hero-section">
        <img :src="attributes.image.src" :alt="attributes.image.alt" />
        <h1>{{ attributes.title }}</h1>
        <div v-html="attributes.subtitle"></div>
      </div>
    </template>
  </KatzeCustomComponent>
</template>
```

## Custom Component with Arrays

```vue
<template>
  <KatzeCustomComponent
    id="feature-list"
    :is-array="true"
    :schema="{
      title: { type: 'string', default: 'Feature' },
      description: { type: 'richtext', default: 'Feature description' },
      icon: { type: 'image', default: { src: '', alt: '' } },
      tags: { type: 'array', arrayItemType: 'string', default: [] }
    }"
  >
    <template #array="{ items }">
      <div class="features-grid">
        <div 
          v-for="(item, index) in items" 
          :key="index"
          class="feature-card"
        >
          <img :src="item.attributes.icon.src" :alt="item.attributes.icon.alt" />
          <h3>{{ item.attributes.title }}</h3>
          <div v-html="item.attributes.description"></div>
          <div class="tags">
            <span 
              v-for="tag in item.attributes.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </KatzeCustomComponent>
</template>
```

## Custom Component with Complex Array Attributes

```vue
<template>
  <KatzeCustomComponent
    id="gallery"
    :schema="{
      title: { type: 'string', default: 'Photo Gallery' },
      images: { type: 'array', arrayItemType: 'image', default: [] },
      captions: { type: 'array', arrayItemType: 'richtext', default: [] },
      settings: { type: 'object', default: { columns: 3, spacing: 10 } }
    }"
  >
    <template #default="{ attributes }">
      <div class="gallery">
        <h2>{{ attributes.title }}</h2>
        <div 
          class="gallery-grid" 
          :style="{ 
            gridTemplateColumns: `repeat(${attributes.settings.columns}, 1fr)`,
            gap: `${attributes.settings.spacing}px`
          }"
        >
          <div 
            v-for="(image, index) in attributes.images" 
            :key="index"
            class="gallery-item"
          >
            <img :src="image.src" :alt="image.alt" />
            <div 
              v-if="attributes.captions[index]" 
              v-html="attributes.captions[index]"
              class="caption"
            ></div>
          </div>
        </div>
      </div>
    </template>
  </KatzeCustomComponent>
</template>
```

## Using in Composable Style

```typescript
// In your component script
import { useKatzeCustomComponent } from '~/composables/global/useComponents'

const testimonials = useKatzeCustomComponent({
  key: 'testimonials',
  isArray: true,
  schema: {
    name: { type: 'string', default: 'Anonymous' },
    quote: { type: 'richtext', default: 'Great service!' },
    avatar: { type: 'image', default: { src: '', alt: '' } },
    rating: { type: 'number', default: 5 },
    verified: { type: 'boolean', default: false }
  }
})

// testimonials will be an array of CustomComponentValue objects
```

## Available Attribute Types

- `string` - Text input
- `number` - Numeric input  
- `boolean` - Checkbox
- `richtext` - Rich text editor (HTML content)
- `image` - Image with src and alt properties
- `object` - JSON object (textarea input)
- `array` - Array of items (specify `arrayItemType`)

## Array Item Types

When using `type: 'array'`, you can specify `arrayItemType`:
- `string` - Array of strings
- `number` - Array of numbers
- `boolean` - Array of booleans
- `richtext` - Array of rich text content
- `image` - Array of image objects
- `object` - Array of JSON objects
