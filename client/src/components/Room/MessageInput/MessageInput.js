import fileApi from 'api/file.api'
import { USER_KEY } from 'constants'
import useStore from 'hooks/useStore'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import storage from 'utils/storage'
import EmojiMart from './EmojiMart/EmojiMart'
import FileInput from './FileInput/FileInput'
import Recorder from './Recorder/Recorder'

export default function MessageInput({ sendMessage }) {
  const user = storage.get(USER_KEY)
  const { file, setFile, showPreview, setShowPreview } = useStore(
    ({ file, setFile, showPreview, setShowPreview }) => ({
      file,
      setFile,
      showPreview,
      setShowPreview
    })
  )
  const [text, setText] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(true)
  const inputRef = useRef()

  useEffect(() => {
    setSubmitDisabled(!text.trim() && !file)
  }, [text, file])

  useEffect(() => {
    setShowPreview(file)
  }, [file, setShowPreview])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitDisabled) return

    const { userId, userName, roomId } = user
    let message = {
      messageId: nanoid(),
      userId,
      userName,
      roomId
    }

    if (!file) {
      message.messageType = 'text'
      message.textOrPathToFile = text
    } else {
      const path = await fileApi.upload({ file, roomId })
      const type = file.type.split('/')[0]

      message.messageType = type
      message.textOrPathToFile = path
    }

    sendMessage(message)

    setText('')
    setFile(null)
  }

  return (
    <form onSubmit={onSubmit} className='form message'>
      <EmojiMart setText={setText} messageInput={inputRef.current} />
      <FileInput />
      <Recorder />
      <input
        type='text'
        autoFocus
        placeholder='Message...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        ref={inputRef}
        disabled={showPreview}
      />
      <button className='btn' disabled={submitDisabled} type='submit'>
        <FiSend className='icon' />
      </button>
    </form>
  )
}
