# Study Planner

Навчальний планувальник завдань для лабораторної роботи №9 з React Fundamentals.
Застосунок створено на React 19, TypeScript, Vite і SCSS. Список задач керується
через `useReducer` та `TaskContext`, а зміни зберігаються у `localStorage`.

## Можливості

- додавання завдань із назвою, описом, категорією та пріоритетом;
- перемикання статусу виконання та видалення із 5-секундним Undo;
- редагування завдань;
- фільтри «Усі», «Виконані» та «Не виконані» з лічильниками;
- пошук за назвою, описом і категорією;
- сортування завдань за пріоритетом;
- очищення виконаних завдань;
- вибір кольору для категорії та перемикач теми;
- статистика загальної кількості, виконаних і невиконаних завдань;
- синхронізація заголовка вкладки з кількістю активних задач;
- автоматичне збереження задач і налаштувань у `localStorage`;
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
