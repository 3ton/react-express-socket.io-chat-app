import useStore from 'hooks/useStore'
import { useRef, useState } from 'react'
import { BsFillPauseFill, BsFillPlayFill, BsFillStopFill } from 'react-icons/bs'
import {
  audioConstraints,
  isRecordStarted,
  pauseRecording,
  resumeRecording,
  startRecording,
  stopRecording,
  videoConstraints
} from 'utils/recording'

export default function Modal({ setShowModal }) {
  const setFile = useStore(({ setFile }) => setFile)
  const [constraints, setConstraints] = useState(audioConstraints)
  const [recording, setRecording] = useState(false)
  const selectBlockRef = useRef()
  const videoRef = useRef()

  const onChange = ({ target: { value } }) => {
    if (value === 'audio') {
      return setConstraints(audioConstraints)
    }
    setConstraints(videoConstraints)
  }

  const pauseResume = () => {
    if (recording) {
      pauseRecording()
    } else {
      resumeRecording()
    }
    setRecording(!recording)
  }

  const start = async () => {
    if (isRecordStarted()) {
      return pauseResume()
    }

    const stream = await startRecording(constraints)

    setRecording(true)

    selectBlockRef.current.style.display = 'none'

    if (constraints['video'] && stream) {
      videoRef.current.style.display = 'block'
      videoRef.current.srcObject = stream
    }
  }

  const stop = () => {
    const file = stopRecording()

    setRecording(false)

    setFile(file)

    setShowModal(false)
  }

  return (
    <div
      className='overlay'
      onClick={(e) => {
        if (e.target.className !== 'overlay') return
        setShowModal(false)
      }}
    >
      <div className='modal'>
        <div ref={selectBlockRef}>
          <h2>Select type</h2>
          <select onChange={onChange}>
            <option value='audio'>Audio</option>
            <option value='video'>Video</option>
          </select>
        </div>

        {isRecordStarted() && <p>{recording ? 'Recording...' : 'Paused'}</p>}

        <video ref={videoRef} autoPlay />

        <div className='controls'>
          <button className='btn play' onClick={start}>
            {recording ? (
              <BsFillPauseFill className='icon' />
            ) : (
              <BsFillPlayFill className='icon' />
            )}
          </button>
          {isRecordStarted() && (
            <button className='btn stop' onClick={stop}>
              <BsFillStopFill className='icon' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
