import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";
import api from "../../../../api/axios";
import SuccessModal from "../../../common/SuccessModal";

const INITIAL_FORM = {
  name: "",
  tax_code: "",
  contact_name: "",
  position: "",
  phone: "",
  email: "",
  social_link: "",
  address: "",
  province_code: "",
  district_code: "",
  ward_code: "",
  debt_limit: "",
  bank_account: "",
  bank_name: "",
  notes: "",
  status: "active",
};

const normalizePhone = (value) => value.replace(/[\s().-]/g, "");
const VN_PHONE_REGEX = /^(?:\+84|84|0)(?:2\d{8,9}|[35789]\d{8})$/;
const VN_TAX_CODE_REGEX = /^\d{10}(?:-\d{3})?$/;

export default function SupplierFormPage({
  mode = "create",
  supplierId,
  onCancel,
  onSaved,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [attachmentName, setAttachmentName] = useState("");
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const attachmentFileRef = useRef(null);
  const pendingSavedRef = useRef(null);

  useEffect(() => {
    api
      .get("provinces/")
      .then((res) => setProvinces(res.data.provinces || []))
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!form.province_code) {
      setDistricts([]);
      return;
    }
    api
      .get(`districts/?province_code=${form.province_code}`)
      .then((res) => setDistricts(res.data.districts || []))
      .catch(() => setDistricts([]));
  }, [form.province_code]);

  useEffect(() => {
    if (!form.district_code) {
      setWards([]);
      return;
    }
    api
      .get(`wards/?district_code=${form.district_code}`)
      .then((res) => setWards(res.data.wards || []))
      .catch(() => setWards([]));
  }, [form.district_code]);

  useEffect(() => {
    if (mode !== "edit" || !supplierId) return;
    setLoading(true);
    api
      .get(`suppliers/${supplierId}/`)
      .then((res) => {
        const supplier = res.data || {};
        setForm({
          name: supplier.name || "",
          tax_code: supplier.tax_code || "",
          contact_name: supplier.contact_name || "",
          position: supplier.position || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          social_link: supplier.social_link || "",
          address: supplier.address || "",
          province_code: supplier.province_code || "",
          district_code: supplier.district_code || "",
          ward_code: supplier.ward_code || "",
          debt_limit:
            supplier.debt_limit !== null && supplier.debt_limit !== undefined
              ? String(supplier.debt_limit)
              : "",
          bank_account: supplier.bank_account || "",
          bank_name: supplier.bank_name || "",
          notes: supplier.notes || "",
          status: supplier.status || "active",
        });
        setExistingAttachmentUrl(supplier.attachment_url || "");
      })
      .catch(() => setErrors({ submit: "Không thể tải dữ liệu nhà cung cấp." }))
      .finally(() => setLoading(false));
  }, [mode, supplierId]);

  const selectedProvinceName = useMemo(
    () =>
      provinces.find((item) => String(item.code) === String(form.province_code))
        ?.name || "",
    [form.province_code, provinces],
  );

  const selectedDistrictName = useMemo(
    () =>
      districts.find((item) => String(item.code) === String(form.district_code))
        ?.name || "",
    [districts, form.district_code],
  );

  const selectedWardName = useMemo(
    () =>
      wards.find((item) => String(item.code) === String(form.ward_code))
        ?.name || "",
    [form.ward_code, wards],
  );

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "province_code") {
        next.district_code = "";
        next.ward_code = "";
      }
      if (key === "district_code") {
        next.ward_code = "";
      }
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const normalizedPhone = normalizePhone(form.phone.trim());
    if (!form.name.trim()) nextErrors.name = "Tên nhà cung cấp là bắt buộc";
    if (!form.contact_name.trim())
      nextErrors.contact_name = "Tên người liên hệ là bắt buộc";
    if (!form.phone.trim()) nextErrors.phone = "Số điện thoại là bắt buộc";
    else if (!VN_PHONE_REGEX.test(normalizedPhone))
      nextErrors.phone = "Số điện thoại không đúng định dạng Việt Nam";
    if (form.email.trim()) {
      const email = form.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Email không đúng định dạng";
      }
    }
    if (form.tax_code.trim() && !VN_TAX_CODE_REGEX.test(form.tax_code.trim())) {
      nextErrors.tax_code =
        "Mã số thuế phải có 10 chữ số hoặc 10 chữ số kèm hậu tố -XXX";
    }
    return nextErrors;
  };

  const buildPayload = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("tax_code", form.tax_code.trim());
    fd.append("contact_name", form.contact_name.trim());
    fd.append("position", form.position.trim());
    fd.append("phone", normalizePhone(form.phone.trim()));
    fd.append("email", form.email.trim().toLowerCase());
    fd.append("social_link", form.social_link.trim());
    fd.append("address", form.address.trim());
    fd.append("province_code", form.province_code);
    fd.append("province_name", selectedProvinceName);
    fd.append("district_code", form.district_code);
    fd.append("district_name", selectedDistrictName);
    fd.append("ward_code", form.ward_code);
    fd.append("ward_name", selectedWardName);
    fd.append("debt_limit", form.debt_limit || "0");
    fd.append("bank_account", form.bank_account.trim());
    fd.append("bank_name", form.bank_name.trim());
    fd.append("notes", form.notes.trim());
    fd.append("status", form.status);
    if (attachmentFileRef.current) {
      fd.append("attachment", attachmentFileRef.current);
    }
    return fd;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const payload = buildPayload();
      const response =
        mode === "edit"
          ? await api.put(`suppliers/${supplierId}/`, payload, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post("suppliers/", payload, {
              headers: { "Content-Type": "multipart/form-data" },
            });
      pendingSavedRef.current = response.data;
      setShowSuccess(true);
    } catch (error) {
      const data = error.response?.data;
      if (data && typeof data === "object") {
        const mapped = {};
        for (const [key, value] of Object.entries(data)) {
          mapped[key] = Array.isArray(value) ? value[0] : String(value);
        }
        setErrors(mapped);
      } else {
        setErrors({ submit: "Không thể lưu nhà cung cấp." });
      }
    } finally {
      setSaving(false);
    }
  };

  const requestCancel = () => {
    if (saving) return;
    if (
      window.confirm("Bạn có chắc muốn hủy biểu mẫu nhà cung cấp này không?")
    ) {
      onCancel?.();
    }
  };

  const requestSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    if (
      window.confirm(
        mode === "edit"
          ? "Bạn có chắc muốn cập nhật nhà cung cấp này không?"
          : "Bạn có chắc muốn lưu nhà cung cấp này không?",
      )
    ) {
      handleSubmit();
    }
  };

  const handleReset = () => {
    if (mode === "edit") {
      setLoading(true);
      api
        .get(`suppliers/${supplierId}/`)
        .then((res) => {
          const supplier = res.data || {};
          setForm({
            name: supplier.name || "",
            tax_code: supplier.tax_code || "",
            contact_name: supplier.contact_name || "",
            position: supplier.position || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            social_link: supplier.social_link || "",
            address: supplier.address || "",
            province_code: supplier.province_code || "",
            district_code: supplier.district_code || "",
            ward_code: supplier.ward_code || "",
            debt_limit:
              supplier.debt_limit !== null && supplier.debt_limit !== undefined
                ? String(supplier.debt_limit)
                : "",
            bank_account: supplier.bank_account || "",
            bank_name: supplier.bank_name || "",
            notes: supplier.notes || "",
            status: supplier.status || "active",
          });
          setExistingAttachmentUrl(supplier.attachment_url || "");
          setAttachmentName("");
          attachmentFileRef.current = null;
          setErrors({});
        })
        .finally(() => setLoading(false));
      return;
    }

    setForm(INITIAL_FORM);
    setAttachmentName("");
    setExistingAttachmentUrl("");
    attachmentFileRef.current = null;
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-orange-400" />
        <p className="text-sm text-gray-500">
          Đang tải dữ liệu nhà cung cấp...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={requestCancel}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-2"
        >
          <ChevronLeft size={15} />
          Quay lại danh sách nhà cung cấp
        </button>
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          {mode === "edit" ? "CHỈNH SỬA NHÀ CUNG CẤP" : "THÊM MỚI NHÀ CUNG CẤP"}
        </h1>
      </div>

      {errors.submit && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin chung
            </h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Nhập tên nhà cung cấp"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={form.tax_code}
                  onChange={(e) => setField("tax_code", e.target.value)}
                  placeholder="Nhập mã số thuế"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    errors.tax_code
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.tax_code && (
                  <p className="mt-1 text-xs text-red-500">{errors.tax_code}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên người liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setField("contact_name", e.target.value)}
                  placeholder="Nhập tên người liên hệ"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    errors.contact_name
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.contact_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contact_name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chức vụ
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setField("position", e.target.value)}
                  placeholder="Nhập chức vụ"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    errors.phone
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="Nhập email"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Link đặt hàng/ Trang liên hệ
              </label>
              <input
                type="text"
                value={form.social_link}
                onChange={(e) => setField("social_link", e.target.value)}
                placeholder="Nhập Link đặt hàng/ Trang liên hệ"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tỉnh/ Thành phố
                </label>
                <div className="relative">
                  <select
                    value={form.province_code}
                    onChange={(e) => setField("province_code", e.target.value)}
                    className="w-full px-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Chọn Tỉnh/ Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quận/ Huyện
                </label>
                <div className="relative">
                  <select
                    value={form.district_code}
                    onChange={(e) => setField("district_code", e.target.value)}
                    className="w-full px-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Chọn Quận/ Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phường/ Xã
                </label>
                <div className="relative">
                  <select
                    value={form.ward_code}
                    onChange={(e) => setField("ward_code", e.target.value)}
                    className="w-full px-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Chọn Phường/ Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 pb-4 mb-5 border-b border-gray-100">
              Thông tin chung
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Hạn mức công nợ
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.debt_limit}
                  onChange={(e) => setField("debt_limit", e.target.value)}
                  className="w-full px-3 pr-8 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  đ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={form.bank_account}
                  onChange={(e) => setField("bank_account", e.target.value)}
                  placeholder="Nhập số tài khoản"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setField("bank_name", e.target.value)}
                  placeholder="Nhập tên ngân hàng"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Tài liệu đính kèm
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-gray-50 border border-gray-200 min-h-[220px] p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-500 mb-4">
                <Upload size={24} />
              </div>
              <p className="text-sm text-gray-700 text-center">
                Kéo thả tệp vào đây hoặc{" "}
                <span className="text-orange-500 font-semibold">
                  chọn từ thiết bị
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Hỗ trợ XLS, XLSX, CSV, PDF, ảnh dưới 20MB
              </p>
              {(attachmentName || existingAttachmentUrl) && (
                <p className="mt-4 text-xs text-gray-600 text-center break-all">
                  {attachmentName ||
                    existingAttachmentUrl.split("/").pop() ||
                    "Tệp đính kèm"}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                attachmentFileRef.current = file;
                setAttachmentName(file.name);
              }}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Ghi chú
            </h2>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={5}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end items-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          title="Đặt lại form"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
        </button>
        <button
          type="button"
          onClick={requestCancel}
          disabled={saving}
          className="px-7 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={requestSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: "#E67E22" }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Lưu
        </button>
      </div>

      {showSuccess && (
        <SuccessModal
          message={
            mode === "edit"
              ? "Cập nhật nhà cung cấp thành công!"
              : "Thêm nhà cung cấp thành công!"
          }
          onClose={() => {
            setShowSuccess(false);
            onSaved?.(pendingSavedRef.current);
          }}
        />
      )}
    </div>
  );
}
