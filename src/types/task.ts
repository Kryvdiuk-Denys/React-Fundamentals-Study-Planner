export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskFilter = 'all' | 'completed' | 'pending'

export const CATEGORY_COLORS = [
  { id: 'blue', label: 'Синій', value: '#3977a8' },
  { id: 'green', label: 'Зелений', value: '#39805b' },
  { id: 'coral', label: 'Кораловий', value: '#c45d52' },
  { id: 'purple', label: 'Фіолетовий', value: '#7956a8' },
  { id: 'amber', label: 'Бурштиновий', value: '#ae791d' },
] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]['id']

export const CATEGORY_COLOR_VALUES: Record<CategoryColor, string> = {
  blue: '#3977a8',
  green: '#39805b',
  coral: '#c45d52',
  purple: '#7956a8',
  amber: '#ae791d',
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  category: string
  categoryColor: CategoryColor
  pendingDelete?: boolean
}

export type NewTask = Omit<Task, 'id' | 'completed' | 'pendingDelete'>
