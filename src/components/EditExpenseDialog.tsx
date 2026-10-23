import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Expense, ExpenseDraft } from '../types'
import { amountToInput, parseAmount } from '../lib/money'
import { Modal } from './Modal'
import type { ExpenseValues } from './ExpenseFields'
import { ExpenseFields } from './ExpenseFields'

interface Props {
  expense: Expense
  onSave: (draft: ExpenseDraft) => void
  onClose: () => void
}

export function EditExpenseDialog({ expense, onSave, onClose }: Props) {
  const [values, setValues] = useState<ExpenseValues>({
    amount: amountToInput(expense.amountKopecks),
    category: expense.category,
    date: expense.date,
    comment: expense.comment,
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

    onSave({
      amountKopecks: kopecks,
      category: values.category,
      date: values.date,
      comment: values.comment.trim(),
    })
  }

  return (
    <Modal title="Изменить трату" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <ExpenseFields values={values} onChange={update} error={error} autoFocus />

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="primary-button">
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  )
}
