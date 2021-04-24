import express from 'express'
import { getLibrary } from './frames.js'
// import socketIO from "socket.io";
export default (app, http) => {
  let library
  let loading = Promise.all([
    getLibrary().then(x => {
      console.log(`  📚 Library loaded`)
      library = x
    })
  ])

  app.use((req, res, next) => loading.then(() => next(), err => next(err)))
  
  app.use(express.json())

  app.use('/assets', express.static('assets'))
  app.get('/library', async (req, res) => {
    res.json({
      collections: library.collections.map(collection => ({
        name: collection.name,
        frames: collection.frames.map(frame => ({
          name: frame.name,
          maskPath: frame.maskPath,
          overlayPath: frame.overlayPath,
          thumbnailPath: `thumbnails/${collection.name}/${frame.name}.png`
        }))
      }))
    })
  })
  app.get('/thumbnails/:collectionName/:frameName.png', (req, res) => {
    res.type('png')
    res.send(library.collections.find(x => x.name === req.params.collectionName).frames.find(x => x.name === req.params.frameName).thumbnail)
  })
  //
  // app.post('/bar', (req, res) => {
  //   res.json(req.body);
  // });
  // 
  // optional support for socket.io
  // 
  // let io = socketIO(http);
  // io.on("connection", client => {
  //   client.on("message", function(data) {
  //     // do something
  //   });
  //   client.emit("message", "Welcome");
  // });
}
