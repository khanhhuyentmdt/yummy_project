import { useState } from 'react'
import BonusListPage from './BonusListPage'
import CreateBonusModal from './CreateBonusModal'
import EditBonusModal from './EditBonusModal'

export default function BonusPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBonus, setEditingBonus] = useState(null)
  const [listKey, setListKey] = useState(0) // force re-fetch list

  const handleAdd = () => setShowCreateModal(true)

  const handleEdit = (bonus) => {
    setEditingBonus(bonus)
    setShowEditModal(true)
  }

  const handleCreateSaved = (newBonus) => {
    // After create success → close create modal → open edit modal
    setShowCreateModal(false)
    setEditingBonus(newBonus)
    setShowEditModal(true)
    setListKey(k => k + 1)
  }

  const handleEditSaved = () => {
    setListKey(k => k + 1)
  }

  const handleCloseCreate = () => {
    setShowCreateModal(false)
  }

  const handleCloseEdit = () => {
    setShowEditModal(false)
    setEditingBonus(null)
  }

  return (
    <>
      <BonusListPage
        key={listKey}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {showCreateModal && (
        <CreateBonusModal
          onClose={handleCloseCreate}
          onSaved={handleCreateSaved}
        />
      )}

      {showEditModal && editingBonus && (
        <EditBonusModal
          bonus={editingBonus}
          onClose={handleCloseEdit}
          onSaved={handleEditSaved}
        />
      )}
    </>
  )
}
