import { useEffect, useRef, useState } from "react";
import API from "../../Api/axiosConfig";
import { Row, Col, Spinner, Card } from "react-bootstrap";
import MyInput from "../../Components/Myinput";
import ToggleSwitch from "../../Components/ToggleSwitch";
import MyButton from "../../Components/MyButton";
import { toast } from "react-toastify";
import Can from "../../Components/Can";
import { Building, Printer, FileText, Plus, Trash2 } from "lucide-react";
import PremiumUploader from "../../Components/PremiumUploader";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

function Settings() {
  const { t, i18n } = useTranslation();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [deletingSeal, setDeletingseal] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [sealPreview, setSealPreview] = useState(null);
  const logoRef = useRef();
  const sealRef = useRef();
  const { handleRefetch } = useAuth();

  // --- New Tabs and Clauses State ---
  const [activeTab, setActiveTab] = useState("company");
  const [rentClauses, setRentClauses] = useState([]);
  const [saleClauses, setSaleClauses] = useState([]);
  const [installmentClauses, setInstallmentClauses] = useState([]);

  // --- ننقل fetchData هنا ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings");
      const settingsData = res.data.data || {};
      setData(settingsData);
      setLogoPreview(settingsData.company_logo || null);
      setSealPreview(settingsData.company_seal || null);

      // Load clauses:
      // 1. Try to load from API response first
      let loadedRent = [];
      let loadedSale = [];
      let loadedInstallment = [];

      if (settingsData.rent_clauses) {
        try {
          loadedRent = typeof settingsData.rent_clauses === "string" 
            ? JSON.parse(settingsData.rent_clauses) 
            : settingsData.rent_clauses;
        } catch (e) {
          console.error("Error parsing rent_clauses from API", e);
        }
      }
      if (settingsData.sale_clauses) {
        try {
          loadedSale = typeof settingsData.sale_clauses === "string" 
            ? JSON.parse(settingsData.sale_clauses) 
            : settingsData.sale_clauses;
        } catch (e) {
          console.error("Error parsing sale_clauses from API", e);
        }
      }
      if (settingsData.installment_clauses) {
        try {
          loadedInstallment = typeof settingsData.installment_clauses === "string" 
            ? JSON.parse(settingsData.installment_clauses) 
            : settingsData.installment_clauses;
        } catch (e) {
          console.error("Error parsing installment_clauses from API", e);
        }
      }

      // 2. Fallback to localStorage if API is empty
      if (!loadedRent || loadedRent.length === 0) {
        const local = localStorage.getItem("rent_clauses");
        if (local) {
          try { loadedRent = JSON.parse(local); } catch (e) {}
        }
      }
      if (!loadedSale || loadedSale.length === 0) {
        const local = localStorage.getItem("sale_clauses");
        if (local) {
          try { loadedSale = JSON.parse(local); } catch (e) {}
        }
      }
      if (!loadedInstallment || loadedInstallment.length === 0) {
        const local = localStorage.getItem("installment_clauses");
        if (local) {
          try { loadedInstallment = JSON.parse(local); } catch (e) {}
        }
      }

      setRentClauses(Array.isArray(loadedRent) ? loadedRent : []);
      setSaleClauses(Array.isArray(loadedSale) ? loadedSale : []);
      setInstallmentClauses(Array.isArray(loadedInstallment) ? loadedInstallment : []);
    } catch (err) {
      console.error("فشل في جلب الإعدادات", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // --- الشرط الأول: نوع الصورة ---
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(files[0].type)) {
        toast.error(t("settings_image_type_error"));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB
      if (files[0].size > maxSize) {
        toast.warning(t("settings_image_size_error"));
        return;
      }
      setData((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "company_logo")
        setLogoPreview(URL.createObjectURL(files[0]));
      if (name === "company_seal")
        setSealPreview(URL.createObjectURL(files[0]));
    }
  };

  // --- Dynamic Clauses Handlers ---
  const handleAddClause = (type) => {
    if (type === "rent") {
      setRentClauses([...rentClauses, { name: "", desc: "" }]);
    } else if (type === "sale") {
      setSaleClauses([...saleClauses, { name: "", desc: "" }]);
    } else if (type === "installment") {
      setInstallmentClauses([...installmentClauses, { name: "", desc: "" }]);
    }
  };

  const handleUpdateClause = (type, index, field, value) => {
    if (type === "rent") {
      const updated = [...rentClauses];
      updated[index][field] = value;
      setRentClauses(updated);
    } else if (type === "sale") {
      const updated = [...saleClauses];
      updated[index][field] = value;
      setSaleClauses(updated);
    } else if (type === "installment") {
      const updated = [...installmentClauses];
      updated[index][field] = value;
      setInstallmentClauses(updated);
    }
  };

  const handleDeleteClause = (type, index) => {
    if (type === "rent") {
      setRentClauses(rentClauses.filter((_, i) => i !== index));
    } else if (type === "sale") {
      setSaleClauses(saleClauses.filter((_, i) => i !== index));
    } else if (type === "installment") {
      setInstallmentClauses(installmentClauses.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      //  تحقق من القيم السالبة قبل الإرسال
      if (Number(data.tax_percent) < 0) {
        toast.error(t("settings_negative_tax_error"));
        setSaving(false);
        return;
      }

      // Save clauses locally as fallback
      localStorage.setItem("rent_clauses", JSON.stringify(rentClauses));
      localStorage.setItem("sale_clauses", JSON.stringify(saleClauses));
      localStorage.setItem("installment_clauses", JSON.stringify(installmentClauses));

      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "company_logo" || key === "company_seal") {
          if (data[key] instanceof File) formData.append(key, data[key]);
        } else if (data[key] !== null && data[key] !== undefined) {
          //  تحقق عام لأي قيمة رقمية في الإعدادات
          if (
            typeof data[key] === "number" ||
            (!isNaN(data[key]) && data[key] !== "")
          ) {
            if (Number(data.tax_percent) < 0) {
              toast.error(t("settings_negative_tax_error"));
              setSaving(false);
              return;
            }
          }

          formData.append(key, data[key]);
        }
      });

      // Append terms to form data for database save attempt
      formData.append("rent_clauses", JSON.stringify(rentClauses));
      formData.append("sale_clauses", JSON.stringify(saleClauses));
      formData.append("installment_clauses", JSON.stringify(installmentClauses));

      await API.post(`/settings/${data.uuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchData();
      handleRefetch();
      toast.success(t("settings_save_success"));
    } catch (err) {
      console.error("فشل في تحديث الإعدادات", err);
      toast.error(t("settings_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    setLogoPreview(null);
    setDeletingLogo(true);
    try {
      await API.delete(`settings/${data.uuid}/delete-images?delete_logo=1`);
    } catch (erorr) {
      console.error("error", erorr);
    } finally {
      setDeletingLogo(false);
    }
  };

  const handleDeleteSeal = async () => {
    setSealPreview(null);
    setDeletingseal(true);
    try {
      await API.delete(`settings/${data.uuid}/delete-images?delete_seal=1`);
    } catch (erorr) {
      console.error("error", erorr);
    } finally {
      setDeletingseal(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <Spinner animation="border" style={{ color: "white" }} />
      </div>
    );
  }

  // Define tabs navigation
  const tabs = [
    { id: "company", label: t("settings_company_settings") || "بيانات الشركة", icon: <Building size={18} /> },
    { id: "print", label: t("settings_print_settings") || "إعدادات الطباعة", icon: <Printer size={18} /> },
    { id: "clauses", label: i18n.language == "en" ? "Contracts Terms" : "بنود العقود", icon: <FileText size={18} /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-3 settings-form">
      {/* 🌟 Modern Tab Switcher */}
      <div className="settings-tabs-container mb-4 d-flex justify-content-center gap-3 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`settings-tab-btn d-flex align-items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 📂 Tab Contents */}
      {activeTab === "company" && (
        <div className="tab-fade-in">
          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <h5 className="mb-4 text-primary fw-bold d-flex align-items-center gap-2">
              <Building size={20} />
              <span>{t("settings_company_settings")}</span>
            </h5>

            <Row>
              <Col md={6}>
                <MyInput
                  label={t("settings_company_name")}
                  type="text"
                  name="company_name"
                  value={data.company_name || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_company_address")}
                  type="text"
                  name="company_address"
                  value={data.company_address || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_company_phone")}
                  type="text"
                  name="company_phone"
                  value={data.company_phone || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_company_website")}
                  type="text"
                  name="company_website"
                  value={data.company_website || ""}
                  onChange={handleChange}
                />
              </Col>

              <Col md={6}>
                <MyInput
                  label={t("settings_company_email")}
                  type="email"
                  name="company_email"
                  value={data.company_email || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_company_commercial")}
                  type="text"
                  name="company_commercial"
                  value={data.company_commercial || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_company_tax_number")}
                  type="text"
                  name="company_tax_number"
                  value={data.company_tax_number || ""}
                  onChange={handleChange}
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                />
              </Col>
            </Row>
          </Card>

          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <Row className="g-4">
              <Col md={6} className="d-flex justify-content-center">
                <PremiumUploader
                  title={t("settings_company_logo")}
                  name="company_logo"
                  preview={logoPreview}
                  onDelete={handleDeleteLogo}
                  onChange={handleFileChange}
                  inputRef={logoRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
              </Col>

              <Col md={6} className="d-flex justify-content-center">
                <PremiumUploader
                  title={t("settings_company_seal")}
                  name="company_seal"
                  preview={sealPreview}
                  onDelete={handleDeleteSeal}
                  onChange={handleFileChange}
                  inputRef={sealRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {activeTab === "print" && (
        <div className="tab-fade-in">
          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <h5 className="mb-4 text-primary fw-bold d-flex align-items-center gap-2">
              <Printer size={20} />
              <span>{t("settings_print_settings") || "إعدادات الطباعة"}</span>
            </h5>
            <Row>
              <Col md={6}>
                <MyInput
                  label={t("settings_footer_note")}
                  type="text"
                  name="footer_note"
                  value={data.footer_note || ""}
                  onChange={handleChange}
                />
                <MyInput
                  label={t("settings_tax_percent")}
                  type="number"
                  name="tax_percent"
                  value={Number(data.tax_percent) || 0}
                  onChange={handleChange}
                  percent
                />
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">{t("settings_invoice_free_text")}</label>
                  <textarea
                    className="form-control"
                    name="invoice_free_text"
                    rows="4"
                    value={data.invoice_free_text || ""}
                    onChange={handleChange}
                    placeholder={t("settings_invoice_free_text_placeholder")}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <h6
              className={`mb-3 text-secondary fw-bold ${i18n.language === "ar" ? "text-end" : "text-start"}`}
            >
              {t("settings_invoice_extra_fields")}
            </h6>

            <Row className="g-3">
              <Col xs={12}>
                <ToggleSwitch
                  label={t("settings_show_licence_types")}
                  name="licence_type"
                  className="additional"
                  checked={data.licence_type}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <MyInput
                  label={t("settings_field_1")}
                  type="text"
                  name="string_1"
                  value={data.string_1 || ""}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <ToggleSwitch
                  label={t("settings_show_field_1")}
                  name="bool_1"
                  className="additional"
                  checked={data.bool_1}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <MyInput
                  label={t("settings_field_2")}
                  type="text"
                  name="string_2"
                  value={data.string_2 || ""}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <ToggleSwitch
                  label={t("settings_show_field_2")}
                  name="bool_2"
                  className="additional"
                  checked={data.bool_2}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <MyInput
                  label={t("settings_field_3")}
                  type="text"
                  name="string_3"
                  value={data.string_3 || ""}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <ToggleSwitch
                  label={t("settings_show_field_3")}
                  name="bool_3"
                  className="additional"
                  checked={data.bool_3}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <MyInput
                  label={t("settings_field_4")}
                  type="text"
                  name="string_4"
                  value={data.string_4 || ""}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={12} md={6}>
                <ToggleSwitch
                  label={t("settings_show_field_4")}
                  name="bool_4"
                  className="additional"
                  checked={data.bool_4}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Card>

          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <h6
              className={`mb-3 text-secondary fw-bold ${i18n.language === "ar" ? "text-end" : "text-start"}`}
            >
              {t("settings_invoice_header_options")}
            </h6>

            <Row className="g-3">
              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_company_name")}
                  name="head_company_name"
                  checked={data.head_company_name}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_company_phone")}
                  name="show_phone"
                  checked={data.show_phone}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_invoice_type")}
                  name="head_invoice_type"
                  checked={data.head_invoice_type}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_invoice_address")}
                  name="head_invoice_address"
                  checked={data.head_invoice_address}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_invoice_number")}
                  name="head_invoice_number"
                  checked={data.head_invoice_number}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_customer_name")}
                  name="head_customer_name"
                  checked={data.head_customer_name}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_head_company_logo")}
                  name="head_company_logo"
                  checked={data.head_company_logo}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Card>

          <Card
            className="shadow-sm p-4 mb-4"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            style={{
              textAlign: i18n.language === "ar" ? "right" : "left",
            }}
          >
            <h6
              className={`mb-3 text-secondary fw-bold ${i18n.language === "ar" ? "text-end" : "text-start"}`}
            >
              {t("settings_invoice_footer_options")}
            </h6>

            <Row className="g-3">
              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_tax_number")}
                  name="foot_tax_number"
                  checked={data.foot_tax_number}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_company_commercial")}
                  name="foot_company_commercial"
                  checked={data.foot_company_commercial}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_company_email")}
                  name="foot_company_email"
                  checked={data.foot_company_email}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_company_website")}
                  name="foot_company_website"
                  checked={data.foot_company_website}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_company_seal")}
                  name="foot_company_seal"
                  checked={data.foot_company_seal}
                  onChange={handleChange}
                />
              </Col>

              <Col xs={6} md={4}>
                <ToggleSwitch
                  label={t("settings_foot_invoice_free_text")}
                  name="foot_invoice_free_text"
                  checked={data.foot_invoice_free_text}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {activeTab === "clauses" && (
  <div className="tab-fade-in clauses-tab-container">
    {/* 1. Rent Section */}
    <Card dir={i18n.language === "ar" ? "rtl" : "ltr"} className="shadow-sm p-4 mb-4 clause-section-card border-left-primary">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
        <h5 className="mb-0 text-primary fw-bold d-flex align-items-center gap-2">
          <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill">
            {i18n.language.startsWith("ar") ? "الإيجار" : "Rent"}
          </span>
          <span>
            {i18n.language.startsWith("ar") ? "بنود عقود الإيجار" : "Rent Contract Clauses"}
          </span>
        </h5>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2 add-clause-btn hover-grow px-3"
          onClick={() => handleAddClause("rent")}
        >
          <Plus size={18} />
          <span>
            {i18n.language.startsWith("ar") ? "إضافة بند جديد" : "Add New Clause"}
          </span>
        </button>
      </div>
      
      {rentClauses.length === 0 ? (
        <div className="text-center py-5 text-muted border-dashed rounded bg-light-soft">
          <FileText size={48} className="mb-3 text-muted opacity-40" />
          <p className="mb-0">
            {i18n.language.startsWith("ar") 
              ? "لا توجد بنود مضافة حالياً لعقود الإيجار." 
              : "No clauses added yet for rent contracts."}
          </p>
          <small className="text-muted">
            {i18n.language.startsWith("ar") 
              ? 'اضغط على زر "إضافة بند جديد" لتسجيل شروط إيجار جديدة.' 
              : 'Click "Add New Clause" button to register new rent terms.'}
          </small>
        </div>
      ) : (
        <div className="clauses-list d-flex flex-column gap-3">
          {rentClauses.map((clause, idx) => (
            <div key={idx} className="clause-row-item p-3 rounded border glow-on-hover">
              <Row className="align-items-center g-3">
                <Col lg={4}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "اسم البند" : "Clause Title"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={i18n.language.startsWith("ar") ? "مثال: مسؤولية الصيانة" : "e.g., Maintenance Responsibility"}
                    value={clause.name}
                    onChange={(e) => handleUpdateClause("rent", idx, "name", e.target.value)}
                    required
                  />
                </Col>
                <Col lg={7}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "الوصف التفصيلي" : "Detailed Description"}
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder={i18n.language.startsWith("ar") ? "اكتب تفاصيل البند وشروطه هنا..." : "Write clause details and terms here..."}
                    value={clause.desc}
                    onChange={(e) => handleUpdateClause("rent", idx, "desc", e.target.value)}
                    required
                    style={{ resize: "vertical" }}
                  />
                </Col>
                <Col lg={1} className="text-center">
                  <label className="form-label d-none d-lg-block">&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-outline-danger hover-scale delete-clause-btn-row"
                    onClick={() => handleDeleteClause("rent", idx)}
                    title={i18n.language.startsWith("ar") ? "حذف البند" : "Delete Clause"}
                  >
                    <Trash2 size={18} />
                  </button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}
    </Card>

    {/* 2. Sale Section */}
    <Card className="shadow-sm p-4 mb-4 clause-section-card border-left-success">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
        <h5 className="mb-0 text-success fw-bold d-flex align-items-center gap-2">
          <span className="badge bg-success-soft text-success px-3 py-2 rounded-pill">
            {i18n.language.startsWith("ar") ? "البيع" : "Sale"}
          </span>
          <span>
            {i18n.language.startsWith("ar") ? "بنود عقود البيع" : "Sale Contract Clauses"}
          </span>
        </h5>
        <button
          type="button"
          className="btn btn-success d-flex align-items-center gap-2 add-clause-btn hover-grow px-3"
          onClick={() => handleAddClause("sale")}
        >
          <Plus size={18} />
          <span>
            {i18n.language.startsWith("ar") ? "إضافة بند جديد" : "Add New Clause"}
          </span>
        </button>
      </div>
      
      {saleClauses.length === 0 ? (
        <div className="text-center py-5 text-muted border-dashed rounded bg-light-soft">
          <FileText size={48} className="mb-3 text-muted opacity-40" />
          <p className="mb-0">
            {i18n.language.startsWith("ar") 
              ? "لا توجد بنود مضافة حالياً لعقود البيع." 
              : "No clauses added yet for sale contracts."}
          </p>
          <small className="text-muted">
            {i18n.language.startsWith("ar") 
              ? 'اضغط على زر "إضافة بند جديد" لتسجيل شروط بيع جديدة.' 
              : 'Click "Add New Clause" button to register new sale terms.'}
          </small>
        </div>
      ) : (
        <div className="clauses-list d-flex flex-column gap-3">
          {saleClauses.map((clause, idx) => (
            <div key={idx} className="clause-row-item p-3 rounded border glow-on-hover">
              <Row className="align-items-center g-3">
                <Col lg={4}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "اسم البند" : "Clause Title"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={i18n.language.startsWith("ar") ? "مثال: شروط نقل الملكية" : "e.g., Ownership Transfer Terms"}
                    value={clause.name}
                    onChange={(e) => handleUpdateClause("sale", idx, "name", e.target.value)}
                    required
                  />
                </Col>
                <Col lg={7}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "الوصف التفصيلي" : "Detailed Description"}
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder={i18n.language.startsWith("ar") ? "اكتب تفاصيل البند وشروطه هنا..." : "Write clause details and terms here..."}
                    value={clause.desc}
                    onChange={(e) => handleUpdateClause("sale", idx, "desc", e.target.value)}
                    required
                    style={{ resize: "vertical" }}
                  />
                </Col>
                <Col lg={1} className="text-center">
                  <label className="form-label d-none d-lg-block">&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-outline-danger hover-scale delete-clause-btn-row"
                    onClick={() => handleDeleteClause("sale", idx)}
                    title={i18n.language.startsWith("ar") ? "حذف البند" : "Delete Clause"}
                  >
                    <Trash2 size={18} />
                  </button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}
    </Card>

    {/* 3. Installments Section */}
    <Card className="shadow-sm p-4 mb-4 clause-section-card border-left-warning">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
        <h5 className="mb-0 text-warning fw-bold d-flex align-items-center gap-2">
          <span className="badge bg-warning-soft text-warning px-3 py-2 rounded-pill">
            {i18n.language.startsWith("ar") ? "الأقساط" : "Installments"}
          </span>
          <span>
            {i18n.language.startsWith("ar") ? "بنود عقود الأقساط" : "Installment Contract Clauses"}
          </span>
        </h5>
        <button
          type="button"
          className="btn btn-warning d-flex align-items-center gap-2 add-clause-btn hover-grow px-3 text-dark"
          onClick={() => handleAddClause("installment")}
        >
          <Plus size={18} />
          <span>
            {i18n.language.startsWith("ar") ? "إضافة بند جديد" : "Add New Clause"}
          </span>
        </button>
      </div>
      
      {installmentClauses.length === 0 ? (
        <div className="text-center py-5 text-muted border-dashed rounded bg-light-soft">
          <FileText size={48} className="mb-3 text-muted opacity-40" />
          <p className="mb-0">
            {i18n.language.startsWith("ar") 
              ? "لا توجد بنود مضافة حالياً لعقود الأقساط." 
              : "No clauses added yet for installment contracts."}
          </p>
          <small className="text-muted">
            {i18n.language.startsWith("ar") 
              ? 'اضغط على زر "إضافة بند جديد" لتسجيل شروط أقساط جديدة.' 
              : 'Click "Add New Clause" button to register new installment terms.'}
          </small>
        </div>
      ) : (
        <div className="clauses-list d-flex flex-column gap-3">
          {installmentClauses.map((clause, idx) => (
            <div key={idx} className="clause-row-item p-3 rounded border glow-on-hover">
              <Row className="align-items-center g-3">
                <Col lg={4}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "اسم البند" : "Clause Title"}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={i18n.language.startsWith("ar") ? "مثال: غرامات التأخير" : "e.g., Late Payment Penalties"}
                    value={clause.name}
                    onChange={(e) => handleUpdateClause("installment", idx, "name", e.target.value)}
                    required
                  />
                </Col>
                <Col lg={7}>
                  <label className="form-label fw-bold small text-muted">
                    {i18n.language.startsWith("ar") ? "الوصف التفصيلي" : "Detailed Description"}
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder={i18n.language.startsWith("ar") ? "اكتب تفاصيل البند وشروطه هنا..." : "Write clause details and terms here..."}
                    value={clause.desc}
                    onChange={(e) => handleUpdateClause("installment", idx, "desc", e.target.value)}
                    required
                    style={{ resize: "vertical" }}
                  />
                </Col>
                <Col lg={1} className="text-center">
                  <label className="form-label d-none d-lg-block">&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-outline-danger hover-scale delete-clause-btn-row"
                    onClick={() => handleDeleteClause("installment", idx)}
                    title={i18n.language.startsWith("ar") ? "حذف البند" : "Delete Clause"}
                  >
                    <Trash2 size={18} />
                  </button>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}
    </Card>
  </div>
)}

      <Can permission="setting_update">
        <div className="text-center mt-4">
          <MyButton
            text={t("settings_save")}
            loading={saving}
            className="save"
          />
        </div>
      </Can>
    </form>
  );
}

export default Settings;

