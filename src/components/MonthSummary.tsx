import type { Expense } from '../types'
import { categoryTotals, forecastForMonth } from '../lib/stats'
import { formatMoney } from '../lib/money'
import { plural } from '../lib/text'
import { CategoryChart } from './CategoryChart'

interface Props {
  expenses: Expense[]
  month: string
  totalLimit: number | null
  onPrev: () => void
  onNext: () => void
}

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
})

export function MonthSummary({ expenses, month, totalLimit, onPrev, onNext }: Props) {
  const total = expenses.reduce((sum, expense) => sum + expense.amountKopecks, 0)
  const totals = categoryTotals(expenses)
  const forecast = forecastForMonth(expenses, month)

  const limitPercent = totalLimit ? total / totalLimit : null
  const remaining = totalLimit ? totalLimit - total : null

  return (
    <section className="card summary-card">
      <div className="month-switcher">
        <button className="icon-button" onClick={onPrev} aria-label="Предыдущий месяц">
          ←
        </button>
        <h2 className="month-title">
          {monthFormatter.format(new Date(`${month}-01T00:00:00`))}
        </h2>
        <button className="icon-button" onClick={onNext} aria-label="Следующий месяц">
          →
        </button>
      </div>

      <div className="summary-top">
        <div className="summary-main">
          <span className="total-label">Потрачено за месяц</span>
          <span className="total-value">{formatMoney(total)}</span>
          <span className="total-hint">
            {expenses.length} {plural(expenses.length, ['трата', 'траты', 'трат'])}
            {totalLimit ? ` из ${formatMoney(totalLimit)}` : ''}
          </span>

          {limitPercent !== null && remaining !== null && (
            <div className="limit-bar-wrap">
              <div className="limit-track">
                <div
                  className={`limit-fill ${limitPercent >= 1 ? 'over' : limitPercent >= 0.7 ? 'warn' : ''}`}
                  style={{ width: `${Math.min(100, limitPercent * 100)}%` }}
                />
              </div>
              <p className={`limit-caption ${remaining < 0 ? 'over' : ''}`}>
                {remaining >= 0
                  ? `Осталось ${formatMoney(remaining)}`
                  : `Лимит превышен на ${formatMoney(Math.abs(remaining))}`}
              </p>
            </div>
          )}

          {forecast !== null && (
            <p className="forecast">
              При текущем темпе к концу месяца — <strong>{formatMoney(forecast)}</strong>
            </p>
          )}
        </div>

        <CategoryChart data={totals} />
      </div>
    </section>
  )
}
