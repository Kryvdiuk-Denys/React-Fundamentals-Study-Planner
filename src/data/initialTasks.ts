import type { Task } from '../types/task'

export const initialTasks: Task[] = [
  {
    id: 'task-groceries',
    title: 'Купити продукти',
    description: 'Зайти до магазину по хліб, молоко та овочі.',
    completed: false,
    priority: 'high',
    category: 'Покупки',
    categoryColor: 'coral',
  },
  {
    id: 'task-plants',
    title: 'Полити кімнатні рослини',
    description: 'Перевірити землю у вазонах і полити за потреби.',
    completed: false,
    priority: 'medium',
    category: 'Дім',
    categoryColor: 'green',
  },
  {
    id: 'task-walk',
    title: 'Прогулятися у парку',
    description: 'Вийти на коротку прогулянку після обіду.',
    completed: true,
    priority: 'low',
    category: 'Відпочинок',
    categoryColor: 'blue',
  },
]
