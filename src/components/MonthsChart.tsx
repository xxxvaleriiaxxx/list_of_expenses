import { formatMoney } from '../lib/money'
import { monthLabel, monthShortLabel } from '../lib/date'

interface Props {
  data: Array<{ month: string; total: number }>
  selected: string
  onSelect: (month: string) => void
}

export function MonthsChart({ data, selected, onSelect }: Props) {
  const max = Math.max(...data.map((item) => item.total), 1)

  return (
    <section className="card">
      <div className="list-head">
        <h2>По месяцам</h2>
        <span className="hint">Нажмите на столбик, чтобы открыть месяц</span>
      </div>

      <div className="months">
        {data.map((item) => {
          const height = item.total === 0 ? 3 : Math.max(6, (item.total / max) * 100)
          const isSelected = item.month === selected

          return (
            <button
              key={item.month}
              type="button"
              className={`month-bar ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(item.month)}
              aria-pressed={isSelected}
              title={`${monthLabel(item.month)}: ${formatMoney(item.total)}`}
            >
              <span className="month-bar-value">
                {item.total > 0 ? formatMoney(item.total) : '—'}
              </span>
              <span className="month-bar-track">
                <span className="month-bar-fill" style={{ height: `${height}%` }} />
              </span>
              <span className="month-bar-label">{monthShortLabel(item.month)}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
