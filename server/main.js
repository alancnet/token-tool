import express from 'express'
import index from './index.js'
import mw from 'http-proxy-middleware'
const app = express()

index(app)

if (process.env.PROXY_URL) {
    app.use(mw.createProxyMiddleware(process.env.PROXY_URL))
}
app.use(express.static('dist'))

app.listen(process.env.PORT || 80)