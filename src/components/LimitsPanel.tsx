import { useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Category, Expense, Limits } from '../types'
import { CATEGORIES } from '../types'
import { categoryLimitStatuses } from '../lib/stats'
import { amountToInput, formatMoney, parseAmount } from '../lib/money'

interface Props {
  expenses: Expense[]
  total: number
  limits: Limits
  onChange: (limits: Limits) => void
}

/** Превращает сохранённые лимиты в строки для полей ввода */
function toDraft(limits: Limits): Record<string, string> {
  const draft: Record<string, string> = {
    total: limits.total ? amountToInput(limits.total) : '',
  }

  for (const category of CATEGORIES) {
    const value = limits.byCategory[category.id]
    draft[category.id] = value ? amountToInput(value) : ''
  }

  return draft
}

const barClass = (percent: number): string =>
  percent >= 1 ? 'limit-fill over' : percent >= 0.7 ? 'limit-fill warn' : 'limit-fill'

export function LimitsPanel({ expenses, total, limits, onChange }: Props) {
  // Отдельное состояние для текста в полях: пользователь печатает,
  // а сохраняем мы только когда он закончил (Enter или уход из поля).
  const [draft, setDraft] = useState<Record<string, string>>(() => toDraft(limits))
  const statuses = useMemo(() => categoryLimitStatuses(expenses, limits), [expenses, limits])

  function apply(key: string, value: number | null) {
    if (key === 'total') {
      onChange({ ...limits, total: value })
      return
    }

    const byCategory = { ...limits.byCategory }
    const category = key as Category

    if (value === null) {
      delete byCategory[category]
    } else {
      byCategory[category] = value
    }

    onChange({ ...limits, byCategory })
  }

  function commit(key: string, rawValue: string) {
    const raw = rawValue.trim()

    if (raw === '') {
      setDraft((previous) => ({ ...previous, [key]: '' }))
      apply(key, null)
      return
    }

    const kopecks = parseAmount(raw)
    if (kopecks === null) {
      // Некорректный ввод — возвращаем то, что уже сохранено
      setDraft((previous) => ({ ...previous, [key]: toDraft(limits)[key] ?? '' }))
      return
    }

    setDraft((previous) => ({ ...previous, [key]: amountToInput(kopecks) }))
    apply(key, kopecks)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }

  const totalPercent = limits.total ? total / limits.total : null

  return (
    <section className="card limits-card">
      <div className="list-head">
        <h2>Лимиты на месяц</h2>
        <span className="hint">Введите сумму и нажмите Enter</span>
      </div>

      <div className="limit-row total-row">
        <div className="limit-row-head">
          <span className="limit-name">Весь месяц</span>
          <label className="limit-input-wrap">
            <span className="visually-hidden">Общий лимит на месяц</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Без лимита"
              value={draft.total ?? ''}
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, total: event.target.value }))
              }
              onBlur={(event) => commit('total', event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </label>
        </div>

        {totalPercent !== null && (
          <>
            <div className="limit-track">
              <div
                className={barClass(totalPercent)}
                style={{ width: `${Math.min(100, totalPercent * 100)}%` }}
              />
            </div>
            <p className={`limit-meta ${totalPercent >= 1 ? 'over' : ''}`}>
              Потрачено {formatMoney(total)} из {formatMoney(limits.total ?? 0)} ·{' '}
              {totalPercent >= 1
                ? `превышение ${formatMoney(total - (limits.total ?? 0))}`
                : `осталось ${formatMoney((limits.total ?? 0) - total)}`}
            </p>
          </>
        )}
      </div>

      <div className="limits-grid">
        {statuses.map((status) => (
          <div key={status.category} className="limit-row">
            <div className="limit-row-head">
              <span className="limit-name">
                <span className="legend-dot" style={{ background: status.color }} />
                {status.label}
              </span>
              <label className="limit-input-wrap">
                <span className="visually-hidden">Лимит на категорию {status.label}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Без лимита"
                  value={draft[status.category] ?? ''}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      [status.category]: event.target.value,
                    }))
                  }
                  onBlur={(event) => commit(status.category, event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
            </div>

            {status.limit !== null ? (
              <>
                <div className="limit-track">
                  <div
                    className={barClass(status.percent)}
                    style={{ width: `${Math.min(100, status.percent * 100)}%` }}
                  />
                </div>
                <p className={`limit-meta ${status.percent >= 1 ? 'over' : ''}`}>
                  {formatMoney(status.spent)} из {formatMoney(status.limit)} ·{' '}
                  {status.remaining >= 0
                    ? `осталось ${formatMoney(status.remaining)}`
                    : `превышение ${formatMoney(Math.abs(status.remaining))}`}
                </p>
              </>
            ) : (
              <p className="limit-meta muted">
                Потрачено {formatMoney(status.spent)} · лимит не задан
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
