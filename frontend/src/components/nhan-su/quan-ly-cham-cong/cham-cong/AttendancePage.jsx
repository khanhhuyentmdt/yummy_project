import { useState } from 'react'
import AttendanceListPage from './AttendanceListPage'
import CreateAttendancePage from './CreateAttendancePage'
import EditAttendancePage from './EditAttendancePage'

export default function AttendancePage() {
  const [view,    setView]   = useState('list')
  const [editing, setEditing]= useState(null)

  function handleCreateSaved(saved) {
    setEditing(saved)
    setView('edit')
  }

  function handleBack() {
    setEditing(null)
    setView('list')
  }

  if (view === 'create') {
    return <CreateAttendancePage onBack={handleBack} onSaved={handleCreateSaved} />
  }
  if (view === 'edit' && editing) {
    return <EditAttendancePage attendance={editing} onBack={handleBack} onSaved={setEditing} />
  }
  return (
    <AttendanceListPage
      onCreateClick={() => setView('create')}
      onEditClick={a => { setEditing(a); setView('edit') }}
    />
  )
}
