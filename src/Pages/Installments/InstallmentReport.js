import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import MyInput from "../../Components/Myinput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faFileInvoiceDollar, faCheck, faClock, faCoins } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import API from "../../Api/axiosConfig";

function InstallmentReport() {
    const { t } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");

    // 1. فاريابل الإحصائيات (مجمعة في State واحدة ليسهل ربطها وتحديثها معاً)
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // 2. دالة جلب الإحصائيات من الباك-إند
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const response = await API.get("/installments/stats"); 
                setStats(response.data.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [refreshKey]); // يتم تحديث الإحصائيات تلقائياً عند دفع أي قسط

    const handlePayInstallment = async (installment) => {
        try {
            await API.put(`/installments/${installment.id}/pay`);
            toast.success(t("installment_paid_success"));
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            toast.error(t("general_error"));
        }
    };

    const reportColumns = [
        { header: t("customer"), accessor: "customer_name" },
        { header: t("installment_date"), accessor: "due_date" },
        { header: t("installment_amount"), accessor: "amount" },
        {
            header: t("status"),
            accessor: (row) => (
                <span className={`badge ${row.status === "paid" ? "bg-success" : "bg-danger"}`}>
                    {t(row.status)}
                </span>
            )
        }
    ];

   // مصفوفة توليد الكاردات المحدثة بألوان الـ Theme الخاصة بالموقع
const cardsConfig = [
    { 
        title: "إجمالي الأقساط", 
        value: stats?.total_count || 0, 
        icon: faFileInvoiceDollar, 
        iconColor: "var(--button-pr, #7c3aed)", // اللون البنفسجي الأساسي للموقع
        bg: "var(--card-bg)" 
    },
    { 
        title: "الأقساط المدفوعة", 
        value: stats?.paid_count || 0, 
        icon: faCheck, 
        iconColor: "#22c55e", // اللون الأخضر للنجاح
        bg: "var(--card-bg)" 
    },
    { 
        title: "الأقساط المتبقية", 
        value: stats?.remaining_installments || 0, 
        icon: faClock, 
        iconColor: "#f03a3aff", // اللون الأحمر للتنبيه
        bg: "var(--card-bg)" 
    },
    { 
        title: "إجمالي المبالغ المتقسطة", 
        value: `${stats?.total_amount_installments || 0} `, 
        icon: faCoins, 
        iconColor: "#f59e0b", // اللون البرتقالي/الأصفر للمال
        bg: "var(--card-bg)" 
    }
];

    return (
        <div className="container mt-5">
            <Mytitle title={t("installment_report")} />

            {/* قسم الكاردات الإحصائية */}
            <div className="row mb-4 g-3">
                {cardsConfig.map((card, index) => (
                    <div key={index} className="col-12 col-sm-6 col-lg-3">
                        <div 
                            className="p-3 rounded-3 d-flex align-items-center justify-content-between shadow-sm"
                            style={{ background: card.bg, color: card.text }}
                        >
                            <div>
                                <small className="opacity-75 d-block mb-1 fw-bold">{card.title}</small>
                                <h3 className="mb-0 fw-bold">
                                    {loadingStats ? <span className="spinner-border spinner-border-sm"></span> : card.value}
                                </h3>
                            </div>
                            <div className="fs-3 ">
                                <FontAwesomeIcon icon={card.icon} color={card.iconColor}/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* الفلتر والجدول */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <MyInput
                        as="select"
                        label={t("filter_by_status")}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: "all", label: t("all_installments") },
                            { value: "paid", label: t("paid_installments") },
                            { value: "not_paid", label: t("unpaid_installments") },
                        ]}
                    />
                </div>
            </div>
            
            <MyTable
                resource="installment-reports"
                columns={reportColumns}
                refreshKey={refreshKey + statusFilter}
                title={t("reports")}
            />
        </div>
    );
}

export default InstallmentReport;