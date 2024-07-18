// config file is located at project root/content.katze.json

import fs from 'node:fs'
import jwt from 'jsonwebtoken'
import katze_content_path from '../../path'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const contentPath = runtimeConfig.projectLocation + katze_content_path
  // get content
  // if file doesnt exist, create it and put empty json
  if (!fs.existsSync(contentPath)) {
    fs.writeFileSync(contentPath, '{}')
  }
  let saved_content = JSON.parse(fs.readFileSync(contentPath, 'utf8'))

  const body = await readBody(event) || {}
  const token = body.token || ''
  const action = body.action || ''
  const content = body.content || ''
  if (token && action == 'save') {
    const verify = jwt.verify(token, runtimeConfig.secret)
    if (!verify) {
      return {
        success: false,
        body: {
          message: 'Invalid token',
        },
      }
    }
    if (!content) {
      return {
        success: false,
        body: {
          message: 'No content provided',
        },
      }
    }
    // add or replace content inside content
    // merge data with content
    saved_content = { ...saved_content, ...content }
    fs.writeFileSync(contentPath, JSON.stringify(saved_content, null, 2))

    return {
      success: true,
      body: {
        message: 'Content saved',
      },
    }
  }

  return {
    success: true,
    body: {
      message: 'Content fetched',
      content: saved_content,
    },
  }
})
