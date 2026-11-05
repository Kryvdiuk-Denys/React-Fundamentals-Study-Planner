import type { Task } from '../types/task'

export const initialTasks: Task[] = [
  {
    id: 'task-react-basics',
    title: 'Повторити основи React',
    description: 'Компоненти, JSX, props та умовний рендеринг.',
    completed: false,
    priority: 'high',
    category: 'React',
  },
  {
    id: 'task-typescript',
    title: 'Практика TypeScript',
    description: 'Описати типи для моделей і властивостей компонентів.',
    completed: false,
    priority: 'medium',
    category: 'TypeScript',
  },
  {
    id: 'task-reading',
    title: 'Переглянути конспект',
    description: 'Підготуватися до наступного практичного заняття.',
    completed: true,
    priority: 'low',
    category: 'Навчання',
  },
]
