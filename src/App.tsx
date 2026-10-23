import { useEffect, useMemo, useState } from 'react'
import type { Category, Expense, ExpenseDraft, Limits } from './types'
import { EMPTY_LIMITS } from './types'
import { useLocalStorage } from './lib/storage'
import { sampleExpenses } from './lib/sample'
import { currentMonth, monthsBack, shiftMonth } from './lib/date'
import { monthlyTotals } from './lib/stats'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { MonthSummary } from './components/MonthSummary'
import { MonthsChart } from './components/MonthsChart'
import { LimitsPanel } from './components/LimitsPanel'
import { EditExpenseDialog } from './components/EditExpenseDialog'
import { Toast } from './components/Toast'

type CategoryFilter = Category | 'all'

const CHART_MONTHS = 6

export default function App() {
  // Главные данные приложения. Хранятся в браузере.
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses.v1', [])
  const [limits, setLimits] = useLocalStorage<Limits>('limits.v1', EMPTY_LIMITS)

  const [month, setMonth] = useState(currentMonth)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleted, setDeleted] = useState<Expense | null>(null)

  // useMemo = computed из Vue: пересчитываем только когда меняются зависимости
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(month)),
    [expenses, month],
  )

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + expense.amountKopecks, 0),
    [monthExpenses],
  )

  const visibleExpenses = useMemo(() => {
    const list =
      category === 'all'
        ? monthExpenses
        : monthExpenses.filter((expense) => expense.category === category)

    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [monthExpenses, category])

  const chartMonths = useMemo(() => monthsBack(CHART_MONTHS, month), [month])
  const chartData = useMemo(
    () => monthlyTotals(expenses, chartMonths),
    [expenses, chartMonths],
  )

  // Уведомление об удалении живёт 6 секунд, потом исчезает само
  useEffect(() => {
    if (!deleted) return
    const timer = setTimeout(() => setDeleted(null), 6000)
    return () => clearTimeout(timer)
  }, [deleted])

  function addExpense(expense: ExpenseDraft) {
    setExpenses((previous) => [{ ...expense, id: crypto.randomUUID() }, ...previous])
  }

  function updateExpense(draft: ExpenseDraft) {
    if (!editing) return

    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === editing.id ? { ...draft, id: editing.id } : expense,
      ),
    )
    setEditing(null)
  }

  function removeExpense(id: string) {
    const target = expenses.find((expense) => expense.id === id)
    setExpenses((previous) => previous.filter((expense) => expense.id !== id))
    setDeleted(target ?? null)
  }

  function undoRemove() {
    if (!deleted) return
    setExpenses((previous) => [...previous, deleted])
    setDeleted(null)
  }

  function loadSample() {
    setExpenses(sampleExpenses())
    setMonth(currentMonth())
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Мои расходы</h1>
        <p className="subtitle">
          Данные хранятся только в этом браузере и никуда не отправляются
        </p>
      </header>

      <MonthSummary
        expenses={monthExpenses}
        month={month}
        totalLimit={limits.total}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />

      <div className="section-gap">
        <MonthsChart data={chartData} selected={month} onSelect={setMonth} />
      </div>

      <div className="columns">
        <ExpenseForm onAdd={addExpense} />

        <ExpenseList
          expenses={visibleExpenses}
          category={category}
          onCategoryChange={setCategory}
          onEdit={setEditing}
          onRemove={removeExpense}
          monthIsEmpty={monthExpenses.length === 0}
          onLoadSample={loadSample}
        />
      </div>

      <div className="section-gap">
        <LimitsPanel
          expenses={monthExpenses}
          total={monthTotal}
          limits={limits}
          onChange={setLimits}
        />
      </div>

      {editing && (
        <EditExpenseDialog
          key={editing.id}
          expense={editing}
          onSave={updateExpense}
          onClose={() => setEditing(null)}
        />
      )}

      {deleted && (
        <Toast
          message="Трата удалена"
          actionLabel="Вернуть"
          onAction={undoRemove}
          onClose={() => setDeleted(null)}
        />
      )}
    </div>
  )
}
