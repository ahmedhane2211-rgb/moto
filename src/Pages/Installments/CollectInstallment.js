import { useState, useEffect } from "react";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import API from "../../Api/axiosConfig";
import { useTheme } from "../../context/ThemeContext";

function CollectInstallment() {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(false);
    const {theme} = useTheme()
    // Payment Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [payForm, setPayForm] = useState({
        branch_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0]
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    useEffect(() => {
        loadCustomers();
        loadBranches();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await API.get("/get-customers");
            setCustomers(response.data.data || []);
        } catch (err) {
            console.error("Failed to load customers", err);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await API.get("/branches");
            setBranches(response.data.data || []);
        } catch (err) {
            console.error("Failed to load branches", err);
        }
    };

    const handleCustomerChange = async (customerId) => {
        setSelectedCustomerId(customerId);
        if (!customerId) {
            setInstallments([]);
            return;
        }
        setLoading(true);
        try {
            const response = await API.get(`/installment-reports?customer_id=${customerId}`);
            const data = response.data.data || [];
            // Filter locally just in case
            const filtered = data.filter(
                (inst) =>
                    (inst.installment?.customer?.id && String(inst.installment.customer.id) === String(customerId)) ||
                    (inst.installment?.customer_id && String(inst.installment.customer_id) === String(customerId))
            );
            setInstallments(filtered);
        } catch (err) {
            console.error("Failed to load installments", err);
            toast.error(t("general_error"));
        } finally {
            setLoading(false);
        }
    };

    const refreshInstallments = async () => {
        if (!selectedCustomerId) return;
        try {
            const response = await API.get(`/installment-reports?customer_id=${selectedCustomerId}`);
            const data = response.data.data || [];
            const filtered = data.filter(
                (inst) =>
                    (inst.installment?.customer?.id && String(inst.installment.customer.id) === String(selectedCustomerId)) ||
                    (inst.installment?.customer_id && String(inst.installment.customer_id) === String(selectedCustomerId))
            );
            setInstallments(filtered);
        } catch (err) {
            console.error("Failed to refresh installments", err);
        }
    };

    const openPaymentModal = (installment) => {
        setSelectedInstallment(installment);
        setPayForm({
            branch_id: branches[0]?.id || "",
            amount: installment.amount || "",
            date: new Date().toISOString().split("T")[0]
        });
        setShowPayModal(true);
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        if (!payForm.branch_id || !payForm.amount || !payForm.date) {
            toast.warning(t("please_fill_all_fields"));
            return;
        }
        setSubmittingPayment(true);
        try {
            await API.post(`/installments/${selectedInstallment.id}/pay`, {
                branch_id: payForm.branch_id,
                amount: payForm.amount,
                date: payForm.date
            });
            toast.success(t("installment_paid_success"));
            setShowPayModal(false);
            refreshInstallments();
        } catch (err) {
            toast.error(t("general_error"));
        } finally {
            setSubmittingPayment(false);
        }
    };

    return (
        <div className="container mt-5">
            <Mytitle title={t("collect_installment")} />

            <div className="row mb-4">
                <div className="col-md-6 offset-md-3">
                    <MyInput
                        as="select"
                        label={t("customer")}
                        value={selectedCustomerId}
                        onChange={(e) => handleCustomerChange(e.target.value)}
                        options={[
                            { value: "", label: t("select_customer") },
                            ...customers.map((c) => ({ value: c.id, label: c.name }))
                        ]}
                    />
                </div>
            </div>

            {selectedCustomerId && (
                <div className="card shadow-sm p-4 mt-3" style={{ background: "var(--card-bg)" }}>
                    <h5 className="mb-4 text-center">{t("installment_table")}</h5>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : installments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered text-center align-middle">
                                <thead  className="table-dark">
                                    <tr >
                                        <th style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}>#</th>
                                        <th style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}>{t("installment_date")}</th>
                                        <th style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}>{t("installment_amount")}</th>
                                        <th style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}>{t("status")}</th>
                                        <th style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}>{t("actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((inst, index) => (
                                        <tr key={inst.id || index} >
                                            <td >{index + 1}</td>
                                            <td >{inst.due_date}</td>
                                            <td >{inst.amount}</td>
                                            <td>
                                                <span className={`badge ${inst.status === "paid" ? "bg-success" : "bg-danger"}`}>
                                                    {t(inst.status)}
                                                </span>
                                            </td>
                                            <td>
                                                {inst.status !== "paid" && (
                                                    <button
                                                        className="btn btn-sm btn-success no-style"
                                                        title={t("pay_installment")}
                                                        onClick={() => openPaymentModal(inst)}
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-muted">{t("no_data_available")}</p>
                    )}
                </div>
            )}

            {/* Pay Installment Modal */}
            <ModalForm
                show={showPayModal}
                onClose={() => setShowPayModal(false)}
                title={t("pay_installment")}
                onSubmit={handlePaySubmit}
                loading={submittingPayment}
                mode="form"
                confirmText={t("pay")}
            >
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <MyInput
                            as="select"
                            label={t("branch")}
                            value={payForm.branch_id}
                            onChange={(e) => setPayForm({ ...payForm, branch_id: e.target.value })}
                            options={[
                                { value: "", label: t("select_branch") },
                                ...branches.map((b) => ({ value: b.id, label: b.name }))
                            ]}
                            required={true}
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <MyInput
                            label={t("installment_amount")}
                            type="number"
                            value={payForm.amount}
                            onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                            required={true}
                        />
                    </div>
                    <div className="col-md-12 mb-3">
                        <MyInput
                            label={t("date")}
                            type="date"
                            value={payForm.date}
                            onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                            required={true}
                        />
                    </div>
                </div>
            </ModalForm>
        </div>
    );
}

export default CollectInstallment;
