import Jimp from 'jimp'

/**
 * 
 * @param {Jimp} image 
 * @param {number} x
 * @param {number} y 
 * @param {number} color
 * @returns {Jimp}
 */
 function paintBucket (image, x, y, color) {
  const coords = [[x,y]]
  while (coords.length) {
    const [x, y] = coords.pop()
    const oldColor = image.getPixelColor(x, y)
    if (color === oldColor) continue
    image.setPixelColor(color, x, y)
    //checks to see if there is a cell to the left of xy
    if (x > 0) {
      const leftCell = image.getPixelColor(x - 1, y)
      //checks to see if the cell to the left is the same color as the oldFillColor
      if (leftCell === oldColor){
        coords.push([x - 1, y])
      }
    }
    //checks to see if there is a cell to the right of the xy
    if (x < image.getWidth()) {
      const rightCell = image.getPixelColor(x + 1, y)
      //checks to see if the cell to the right is the same color as oldFillColor
      if (rightCell === oldColor){
        coords.push([x + 1, y])
      }
    }
    //checks to see if there is a cell above the xy
    if (y > 0) {
      const topCell = image.getPixelColor(x, y - 1)
      //checks to see if the cell above is the same color as the oldFillColor
      if (topCell === oldColor) {
        coords.push([x, y - 1])
      }
    }
    //checks to see if there is a cell below the xy
    if (y < image.getHeight()) {
      const bottomCell = image.getPixelColor(x, y + 1)
      //checks to see if the cell below the xy is the same color as oldFillColor
      if (bottomCell === oldColor) {
        coords.push([x, y + 1])
      }
    }
  }
}

/**
 * 
 * @param {Jimp} overlay 
 */
export function createMask (overlay) {
  const Jimp = overlay.constructor
  const image = new Jimp(overlay.getWidth() + 2, overlay.getHeight() + 2)
  image.blit(overlay, 1, 1)
  
  const magenta = Jimp.rgbaToInt(255, 0, 255, 255)
  const transparent = Jimp.rgbaToInt(0, 0, 0, 0)
  let maxAlpha = 0
  image.scan(0,0,image.getWidth(), image.getHeight(), function(x, y, idx) {
    maxAlpha = Math.max(maxAlpha, Jimp.intToRGBA(this.getPixelColor(x, y)).a)
  })
  image.scan(0,0,image.getWidth(), image.getHeight(), function(x, y, idx) {
    const color = Jimp.intToRGBA(this.getPixelColor(x, y))
    const newColor = (color.a >= maxAlpha / 2) ? magenta : transparent
    this.setPixelColor(newColor, x, y)    
  })
  paintBucket(image, 0, 0, magenta)
  image.crop(1, 1, overlay.getWidth(), overlay.getHeight())
  return image
}
