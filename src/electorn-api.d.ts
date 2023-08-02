interface IElectronApi {
  createProject: (projectName: string, type: 'vue' | 'react') => Promise<string>
  selectProjectDir: () => Promise<string>
  installProjectDependency: () => Promise<void>
  projectLogs(cb: (e: any, data: string) => void): void
  runProject: () => Promise<void>
  exitedProject: () => Promise<void>
}

interface Window {
  electronApi: IElectronApi
}