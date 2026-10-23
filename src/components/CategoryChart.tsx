import type { CategoryTotal } from '../lib/stats'
import { formatMoney } from '../lib/money'
import { plural } from '../lib/text'

interface Props {
  data: CategoryTotal[]
}

const SIZE = 156
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Круговая диаграмма на чистом SVG — без библиотек.
 * Приём: рисуем окружность, но показываем только часть её контура
 * через strokeDasharray. Следующая категория начинается там,
 * где закончилась предыдущая (strokeDashoffset).
 */
export function CategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Пока нет трат — диаграмма появится, как только вы что-нибудь добавите.</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)
  let offset = 0

  return (
    <div className="donut-wrap">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="donut"
        role="img"
        aria-label="Распределение трат по категориям"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {data.map((item) => {
            const length = (item.total / total) * CIRCUMFERENCE
            // Небольшой зазор между секторами
            const visible = Math.max(length - 3, 1)
            const dashOffset = -offset
            offset += length

            return (
              <circle
                key={item.category}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={item.color}
                strokeWidth={STROKE}
                strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            )
          })}
        </g>
        <text x="50%" y="47%" textAnchor="middle" className="donut-value">
          {data.length}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="donut-label">
          {plural(data.length, ['категория', 'категории', 'категорий'])}
        </text>
      </svg>

      <ul className="legend">
        {data.map((item) => (
          <li key={item.category} className="legend-row">
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-name">{item.label}</span>
            <span className="legend-percent">{Math.round((item.total / total) * 100)}%</span>
            <span className="legend-amount">{formatMoney(item.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
