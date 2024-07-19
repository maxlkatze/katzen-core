<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: CmsKatze
- Package name: cms-katze
- Description: An easy to setup in APP CMS
-->

# CmsKatze

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

![CmsKatze](/src/runtime/assets/logo.svg)

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/cms-katze?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- 📝 &nbsp;In app CMS editor for easy content management
- 🎨 &nbsp;Customizable content blocks
- 📦 &nbsp;Easy to setup and use

## Quick Setup

1. Add `cms-katze` dependency to your project
2. Add `cms-katze` to the `modules` section of `nuxt.config.js`
3. Use the CMS editor in your app and implement the content blocks

```bash
npx nuxi module add cms-katze
```

That's it! You can now use CmsKatze in your Nuxt app ✨


## Contribution

1. Clone this repository
2. Install dependencies using `pnpm install`
3. Generate type stubs using `pnpm dev:prepare`
4. Develop with the playground using `pnpm dev`

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
  
  # Release new version
  npm run release
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
