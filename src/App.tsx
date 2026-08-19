import { TaskProvider, useTasks } from './context/TaskContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AddTaskButton } from './components/AddTaskButton'
import { TaskList } from './components/TaskList'
import { WorkspaceTabs } from './components/WorkspaceTabs'
import { DashboardPanel } from './components/DashboardPanel'
import { SettingsPanel } from './components/SettingsPanel'

function AppShell() {
  const { currentWorkspace } = useTasks()
  const { backgroundImages } = useTheme()
  const backgroundImage = backgroundImages[currentWorkspace]

  return (
    <div
      className="w-full min-h-screen bg-[var(--bg-color)] bg-cover bg-center bg-no-repeat"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <header className="border-b border-gray-200 bg-[var(--bg-color)] dark:border-gray-700">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:py-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
            Yhel To-Do
          </h1>
          <SettingsPanel />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <WorkspaceTabs />
      </div>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:py-8">
        <DashboardPanel />
        <AddTaskButton />
        <TaskList />
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppShell />
      </TaskProvider>
    </ThemeProvider>
  )
}

export default App
