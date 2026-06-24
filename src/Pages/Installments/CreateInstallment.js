import { useState } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import ModalForm from "../../Components/ModalForm";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import API from "../../Api/axiosConfig";

function CreateInstallment() {
    const { t } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);

    // Installment Creation State
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        amount: "0",
        payments_count: "",
        interest_rate: "0",
        from_date: new Date().toISOString().split("T")[0],
        to_date: "",
    });
    const [installmentTable, setInstallmentTable] = useState([]);

    const handleCreateInstallment = (customer) => {
        setSelectedCustomer(customer);
        setFormData({
            amount: customer.last_balance?.total_value || "0",
            payments_count: "",
            interest_rate: "0",
            from_date: new Date().toISOString().split("T")[0],
            to_date: "",
        });
        setInstallmentTable([]);
        setShowModal(true);
    };

    const generateInstallmentTable = () => {
        const { amount, interest_rate, from_date, to_date, payments_count } = formData;
        if (!amount || !from_date || !to_date || !payments_count) {
            toast.warning(t("please_fill_all_fields"));
            return;
        }

        const principal = parseFloat(amount);
        const interest = parseFloat(interest_rate) / 100;
        const totalWithInterest = principal + principal * interest;

        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
        const N = parseInt(payments_count);

        if (N <= 0) {
            toast.error(t("invalid_payments_count"));
            return;
        }

        if (endDate <= startDate) {
            toast.error(t("invalid_duration"));
            return;
        }

        const monthlyAmount = (totalWithInterest / N).toFixed(2);
        const table = [];
        const timeDiff = endDate.getTime() - startDate.getTime();
        const interval = timeDiff / N;

        for (let i = 1; i <= N; i++) {
            const installmentDate = new Date(startDate.getTime() + i * interval);
            table.push({
                id: i,
                date: installmentDate.toISOString().split("T")[0],
                amount: monthlyAmount,
                status: "not_paid"
            });
        }

        setInstallmentTable(table);
    };

    const handleSubmitInstallment = async (e) => {
        e.preventDefault();
        // if (installmentTable.length === 0) {
        //     toast.warning(t("generate_table_first"));
        //     return;
        // }
        setLoading(true);
        const payload = {
            customer_id: selectedCustomer?.id,
            amount: formData.amount,
            interest_rate: formData.interest_rate,
            from_date: formData.from_date,
            to_date: formData.to_date,
        };

        try {
            await API.post("/installments", payload);
            toast.success(t("installment_created_success"));
            setShowModal(false);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            toast.error(t("general_error"));
        } finally {
            setLoading(false);
        }
    };

    const debtColumns = [
        { header: t("customers_name"), accessor: "name" },
        { header: t("customers_phone"), accessor: "phone" },
        {
            header: t("customers_currentBalance"),
            accessor: (row) => row.last_balance?.total_value || 0,
        },
        {
            header: t("actions"),
            accessor: (row) => (
                <div className="d-flex justify-content-center gap-2">
                    <button className="btn btn-sm btn-success no-style" title={t("create_installment")} onClick={() => handleCreateInstallment(row)}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            ),
            hideOnPrint: true,
        },
    ];

    return (
        <div className="container mt-5">
            <Mytitle title={t("create_installment")} />

            <MyTable
                resource="customers"
                columns={debtColumns}
                refreshKey={refreshKey}
                title={t("customer_debts")}
            />

            {/* Create Installment Modal */}
            <ModalForm
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                }}
                title={`${t("create_installment")} - ${selectedCustomer?.name}`}
                onSubmit={handleSubmitInstallment}
                loading={loading}
                mode="form"
                confirmText={t("create")}
            >
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <MyInput
                            label={t("payments_count")}
                            type="number"
                            value={formData.payments_count}
                            onChange={(e) => setFormData({ ...formData, payments_count: e.target.value })}
                            required={true}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <MyInput
                            label={t("interest_rate")}
                            type="number"
                            value={formData.interest_rate}
                            onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                            required={true}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <MyInput
                            label={t("duration_from")}
                            type="date"
                            value={formData.from_date}
                            onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                            required={true}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <MyInput
                            label={t("duration_to")}
                            type="date"
                            value={formData.to_date}
                            onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                            required={true}
                        />
                    </div>
                </div>

                {/* <div className="text-center my-3">
                    <MyButton
                        onClick={generateInstallmentTable}
                        variant="primary"
                        text={t("generate_table")}
                    />
                </div> */}

                {/* {installmentTable.length > 0 && (
                    <div className="mt-4">
                        <h5>{t("installment_table")}</h5>
                        <p><strong>{t("monthly_installment")}:</strong> {installmentTable[0].amount}</p>
                        <table className="table table-sm table-bordered mt-2">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t("installment_date")}</th>
                                    <th>{t("installment_amount")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {installmentTable.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.date}</td>
                                        <td>{item.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )} */}
            </ModalForm>
        </div>
    );
}

export default CreateInstallment;
