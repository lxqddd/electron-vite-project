import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electronApi', {
  selectProjectDir: () => ipcRenderer.invoke('project:dir'),
  createProject: (projectName: string, type: 'vue' | 'react') => ipcRenderer.invoke('project:create', projectName, type),
  installProjectDependency: () => ipcRenderer.invoke('project:installDep'),
  runProject: () => ipcRenderer.invoke('project:run'),
  exitedProject: () => ipcRenderer.invoke('project:exited'),
  projectLogs: (cb: (event: any, data: string) => void) => ipcRenderer.on('project:log', cb),
})