import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ExpenseDraft } from '../types'
import { todayISO } from '../types'
import { parseAmount } from '../lib/money'
import type { ExpenseValues } from './ExpenseFields'
import { ExpenseFields } from './ExpenseFields'

interface Props {
  onAdd: (expense: ExpenseDraft) => void
}

export function ExpenseForm({ onAdd }: Props) {
  const [values, setValues] = useState<ExpenseValues>({
    amount: '',
    category: 'food',
    date: todayISO(),
    comment: '',
  })
  const [error, setError] = useState('')

  function update(patch: Partial<ExpenseValues>) {
    setValues((previous) => ({ ...previous, ...patch }))
    if (error) setError('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const kopecks = parseAmount(values.amount)
    if (kopecks === null) {
      setError('Введите сумму числом, например 450 или 1290,50')
      return
    }

    onAdd({
      amountKopecks: kopecks,
      category: values.category,
      date: values.date,
      comment: values.comment.trim(),
    })

    // Очищаем только сумму и комментарий: категорию и дату обычно не меняют подряд
    setValues((previous) => ({ ...previous, amount: '', comment: '' }))
    setError('')
  }

  return (
    <section className="card form-card">
      <h2>Новая трата</h2>

      <form onSubmit={handleSubmit} noValidate>
        <ExpenseFields values={values} onChange={update} error={error} />

        <button type="submit" className="primary-button">
          Добавить трату
        </button>
      </form>
    </section>
  )
}
