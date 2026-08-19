import { useTasks } from '../context/TaskContext'
import type { Workspace } from '../types/task'

const WORKSPACES: Workspace[] = ['Personal', 'Work']

export function WorkspaceTabs() {
  const { currentWorkspace, setCurrentWorkspace } = useTasks()

  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {WORKSPACES.map((workspace) => {
        const isActive = workspace === currentWorkspace
        return (
          <button
            key={workspace}
            type="button"
            onClick={() => setCurrentWorkspace(workspace)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
          >
            {workspace}
          </button>
        )
      })}
    </div>
  )
}
