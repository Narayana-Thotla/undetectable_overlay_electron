import { useState } from 'react'
// import { ipcRenderer } from 'electron'
// import { ipcRenderer } from './utils/electronClientWrapper';
// const { window, ipcRenderer ,emitter} = require("electron");
import PrettyCodeDisplay from './components/prettyCodeDisplay'
import './assets/main.css'
import './../../output.css'

function App() {
  // : React.JSX.Element
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [answer, setanswer] = useState('type a question to get an answer')
  const [contextForGemini, setcontextForGemini] = useState<any>({ user: [], model: [] })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Description:', description)
    console.log('Screenshot:', screenshot)

    setcontextForGemini((prevState) => ({
      ...prevState,
      user: [...prevState.user, description]
    }))

    // console.log('contextfor gemini value:', contextForGemini)

    if (!description || !screenshot) setanswer('loading...')

    window.electron.ipcRenderer.send(
      'formData',
      description,
      screenshot?.path.toString(),
      contextForGemini
    )

    // ipcRenderer.send('formData',description);

    window.electron.ipcRenderer.once('formResponse', (event, formRes) => {
      console.log('form response form main.js file:', formRes, event)

      setanswer(formRes)
      setcontextForGemini((prevState) => ({
        ...prevState,
        model: [...prevState.model, formRes]
      }))
    })
  }

  // const handlePicture = (e) => {
  //   e.preventDefault()
  //   setScreenshot(e.target.files?.[0] || null)
  //   console.log('screenshot:', screenshot?.path)
  //   window.electron.ipcRenderer.send('picture-input', screenshot?.path)
  // }

  return (
    <>
      <div className="title-bar h-[25px] bg-[#202124] border border-gray-500 text-white flex items-center justify-between px-2 select-none">
        <div className="text-gray-200">Undetectable section!!</div>
        <div className="title-buttons">
          <button onClick={window.close}>✖</button>
        </div>
      </div>

      <div className="text-gray-400 text-2xl bg-transparent px-2 overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <label htmlFor="description" className="font-sans text-[15px] font-bold">
            Enter Question:
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Enter ur question!"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              // setcontextForGemini((prevState) => ({ ...prevState, user: e.target.value }))
            }}
            className="w-full bg-transparent rounded border-2 border-gray-500 text-[14px]  resize-y text-[rgb(205,204,204)] placeholder:text-[rgb(163,160,160)] p-1"
          />

          <span className="flex items-center justify-between gap-1 mt-1">
            <input
              type="file"
              id="screenshot"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              // onChange={handlePicture}
              className="w-[33%] p-[2px] rounded bg-transparent  text-sm text-gray-400 border border-gray-300"
            />

            <button
              type="submit"
              className="mt-2 p-[10px] w-[35%] bg-transparent text-white text-[16px] border border-gray-300 rounded-md "
            >
              Submit
            </button>
          </span>

          <label htmlFor="Answer" className="font-sans text-[15px] font-bold mt-1 block">
            Answer:
          </label>
          <div className="p-1 border-2 border-gray-500 h-[260px] overflow-y-scroll text-[rgb(181,182,187)] text-[15px] font-sans">
            {/* {answer} */}
            <PrettyCodeDisplay code={answer} />
          </div>
        </form>
      </div>
    </>
  )
}

export default App
