# Katze CMS - A Nuxt Module Headless CMS

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

![CmsKatze](/src/runtime/client/assets/logo_outlines.svg)

- [✨ Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/maxlkatze/cms-katze?file=playground%2Fapp.vue)

## Description
Katze is a Nuxt module that provides a headless CMS for your Nuxt app.
Edit content directly in your Nuxt App, store your content in an [Unstorage](https://unstorage.unjs.io/) supported storage
and deploy your content to the Edge or host it on your server.


_Feel free to contribute to this project by creating a pull request.🐱❤️_

## Features

- 📝 &nbsp;Edit content in your Nuxt app with /cms
- 🚀 &nbsp;Unstorage KV storage for edge deployment
- 🎨 &nbsp;Customisable content blocks (text, rich text, image)
- 📦 &nbsp;Easy to set up and use, just one configuration file

1. Install using one of the following package managers:
   - NPM: `npm install @maxlkate/cms@latest`
   - Yarn: `yarn add @maxlkate/cms@latest`
   - PNPM: `pnpm add @maxlkate/cms@latest`
   - Bun: `bun install @maxlkate/cms@latest`
2. Add `@maxlkatze/cms` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    '@maxlkatze/cms'
  ]
}
```

That's it! You can now use CmsKatze in your Nuxt app ✨

## Usage

Following Route is now available in your Vue app:
'/cms/dashboard' - The CMS Dashboard
![CmsKatze](/documentation/cms_dashboard.jpg)

### Understanding Editable Routes
Every route in your Nuxt Router is displayed in the CMS editor
![Edit Pages](/documentation/cms_page_edit.jpg)

## Component-Based Usage

### KatzeText Component
Simple text editing for headlines, paragraphs, and other text elements:

```vue
<template>
  <KatzeText
    id="hero_title"
    element="h2"
    class="text-4xl font-extrabold text-gray-900"
    default-content="The future of content editing is here"
  />
</template>
```

### KatzeRichText Component
Rich text editing with HTML support:

```vue
<template>
  <KatzeRichText
    id="example_rich_text"
    default-content="<p>This is <strong>rich text</strong> that supports <em>formatting</em>, <u>underlining</u>, and even <a href='#'>links</a>!</p>"
    class="prose max-w-none"
  />
</template>
```

### KatzeImage Component
Easy image management with on-the-fly replacements:

```vue
<template>
  <KatzeImage
    id="example_image"
    default-src="/test.svg"
    default-alt="Example image that can be replaced"
    class="max-w-md rounded-lg shadow-md"
  />
</template>
```

## Composable-Based Usage

### Editable Components
In addition to the component approach, you can define editable items using composables within your Vue component.

#### The importance of the kat-e attribute
The kat-e attribute is used to define the key of the editable element.
The CMS editor uses this key to identify the element and display its correct position and type.

#### Plain Text Component
```vue
<script setup lang="ts">
  const buttonText = useKatzeText({ key: 'buttonText', default: 'defaultValue' });
</script>

<template>
  <button kat-e="buttonText">{{ buttonText }}</button>
</template>
```

#### Rich Text Component
```vue
<script setup lang="ts">
  const richText = useKatzeRichText({ key: 'richText', default: 'defaultValue' });
</script>

<template>
  <p
    class="text-2xl min-size-5"
    kat-e="richText"
  >
    <katze-rich-text :content="richText" />
  </p>
</template>
```
##### The katze-rich-text component
The katze-rich-text component, unlike v-html, allows content to be rendered on the server and client at the same time.
This is important for SEO and performance reasons.

#### Image Component
```vue
<script setup lang="ts">
  const image = useKatzeImage({ key: 'image' });
</script>

<template>
  <img
    kat-e="image"
    class="size-52"
    :src="image.src"
    :alt="image.alt"
  />
</template>
```

## Configuration

You can configure Katze by adding the `katze` key to `nuxt.config.js`

```js
 katze: {
  // Configuration
  users: [
    {
      name: 'your secret name', // default: "admin"
      password: 'your secret password', // default: "admin"
    },
  ],
  secret: 'your secret key for token encryption',
  projectLocation: './', // default: "./"
  storage: {
    type: 'fs', // default: "fs" | Unstorage Types supported
    options: {
      // UNSTORAGE OPTIONS
    }
  },
  storageKey: 'storageKey', //default: "content.katze.json" | The key to store the content in the storage
  deployHookURL: 'https://yourdeployhookurl.com' // default: ""
}
```
#### Users
The default user is `admin` with the password `admin`.

#### Secret
The secret is used to encrypt the Login token for the CMS editor.

#### Project Location
The project location is used to store the content.katze.json fileand to locate the public folder.

#### Storage
You can configure storage with unstorage drivers.

#### Storage Key
The key for the content value inside the storage. Can be left as default, when using storages with a base prefix.

##### Supported Unstorage Drivers
- azure-app-configuration - [Documentation](https://unstorage.unjs.io/drivers/azure)
- cloudflare-kv-binding - [Documentation](https://unstorage.unjs.io/drivers/cloudflare)
- fs - [Documentation](https://unstorage.unjs.io/drivers/fs)
- github - [Documentation](https://unstorage.unjs.io/drivers/github)
- mongodb - [Documentation](https://unstorage.unjs.io/drivers/mongodb)
- netlify-blobs - [Documentation](https://unstorage.unjs.io/drivers/netlify)
- planetscale - [Documentation](https://unstorage.unjs.io/drivers/planetscale)
- redis - [Documentation](https://unstorage.unjs.io/drivers/redis)
- vercel-kv - [Documentation](https://unstorage.unjs.io/drivers/vercel)

Storage implementation example:
```js
storage: {
  type: 'fs',
  options: {
    base: './',
  }
}
```
#### Deploy Hook URL
The deploy hook URL is used to trigger a deploy when publishing content.
(Simple GET Request to the URL)

## Contribution

1. Clone this repository
2. Install dependencies using `bun install`
3. Generate type stubs using `bun dev:prepare`
4. Develop with the playground using `bun dev`

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  bun install
  
  # Generate type stubs
  bun run dev:prepare
  
  # Develop with the playground
  bun run dev
  
  # Build the playground
  bun run dev:build
  
  # Run ESLint
  bun run lint
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@maxlkatze/cms/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@maxlkatze/cms

[npm-downloads-src]: https://img.shields.io/npm/dm/@maxlkatze/cms.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/@maxlkatze/cms

[license-src]: https://img.shields.io/npm/l/@maxlkatze/cms.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@maxlkatze/cms

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
