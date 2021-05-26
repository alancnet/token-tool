import Jimp from 'jimp'
import { createMask } from '../server/image-processing.js'
import fs from 'fs'
import path from 'path'

async function main() {
  const directories = (await fs.promises.readdir('assets/frames', {withFileTypes: true})).filter(x => x.isDirectory())
  for (const directory of directories) {
    const collection = {
      name: directory.name,
      frames: []
    }
    const files = (await fs.promises.readdir(path.join('assets/frames', directory.name), {withFileTypes: true}))
    const frames = {}
    for (const file of files) {
      if (file.name.endsWith(' .png')) {
        const newName = file.name.split(' .png').join('.png')
        fs.renameSync(path.join('assets/frames', directory.name, file.name), path.join('assets/frames', directory.name, newName))
        file.name = newName
      }
      if (file.name.endsWith('.png') && !file.name.startsWith('mask-') && !file.name.startsWith('overlay-')) {
        const newName = 'overlay-' + 
          file.name
            .split('_').join(' ')
            .split('Frame.png').join('.png')
        fs.renameSync(path.join('assets/frames', directory.name, file.name), path.join('assets/frames', directory.name, newName))
        file.name = newName
      }
      const [type, ...nameParts] = file.name.split('.').reverse().slice(1).reverse().join('.').split('-')
      const name = nameParts.join('-')
      if (type === 'overlay') {
        const overlayFilename = path.join('assets/frames', directory.name, file.name)
        const maskFilename = path.join('assets/frames', directory.name, 'mask-' + name + '.png')
        if (!fs.existsSync(maskFilename)) {
          const image = await Jimp.read(overlayFilename)
          const mask = createMask(image)
          await mask.writeAsync(maskFilename)
        }
      }
      if (['mask', 'overlay'].includes(type)) {
        if (!frames[name]) frames[name] = {name}
        frames[name][type] = path.join('assets/frames', directory.name, file.name)
      }
      // } else {
      //   const name = file.name.split('.').reverse().slice().reverse().join('.')
      //   frames[name][overlay] = path.join('assets/frames', directory.name, file.name)
      // }
    }
  }
  const image = await Jimp.read('assets/frames/Decorated/overlay-Leaves.png')
  const mask = createMask(image)
  mask.write('test/output.png')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})