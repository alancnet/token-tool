import express from 'express'
import index from './index.js'
const app = express()

index(app)

app.use(express.static('dist'))

app.listen(80)