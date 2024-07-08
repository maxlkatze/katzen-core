import fs from 'node:fs'

export default defineEventHandler(() => {
  // load pages list
  const pages = fs.readdirSync('src/pages')
  console.log('Pages:', pages)

  // page array and return
  const pageArray = []
  pages.forEach((page) => {
    pageArray.push(page)
  })

  return {
    pages: pageArray,
  }
})
