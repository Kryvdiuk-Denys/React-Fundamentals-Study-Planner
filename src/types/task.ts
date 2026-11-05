export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskFilter = 'all' | 'completed' | 'pending'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  category: string
}

export type NewTask = Omit<Task, 'id' | 'completed'>
