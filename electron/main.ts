import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import { spawn } from 'node:child_process'
// import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { execa } from 'execa'
import type {ExecaChildProcess} from 'execa'

process.env.DIST = path.join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let mainWindow: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  mainWindow = null
})


let projectDir = ''
let projectPath = ''
let projectRunThread: ExecaChildProcess<string> | undefined
app.whenReady().then(() => {
  createWindow()
  ipcMain.handle('project:dir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '选择项目所在位置',
      buttonLabel: '确认',
      properties: ["openDirectory"]
    })
    if (canceled) return
    projectDir = filePaths[0]
    return projectDir
  })
  ipcMain.handle('project:create', (event: Electron.IpcMainInvokeEvent, projectName: string, type: 'vue' | 'react') => {
    console.log(event.target)
    const cmdMap = {
      'vue': `yarn create vite ${projectName} --template vue-ts`,
      'react': `yarn create vite ${projectName} --template react-ts`
    }
    projectPath = path.resolve(projectDir, projectName)
    const thread = spawn(`cd ${path.resolve(projectDir)} && ${cmdMap[type]}`, {
      shell: true
    })

    thread.stderr.on('data', (data) => {
      mainWindow?.webContents.send('project:log', data.toString())
      console.log('error data', data.toString('utf8'));
    })

    thread.stdout.on('data', (data: Buffer) => { 
      mainWindow?.webContents.send('project:log', data.toString())
      console.log(data.toString())
    })

    thread.on('exit', () => {
      mainWindow?.webContents.send('project:log', 'project created')
      console.log('terminal already exited')
    })

    thread.stdout.on('end', () => {
      console.log('project created end')
    })
  })
  ipcMain.handle('project:installDep', () => {
    const thread = spawn(`cd ${projectPath} && npm i`, {
      shell: true
    })

    thread.stderr.on('data', (data) => {
      console.log('error data', data, data.toString('utf8'));
      mainWindow?.webContents.send('project:log', data.toString())
    })

    thread.stdout.on('error', (err: Error) => {
      console.log('stdout error', err)
      mainWindow?.webContents.send('project:log', err.toString())
    })

    thread.on('error', (err: Error) => {
      console.log('error ===>', err)
      mainWindow?.webContents.send('project:log', err.toString())
    })

    thread.stdout.on('data', (data: Buffer) => {
      mainWindow?.webContents.send('project:log', data.toString())
      console.log(data.toString())
    })

    thread.on('exit', () => {
      mainWindow?.webContents.send('project:log', 'dependency installed')
      console.log('terminal already exited')
    })

    thread.stdout.on('end', () => {
      console.log('end')
    })
  })
  ipcMain.handle('project:run', () => {
    const thread = execa(`cd ${projectPath} && yarn dev`, {
      shell: true
    })
    // const thread = spawn(`cd ${projectPath} && yarn dev`, {
    //   shell: true
    // })

    projectRunThread = thread

    thread.stderr?.on('data', (data) => {
      console.log('error data ====> ', data.toString());
      mainWindow?.webContents.send('project:log', data.toString())
    })

    thread.stdout?.on('error', (err: Error) => {
      console.log('stdout error', err)
      mainWindow?.webContents.send('project:log', err.toString())
    })

    thread.on('error', (err: Error) => {
      console.log('error ===>', err)
      mainWindow?.webContents.send('project:log', err.toString())
    })

    thread.stdout?.on('data', (data: Buffer) => {
      mainWindow?.webContents.send('project:log', data.toString())
      console.log(data.toString())
    })

    thread.on('exit', () => {
      mainWindow?.webContents.send('project:log', 'project running exited')
      console.log('terminal already exited')
    })

    thread.stdout?.on('end', () => {
      console.log('end')
    })
  })

  ipcMain.handle('project:exited', () => {
    killTemplateProcess(projectRunThread)
    console.log('killed')
  })
})

function killTemplateProcess(thread?: ExecaChildProcess<string>) {
  if (!thread) {
    return
  }
  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', thread.pid!.toString(), '/T', '/F'], { shell: true });
  } else {
    thread.kill('SIGTERM');
  }
} 