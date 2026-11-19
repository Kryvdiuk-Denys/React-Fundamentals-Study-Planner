# Study Planner

Навчальний планувальник завдань для лабораторної роботи №10 з React Fundamentals.
Застосунок створено на React 19, TypeScript, Vite і SCSS. Серверні дані завантажуються
через REST API, а клієнтські налаштування зберігаються у `localStorage`.

## Архітектура стану

Список задач зберігається в одному `tasks` state у `TaskProvider` і оновлюється
через `taskRepository`. `TaskContext` надає компоненти доступ до цього самого
стану та його операцій; окремої копії server state немає. Фільтр, пошук,
сортування й тема є client/UI state та можуть зберігатися у `localStorage`.

## Можливості

- додавання завдань із назвою, описом, категорією та пріоритетом;
- перемикання статусу виконання та видалення із 5-секундним Undo;
- редагування завдань;
- фільтри «Усі», «Виконані» та «Не виконані» з лічильниками;
- пошук за назвою, описом і категорією з debounce;
- сортування завдань за пріоритетом;
- очищення виконаних завдань;
- вибір кольору для категорії та перемикач теми;
- статистика загальної кількості, виконаних і невиконаних завдань;
- синхронізація заголовка вкладки з кількістю активних задач;
- завантаження задач із DummyJSON REST API з пагінацією;
- Axios instance з базовим URL і централізованою нормалізацією помилок;
- перегляд деталей задачі через окремий API-запит із скасуванням;
- створення, редагування, перемикання та видалення через repository;
- loading, error, empty і success-стани;
- optimistic update статусу завдання;
- локальне збереження налаштувань у `localStorage`;
- адаптивний інтерфейс на SCSS із BEM-класами.

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
npm install
npm run dev
```

Перевірки:

```bash
npm run lint
npm run build
```

## Структура

```text
src/
├── components/  # UI components with colocated SCSS
├── context/     # Shared task state and provider
├── hooks/       # Context and localStorage hooks
├── reducers/    # Pure task reducer
├── data/
├── styles/      # Global and application layout styles
├── App.tsx
└── main.tsx
```

Pending deletion is session-only and is not restored after reloading the page.
