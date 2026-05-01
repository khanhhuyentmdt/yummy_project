import { useState } from 'react'
import WelfareListPage from './WelfareListPage'
import CreateWelfarePage from './CreateWelfarePage'
import EditWelfarePage from './EditWelfarePage'

export default function WelfarePage() {
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [editingBenefit, setEditingBenefit] = useState(null)
  const [listKey, setListKey] = useState(0)

  const handleAdd = () => setView('create')

  const handleEdit = benefit => {
    setEditingBenefit(benefit)
    setView('edit')
  }

  const handleCreateSaved = newBenefit => {
    setListKey(k => k + 1)
    setEditingBenefit(newBenefit)
    setView('edit')
  }

  const handleEditSaved = () => {
    setListKey(k => k + 1)
  }

  const handleBack = () => {
    setView('list')
    setEditingBenefit(null)
  }

  if (view === 'create') {
    return <CreateWelfarePage onCancel={handleBack} onSaved={handleCreateSaved} />
  }

  if (view === 'edit' && editingBenefit) {
    return (
      <EditWelfarePage
        benefit={editingBenefit}
        onCancel={handleBack}
        onSaved={handleEditSaved}
      />
    )
  }

  return (
    <WelfareListPage
      key={listKey}
      onAdd={handleAdd}
      onEdit={handleEdit}
    />
  )
}
