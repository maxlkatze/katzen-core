export interface UpdateResult {
  currentVersion: string
  latestVersion: string
}

export const updateCheck = async () => {
  const pkg = (await import('../../package.json', { assert: { type: 'json' } })
  ).default as { version: string }
  const version = pkg.version
  const https = await import('node:https')
  return new Promise<UpdateResult>((resolve) => {
    https.get('https://registry.npmjs.org/@maxlkatze/cms/latest', (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        const latestVersion = JSON.parse(data).version
        if (version !== latestVersion) {
          resolve({
            currentVersion: version,
            latestVersion,
          })
        }
      })
    })
  })
}
