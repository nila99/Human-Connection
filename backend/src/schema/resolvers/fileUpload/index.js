import { createWriteStream } from 'fs'
import path from 'path'
import slug from 'slug'

const storeUpload = ({ createReadStream, fileLocation }) =>
  new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(`public${fileLocation}`))
      .on('finish', resolve)
      .on('error', reject),
  )

export default async function fileUpload(params, { file, url }, uploadCallback = storeUpload) {
  console.log('params', params)
  const upload = params[file]
  console.log('upload', upload)
  if (upload) {
    const { createReadStream, filename } = await upload
    const { name } = path.parse(filename)
    const fileLocation = `/uploads/${Date.now()}-${slug(name)}`
    await uploadCallback({ createReadStream, fileLocation })
    delete params[file]
    console.log('fileLocation', fileLocation)
    params[url] = fileLocation
  }

  return params
}
