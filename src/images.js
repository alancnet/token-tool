const images = {}
const loadImage = url => {
  if (!images[url]) {
    images[url] = fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob)
        return new Promise((resolve, reject) => {
          const img = document.createElement('img')
          img.addEventListener('load', () => {
            resolve({
              objectUrl,
              width: img.naturalWidth,
              height: img.naturalHeight
            })
          })
          img.src = objectUrl
        })
      })
      
  }
  return images[url]
}

module.exports = { loadImage }