import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { GoogleGenAI } from '@google/genai'
import { is } from '@electron-toolkit/utils'
import fs from 'fs'
import contextConverter from './contextConverter'
require('dotenv').config()

declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 530,
    // show: false,
    // autoHideMenuBar: true,
    closable: true,
    movable: true,
    // titleBarStyle: 'customButtonsOnHover',
    // titleBarStyle: 'hidden',
    // titleBarOverlay: {
    //   color: 'white',
    //   symbolColor: '#74b1be',
    //   height: 30
    // },

    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreenable: false,
    resizable: true,
    skipTaskbar: true, // hide from taskbar
    focusable: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.setContentProtection(true)
  // mainWindow.setBackgroundColor('#00000000')
  // mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.setAlwaysOnTop(true, 'screen-saver')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgb(178 179 181); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgb(178 179 181); }
    `)
  })

  ipcMain.on('window-drag-start', () => {
    console.log('drag started !!')
    mainWindow.webContents.send('window-drag')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  // electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  // app.on('browser-window-created', (_, window) => {
  //   optimizer.watchWindowShortcuts(window)
  // })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  //----------------------------------------------------------------------------------------

  ipcMain.on('formData', async (event, formdataTextInput, picturePath, contextObj) => {
    console.log('formdata input text:', formdataTextInput)
    console.log('formdata picture path:', picturePath)
    const previousContext = contextConverter(contextObj)
    // console.log('context:', previousContext)

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    console.log('gemini api key:', process.env.GEMINI_API_KEY)

    if (formdataTextInput && !picturePath) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        // contents: `${formdataTextInput}`
        contents: [...previousContext, { role: 'user', parts: [{ text: formdataTextInput }] }]
      })
      console.log('gemini response:', response.text)

      event.sender.send('formResponse', response.text)
    } else if (formdataTextInput && picturePath) {
      const base64ImageFile = fs.readFileSync(picturePath, {
        encoding: 'base64'
      })

      // const contents = [
      //   {
      //     inlineData: {
      //       mimeType: 'image/jpeg',
      //       data: base64ImageFile
      //     }
      //   },
      //   { text: formdataTextInput }
      // ]

      const contents = [
        ...previousContext,
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageFile
              }
            },
            {
              text: formdataTextInput
            }
          ]
        }
      ]

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents
      })
      console.log('picture response:', response.text)

      event.sender.send('formResponse', response.text)
    } else {
      event.sender.send('formResponse', 'please provide an input either text or picture!!!')
    }

    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.0-flash',
    //   contents: `${formdataTextInput}`
    // })
    // console.log(response.text)

    // event.sender.send('formResponse', response.text)
  })

  //------------------------------------------------------------------------------------------------

  createWindow()

  // app.on('activate', function () {
  //   // On macOS it's common to re-create a window in the app when the
  //   // dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
  // })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
