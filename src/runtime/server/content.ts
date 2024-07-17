//config file is located at project root/content.katze.json

import {defineEventHandler, readBody, useRuntimeConfig} from '#imports';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import katze_content_path from '../../path';

export default defineEventHandler(async (event) => {
  //get content
  //if file doesnt exist, create it and put empty json
  if (!fs.existsSync(katze_content_path)) {
    fs.writeFileSync(katze_content_path, '{}');
  }
  let saved_content: {};
  saved_content = JSON.parse(fs.readFileSync(katze_content_path, 'utf8'))

  const body = await readBody(event) || {}
  const token = body.token || ''
  const action = body.action || ''
  const content = body.content || ''
  if (token && action=='save') {
    const verify = jwt.verify(token, useRuntimeConfig().secret)
    if (!verify) {
      return {
        success: false,
        body: {
          message: 'Invalid token',
        },
      }
    }
    if(!content) {
      return {
        success: false,
        body: {
          message: 'No content provided',
        },
      }
    }
    //add or replace content inside content
    //merge data with content
    saved_content = {...content, ...content}
    fs.writeFileSync(katze_content_path, JSON.stringify(saved_content, null, 2));

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
