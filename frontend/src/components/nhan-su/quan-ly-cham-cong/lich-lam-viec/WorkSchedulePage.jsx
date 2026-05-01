import { useState } from 'react'
import WorkScheduleListPage from './WorkScheduleListPage'
import CreateWorkSchedulePage from './CreateWorkSchedulePage'
import EditWorkSchedulePage from './EditWorkSchedulePage'

export default function WorkSchedulePage() {
  const [view,     setView]    = useState('list')
  const [editing,  setEditing] = useState(null)

  function handleCreateSaved(saved) {
    setEditing(saved)
    setView('edit')
  }

  function handleBack() {
    setEditing(null)
    setView('list')
  }

  if (view === 'create') {
    return <CreateWorkSchedulePage onBack={handleBack} onSaved={handleCreateSaved} />
  }
  if (view === 'edit' && editing) {
    return <EditWorkSchedulePage schedule={editing} onBack={handleBack} onSaved={setEditing} />
  }
  return (
    <WorkScheduleListPage
      onCreateClick={() => setView('create')}
      onEditClick={s => { setEditing(s); setView('edit') }}
    />
  )
}
