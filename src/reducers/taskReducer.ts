import type { NewTask, Task } from '../types/task'

export type TaskAction =
  | { type: 'add'; payload: { task: NewTask; id: string } }
  | { type: 'toggle'; payload: { taskId: string } }
  | { type: 'update'; payload: { taskId: string; updates: Partial<NewTask> } }
  | { type: 'requestDelete'; payload: { taskId: string } }
  | { type: 'confirmDelete'; payload: { taskId: string } }
  | { type: 'undoDelete'; payload: { taskId: string } }
  | { type: 'clearCompleted' }
  | { type: 'restoreTasks'; payload: Task[] }
  | { type: 'reset'; payload: Task[] }

export function taskReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'add': {
      return [
        {
          ...action.payload.task,
          id: action.payload.id,
          completed: false,
          pendingDelete: false,
        },
        ...tasks,
      ]
    }

    case 'toggle': {
      return tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, completed: !task.completed }
          : task,
      )
    }

    case 'update': {
      return tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, ...action.payload.updates, pendingDelete: false }
          : task,
      )
    }

    case 'requestDelete': {
      return tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, pendingDelete: true }
          : task,
      )
    }

    case 'confirmDelete': {
      return tasks.filter((task) => task.id !== action.payload.taskId)
    }

    case 'undoDelete': {
      return tasks.map((task) =>
        task.id === action.payload.taskId
          ? { ...task, pendingDelete: false }
          : task,
      )
    }

    case 'clearCompleted': {
      return tasks.filter((task) => !task.completed)
    }

    case 'restoreTasks': {
      const restoredIds = new Set(action.payload.map((task) => task.id))
      return [...action.payload, ...tasks.filter((task) => !restoredIds.has(task.id))]
    }

    case 'reset': {
      return action.payload.map((task) => ({ ...task, pendingDelete: false }))
    }

    default: {
      return tasks
    }
  }
}
