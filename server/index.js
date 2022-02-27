import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { ALLOWED_ORIGIN, MONGODB_URI } from './config.js'
import onConnection from './socket_io/onConnection.js'
import onError from './utils/onError.js'
import upload from './utils/upload.js'
import { getFilePath } from './utils/file.js'

const app = express()

app.use(
  cors({
    origin: ALLOWED_ORIGIN
  })
)
app.use(express.json())

app.use('/upload', upload.single('file'), (req, res) => {
  const relativeFilePath = req.file.path
    .replace(/\\/g, '/')
    .split('server/files')[1]
  res.status(201).json(relativeFilePath)
})

app.use('/files', (req, res) => {
  const filePath = getFilePath(req.url)
  res.status(200).sendFile(filePath)
})

app.use(onError)

const server = createServer(app)

try {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log('🚀 Connected to DB')
} catch (e) {
  console.log(e)
}

const io = new Server(server, {
  cors: ALLOWED_ORIGIN,
  serveClient: false
})
io.on('connection', (socket) => {
  onConnection(io, socket)
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`)
})
