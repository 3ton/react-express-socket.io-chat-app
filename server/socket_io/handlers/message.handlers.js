import Message from '../../models/message.model.js'
import { removeFile } from '../../utils/file.js'

const messages = {}

export default function messageHandlers(io, socket) {
  const { roomId } = socket

  const updateMessageList = () => {
    io.to(roomId).emit('message_list:update', messages[roomId])
  }

  socket.on('message:get', async () => {
    const _messages = await Message.find()
    messages[roomId] = _messages

    updateMessageList()
  })

  socket.on('message:add', async (message) => {
    const _message = await Message.create(message)

    messages[roomId].push(_message)

    updateMessageList()
  })

  socket.on('message:remove', async (message) => {
    const { messageId, messageType, textOrPathToFile } = message

    Message.deleteOne({ messageId }).then(() => {
      if (messageType !== 'text') {
        removeFile(textOrPathToFile)
      }
    })

    messages[roomId] = messages[roomId].filter((m) => m.messageId !== messageId)

    updateMessageList()
  })
}
