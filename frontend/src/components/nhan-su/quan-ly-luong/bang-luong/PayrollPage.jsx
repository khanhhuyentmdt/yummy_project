import { useState } from 'react'
import PayrollListPage from './PayrollListPage'
import CreatePayrollPage from './CreatePayrollPage'
import EditPayrollPage from './EditPayrollPage'

export default function PayrollPage() {
  const [view, setView] = useState('list')
  const [editingPayroll, setEditingPayroll] = useState(null)
  const [listKey, setListKey] = useState(0)

  function handleAdd() {
    setView('create')
  }

  function handleEdit(payroll) {
    setEditingPayroll(payroll)
    setView('edit')
  }

  function handleCreateSaved(savedPayroll) {
    setEditingPayroll(savedPayroll)
    setListKey(k => k + 1)
    setView('edit')
  }

  function handleEditSaved(updatedPayroll) {
    setEditingPayroll(updatedPayroll)
    setListKey(k => k + 1)
  }

  function handleBack() {
    setView('list')
    setEditingPayroll(null)
  }

  if (view === 'create') {
    return <CreatePayrollPage onBack={handleBack} onSaved={handleCreateSaved} />
  }

  if (view === 'edit' && editingPayroll) {
    return (
      <EditPayrollPage
        payroll={editingPayroll}
        onBack={handleBack}
        onSaved={handleEditSaved}
      />
    )
  }

  return (
    <PayrollListPage
      key={listKey}
      onAdd={handleAdd}
      onEdit={handleEdit}
    />
  )
}
