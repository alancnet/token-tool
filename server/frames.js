import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

export async function getLibrary() {
  const library = {
    collections: [
      {
        name: 'string',
        frames: [
          {
            name: 'string',
            maskPath: 'string',
            overlayPath: 'string',
            mask: {},
            overlay: {},
            thumbnail: Buffer.alloc(0)
          }
        ]
      }
    ].filter(() => 0)
  }

  const directories = (await fs.promises.readdir('assets/frames', {withFileTypes: true})).filter(x => x.isDirectory())
  for (const directory of directories) {
    const collection = {
      name: directory.name,
      frames: []
    }
    const files = (await fs.promises.readdir(path.join('assets/frames', directory.name), {withFileTypes: true}))
    const frames = {}
    for (const file of files) {
      const [type, name] = file.name.split('.').reverse().slice(1).reverse().join('.').split('-')
      if (['mask', 'overlay'].includes(type)) {
        if (!frames[name]) frames[name] = {name}
        frames[name][type] = path.join('assets/frames', directory.name, file.name)
      }
    }
    const framesArray = Object.values(frames).filter(x => x.mask && x.overlay)
    for (const frame of framesArray) {
      const mask = await Jimp.read(frame.mask)
      const overlay = await Jimp.read(frame.overlay)
      collection.frames.push({
        name: frame.name,
        maskPath: frame.mask,
        overlayPath: frame.overlay,
        mask,
        overlay,
        thumbnail: await overlay.clone().resize(64, 64, Jimp.RESIZE_BICUBIC).getBufferAsync(Jimp.MIME_PNG)
      })
    }
    library.collections.push(collection)
  }
  return library
}

const scan = async (dir, collection) => {
  const entries = await fs.promises.readdir(dir, {withFileTypes: true})
  const files = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const child = {
        name: entry.name
      }
      if (!collection.collections) collection.collections = []
      collection.collections.push(child)
      await scan(path.join(dir, entry.name), child)
    }
    if (entry.isFile()) files.push(entry)
  }
  const frames = {}
  for (const file of files) {
    const [type, name] = file.name.split('-')
    if (['mask', 'overlay'].includes(type)) {
      if (!frames[name]) frames[name] = {name}
      frames[name][type] = path.join(dir, file.name)
    }
  }
  const framesArray = Object.values(frames).filter(x => x.mask && x.overlay)
  if (framesArray.length) collection.frames = framesArray
  return collection
}
const root = {
  name: 'Frames'
}

const init = async () => {
  const library = {
    collections: []
  }
  const files = await scan('./assets', root)
  for (const fileCollection of files.collections) {
    const collection = {
      name: fileCollection.name
    }
    for (const fileFrame of fileCollection.frames) {
      
    }
  }
}
