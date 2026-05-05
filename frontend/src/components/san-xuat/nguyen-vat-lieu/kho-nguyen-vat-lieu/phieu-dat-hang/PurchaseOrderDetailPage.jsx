import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Printer } from "lucide-react";
import api from "../../../../../api/axios";
import ActionConfirmModal from "../../../../common/ActionConfirmModal";
import SuccessModal from "../../../../common/SuccessModal";

const STATUS_CONFIG = {
  draft: { label: "Lưu nháp", cls: "bg-gray-100 text-gray-600" },
  waiting: { label: "Chờ nhận", cls: "bg-yellow-50 text-yellow-600" },
  received: { label: "Đã nhận", cls: "bg-green-50 text-green-600" },
  cancelled: { label: "Đã hủy", cls: "bg-red-50 text-red-500" },
};

const formatCurrency = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} đ`;

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function PurchaseOrderDetailPage({
  purchaseOrderId,
  onBack,
  onCancelled,
}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!purchaseOrderId) return;
    setLoading(true);
    api
      .get(`purchase-orders/${purchaseOrderId}/`)
      .then((res) => setOrder(res.data || null))
      .catch(() => setErrors({ submit: "Không thể tải chi tiết phiếu đặt hàng." }))
      .finally(() => setLoading(false));
  }, [purchaseOrderId]);

  const totalQuantity = useMemo(
    () =>
      (order?.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0,
      ),
    [order],
  );

  const status = STATUS_CONFIG[order?.status] || STATUS_CONFIG.draft;

  const handlePrintOrder = () => {
    if (!order) return;

    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) return;

    const itemsRows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.material_name || "")}<div class="muted">${escapeHtml(item.material_code || "")}</div></td>
            <td>${escapeHtml(item.quantity || "")} ${escapeHtml(item.unit || "")}</td>
            <td>${escapeHtml(formatCurrency(item.unit_price))}</td>
            <td class="text-right">${escapeHtml(formatCurrency(item.line_total))}</td>
          </tr>
        `,
      )
      .join("");

    const summaryRows = [
      ["Số lượng đặt", String(totalQuantity)],
      ["Tổng tiền hàng", formatCurrency(order.total_goods_value)],
      ["Chiết khấu", formatCurrency(order.discount_amount)],
      ["Phí vận chuyển", formatCurrency(order.shipping_fee)],
      [
        `VAT${Number(order.vat_percent) ? ` (${order.vat_percent}%)` : ""}`,
        formatCurrency(order.vat_amount),
      ],
      [order.other_fee_label || "Chi phí khác", formatCurrency(order.other_fee)],
      ["Tiền cần trả NCC", formatCurrency(order.total_value), true],
    ]
      .map(
        ([label, value, strong]) => `
          <div class="summary-row ${strong ? "summary-strong" : ""}">
            <span>${escapeHtml(label)}</span>
            <span>${escapeHtml(value)}</span>
          </div>
        `,
      )
      .join("");

    const notesText = escapeHtml(order.notes || "Không có ghi chú.");

    printWindow.document.write(`
      <!doctype html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>Phiếu đặt hàng ${escapeHtml(order.code)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 18mm 14mm 18mm 14mm;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              padding: 32px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 6px;
            }
            .subtle {
              font-size: 13px;
              color: #6b7280;
              margin: 0;
            }
            .status {
              display: inline-block;
              padding: 8px 14px;
              border-radius: 999px;
              background: #fef3c7;
              color: #b45309;
              font-size: 13px;
              font-weight: 700;
              white-space: nowrap;
            }
            .section {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 20px;
              break-inside: avoid-page;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              margin: 0 0 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #f1f5f9;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
            .field {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 12px 14px;
              background: #f9fafb;
            }
            .field-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 6px;
            }
            .field-value {
              font-size: 15px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 12px 10px;
              border-bottom: 1px solid #f1f5f9;
              text-align: left;
              vertical-align: top;
              font-size: 14px;
            }
            tr {
              break-inside: avoid-page;
              page-break-inside: avoid;
            }
            th {
              color: #6b7280;
              font-weight: 700;
            }
            .muted {
              margin-top: 4px;
              color: #6b7280;
              font-size: 12px;
            }
            .text-right {
              text-align: right;
            }
            .summary {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              font-size: 14px;
            }
            .summary-strong {
              font-size: 17px;
              font-weight: 700;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
            }
            .notes {
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.6;
            }
            @media print {
              body { background: #fff; }
              .page {
                padding: 0;
                max-width: none;
              }
              .header {
                margin-bottom: 18px;
              }
              .section {
                margin-bottom: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div>
                <h1 class="title">Chi tiết phiếu đặt hàng ${escapeHtml(order.code)}</h1>
                <p class="subtle">Ngày đặt hàng: ${escapeHtml(formatDate(order.order_date))}</p>
              </div>
              <div class="status">${escapeHtml(status.label)}</div>
            </div>

            <div class="section">
              <h2 class="section-title">Thông tin chung</h2>
              <div class="grid">
                <div class="field">
                  <div class="field-label">Nhà cung cấp</div>
                  <div class="field-value">${escapeHtml(order.supplier_name || "--")}</div>
                </div>
                <div class="field">
                  <div class="field-label">Người phụ trách</div>
                  <div class="field-value">${escapeHtml(order.responsible_name || "--")}</div>
                </div>
                <div class="field">
                  <div class="field-label">Ngày đặt hàng</div>
                  <div class="field-value">${escapeHtml(formatDate(order.order_date))}</div>
                </div>
                <div class="field">
                  <div class="field-label">Ngày dự kiến nhập hàng</div>
                  <div class="field-value">${escapeHtml(formatDate(order.expected_delivery_date))}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Nguyên vật liệu</h2>
              <table>
                <thead>
                  <tr>
                    <th>Nguyên vật liệu</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title">Chi phí đặt hàng</h2>
              <div class="summary">
                ${summaryRows}
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Ghi chú</h2>
              <div class="notes">${notesText}</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const payload = { ...order, status: "cancelled" };
      await api.put(`purchase-orders/${order.id}/`, {
        supplier: order.supplier,
        responsible_name: order.responsible_name || "",
        order_date: order.order_date || null,
        expected_delivery_date: order.expected_delivery_date || null,
        discount_type: order.discount_type || "percent",
        discount_value: Number(order.discount_value) || 0,
        shipping_fee: Number(order.shipping_fee) || 0,
        vat_percent: Number(order.vat_percent) || 0,
        vat_amount: Number(order.vat_amount) || 0,
        other_fee_label: order.other_fee_label || "",
        other_fee: Number(order.other_fee) || 0,
        notes: order.notes || "",
        status: "cancelled",
        items: (order.items || []).map((item) => ({
          material_id: item.material_id,
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "",
          unit_price: Number(item.unit_price) || 0,
          notes: item.notes || "",
        })),
      });
      setOrder(payload);
      setShowCancelConfirm(false);
      setSuccessMessage("Hủy phiếu đặt hàng thành công!");
    } catch {
      setErrors({ submit: "Không thể hủy phiếu đặt hàng." });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        Đang tải chi tiết phiếu đặt hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 py-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {errors.submit || "Không tìm thấy phiếu đặt hàng."}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2"
          >
            <ChevronLeft size={15} />
            Quay lại danh sách phiếu đặt hàng
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
              CHI TIẾT PHIẾU ĐẶT HÀNG {order.code}
            </h1>
            <span
              className={`inline-flex items-center rounded-[7px] py-[7px] px-[18px] text-xs font-semibold ${status.cls}`}
            >
              {status.label}
            </span>
          </div>
        </div>
        <button
          onClick={handlePrintOrder}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#E67E22" }}
        >
          <Printer size={15} />
          In phiếu
        </button>
      </div>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.85fr_0.95fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin chung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Nhà cung cấp" value={order.supplier_name || "--"} />
              <InfoField
                label="Người phụ trách"
                value={order.responsible_name || "--"}
              />
              <InfoField label="Ngày đặt hàng" value={formatDate(order.order_date)} />
              <InfoField
                label="Ngày dự kiến nhập hàng"
                value={formatDate(order.expected_delivery_date)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Nguyên vật liệu
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="py-3 font-semibold">Nguyên vật liệu</th>
                    <th className="py-3 font-semibold">Số lượng</th>
                    <th className="py-3 font-semibold">Đơn giá</th>
                    <th className="py-3 font-semibold text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="font-medium text-gray-800">
                          {item.material_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.material_code}
                        </div>
                      </td>
                      <td className="py-3 text-gray-700">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 text-gray-700">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Chi phí đặt hàng
            </h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Số lượng đặt" value={String(totalQuantity)} />
              <SummaryRow
                label="Tổng tiền hàng"
                value={formatCurrency(order.total_goods_value)}
              />
              <SummaryRow
                label="Chiết khấu đơn"
                value={formatCurrency(order.discount_amount)}
                accent
              />
              <SummaryRow
                label="Phí vận chuyển"
                value={formatCurrency(order.shipping_fee)}
                accent
              />
              <SummaryRow
                label={`VAT${Number(order.vat_percent) ? ` (${order.vat_percent}%)` : ""}`}
                value={formatCurrency(order.vat_amount)}
                accent
              />
              <SummaryRow
                label={order.other_fee_label || "Chi phí khác"}
                value={formatCurrency(order.other_fee)}
                accent
              />
              <SummaryRow
                label="Tiền cần trả NCC"
                value={formatCurrency(order.total_value)}
                strong
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Ghi chú
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {order.notes || "Không có ghi chú."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={order.status === "cancelled"}
          onClick={() => setShowCancelConfirm(true)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "#D92D20" }}
        >
          Hủy phiếu
        </button>
      </div>

      {showCancelConfirm && (
        <ActionConfirmModal
          title="Bạn có chắc muốn hủy phiếu này?"
          message="Lưu ý: Phiếu sau khi hủy sẽ không thể tiếp tục xử lý."
          note="Bạn có thể quay lại nếu chưa chắc chắn."
          confirmLabel="Tiếp tục"
          cancelLabel="Không, quay lại"
          loading={cancelling}
          onConfirm={handleCancelOrder}
          onClose={() => setShowCancelConfirm(false)}
        />
      )}

      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setSuccessMessage("");
            onCancelled?.();
          }}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, accent = false, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm ${accent ? "text-orange-500" : "text-gray-700"}`}>
        {label}
      </span>
      <span
        className={`text-sm ${
          strong ? "font-bold text-gray-900" : "font-medium text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
