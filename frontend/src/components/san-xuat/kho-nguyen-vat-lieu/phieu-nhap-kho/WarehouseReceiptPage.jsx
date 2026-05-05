import { useState } from "react";
import WarehouseReceiptsPage from "./WarehouseReceiptsPage";
import WarehouseReceiptFormPage from "./WarehouseReceiptFormPage";

export default function WarehouseReceiptPage() {
  const [view, setView] = useState("list"); // "list" | "create" | "edit" | "view"
  const [editId, setEditId] = useState(null);

  const handleCreateClick = () => { setEditId(null); setView("create"); };
  const handleEditClick   = (id) => { setEditId(id);   setView("edit"); };
  const handleViewClick   = (id) => { setEditId(id);   setView("edit"); };

  const handleCancel = () => { setEditId(null); setView("list"); };

  const handleSaved = (savedReceipt) => {
    if (view === "create") {
      // After create success: open edit view for the new receipt
      setEditId(savedReceipt.id);
      setView("edit");
    }
    // After edit: stay on edit page (SuccessModal inside form handles it)
  };

  if (view === "create") {
    return (
      <WarehouseReceiptFormPage
        mode="create"
        onCancel={handleCancel}
        onSaved={handleSaved}
      />
    );
  }

  if (view === "edit" && editId) {
    return (
      <WarehouseReceiptFormPage
        mode="edit"
        receiptId={editId}
        onCancel={handleCancel}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <WarehouseReceiptsPage
      onCreateClick={handleCreateClick}
      onEditClick={handleEditClick}
      onViewClick={handleViewClick}
    />
  );
}
