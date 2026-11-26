import { httpClient } from '../api/httpClient'
import type { NewTask, Task } from '../types/task'
import type { ApiTodo, TodosResponse } from '../types/api'

export interface TaskPage {
  tasks: Task[]
  total: number
  skip: number
  limit: number
}

function toTask(todo: ApiTodo): Task {
  const createdAt = new Date().toISOString()
  return {
    id: String(todo.id),
    title: todo.todo,
    description: '',
    completed: todo.completed,
    priority: 'medium',
    category: 'General',
    categoryColor: 'blue',
    createdBy: `user-${todo.userId}`,
    createdAt,
  }
}

export const taskRepository = {
  async getAll(limit: number, skip: number, signal?: AbortSignal): Promise<TaskPage> {
    const response = await httpClient<TodosResponse>(
      '/todos',
      { params: { limit, skip }, signal },
    )
    return {
      tasks: response.todos.map(toTask),
      total: response.total,
      skip: response.skip,
      limit: response.limit,
    }
  },

  async getById(id: string, signal?: AbortSignal): Promise<Task> {
    const response = await httpClient<ApiTodo>(`/todos/${encodeURIComponent(id)}`, { signal })
    return toTask(response)
  },

  async create(task: NewTask): Promise<Task> {
    const response = await httpClient<ApiTodo>('/todos/add', {
      method: 'POST',
      data: { todo: task.title, completed: false, userId: 1 },
    })
    return { ...toTask(response), description: task.description, priority: task.priority, category: task.category, categoryColor: task.categoryColor }
  },

  async update(id: string, task: Partial<NewTask> & { completed?: boolean }): Promise<Task> {
    const body: { todo?: string; completed?: boolean } = {}
    if (task.title !== undefined) body.todo = task.title
    if (task.completed !== undefined) body.completed = task.completed

    const response = await httpClient<ApiTodo>(`/todos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      data: body,
    })
    return { ...toTask(response), ...task }
  },

  async delete(id: string): Promise<void> {
    await httpClient<ApiTodo>(`/todos/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
