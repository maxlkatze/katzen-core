<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: CmsKatze
- Package name: cms-katze
- Description: An easy to setup in APP CMS
-->

# CmsKatze - A Nuxt Module CMS

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

![CmsKatze](/src/runtime/assets/logo.svg)

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/cms-katze?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Warning
In active development, not ready for production use.
The content.katze.json is not being synced with Git LFS or Git

_Feel free to contribute to this project by creating a pull request.🐱❤️_

## Features

- 📝 &nbsp;In app CMS editor for easy content management
- 🎨 &nbsp;Customizable content blocks
- 📦 &nbsp;Easy to setup and use

## Quick Setup

1. Install using: `npm install @maxlkate/cms@latest`
2. Add `@maxlkate/cms` to the `modules` section of `nuxt.config.js`

```js
{
  modules: [
    '@maxlkate/cms'
  ]
}
```

That's it! You can now use CmsKatze in your Nuxt app ✨

## Usage

Following Route is now available in your Vue app:
'/cms' - The CMS editor
![CmsKatze](/documentation/cms_showcase.png)

### Understanding Editable Routes
Every Route inside your Nuxt Router is displayed in the CMS editor.
Currently there is no way to hide away any Routes.
![Edit Pages](/documentation/pages_showcase.png)

### Editable Components
By defining a Composable inside your Vue Component, you can define an editable entry.

#### The importance of the e-kat attribute
The e-kat attribute is used to define the key of the editable element.
The CMS editor uses this key to identify the element and display correct positions and types.

#### Plain Text Component
```vue
<script setup lang="ts">
  const buttonText = useKatzeText( { key: 'buttonText' } );
</script>

<template>
  <button e-kat="buttonText">{{ buttonText }}</button>
</template>
```

#### Rich Text Component
```vue
<script setup lang="ts">
  const richText = useKatzeRichText( { key: 'richText' } );
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
The katze-rich-text component different then v-html allows the Content to be rendered on the server and client at the same time.
This is important for SEO and performance reasons.

#### Image Component
```vue
<script setup lang="ts">
  const image = useKatzeImage( { key: 'image' } );
</script>

<template>
  <img
    e-kat="image"
    class="size-52"
    :src="image.src"
    :alt="image.alt"
  />
</template>
```

## Configuration

You can configure Katze by adding the `katzenCore` key to `nuxt.config.js`

```js
 katzenCore: {
  // Configuration
  users: [
    {
      name: 'your secret name', // default: "admin"
      password: 'your secret password', // default: "admin"
    },
  ],
    secret: 'your secret key for token encryption',
    projectLocation: './', // default: "./"
}
```
#### Users
Users are used to authenticate the CMS editor. The default user is `admin` with the password `admin`.

#### Secret
The secret is used to encrypt the Login token for the CMS editor.

#### Project Location
The project location is used to store the content.katze.json fileand to locate the public folder.


## Contribution

1. Clone this repository
2. Install dependencies using `npm install`
3. Generate type stubs using `npm dev:prepare`
4. Develop with the playground using `npm dev`

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
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
