import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularProgressBar from "../../Components/CircularProgressBar";
import {
  faUsers,
  faUserTie,
  faBuilding,
  faStore,
  faHistory,
  faWallet,
  faMoneyBillWave,
  faUniversity,
} from "@fortawesome/react-fontawesome";
import {
  faBuilding as faBuildingSolid,
  faUsers as faUsersSolid,
  faUserTie as faUserTieSolid,
  faStore as faStoreSolid,
  faHistory as faHistorySolid,
} from "@fortawesome/free-solid-svg-icons";
import API from "../../Api/axiosConfig";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Spinner from "../../Components/ui/Spinner";

ChartJS.register(
  ArcElement,
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await API.get("analysis");
      if (response.data && response.data.data) {
        setAnalysisData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const basicInfo = analysisData.basic_info || {};
  const cashBank = analysisData.cash_bank_balance_exsist || {};
  const customerBalance = analysisData.customer_balance || {};
  const totals = analysisData.totals || {};
  const monthlyRevenueCost = analysisData.monthly_revenue_cost || [];
  const topServices = analysisData.top_selling_services || [];
  const debtors = customerBalance.debtors || [];

  const debtorsCreditorsData = {
    labels: [t("total_debtors") || "إجمالي المدينين", t("total_creditors") || "إجمالي الدائنين"],
    datasets: [
      {
        data: [totals.total_debtors || 0, totals.total_creditors || 0],
        backgroundColor: ["#2196f3", "#f44336"],
        hoverOffset: 4,
      },
    ],
  };

  const revenueDataset = {
    labels: monthlyRevenueCost.map((item) => `${item.month} ${item.year}`),
    datasets: [
      {
        label: t("revenue"),
        data: monthlyRevenueCost.map((item) => item.total_revenue),
        fill: false,
        borderColor: "rgba(203, 37, 209, 1)",
        tension: 0.1,
      },
      {
        label: t("service_cost") || "تكلفة الخدمات",
        data: monthlyRevenueCost.map((item) => item.total_cost),
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
    ],
  };

  const topServicesDataset = {
    labels: topServices.map((item) => item.service_name),
    datasets: [
      {
        label: t("sales_count") || "عدد المبيعات",
        data: topServices.map((item) => item.sales_count),
        backgroundColor: "rgba(98, 0, 238, 0.5)",
        borderColor: "#6200ee",
        borderWidth: 2,
      },
    ],
  };

  const netProfitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: t("total_debtors") + " / " + t("total_creditors") },
    },
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: t("revenue") },
    },
  };

  const topServicesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: t("top_selling_services") },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const totalBalance = cashBank.total_balance || 1;
  const cashPercentage = ((cashBank.cash_balance || 0) / totalBalance) * 100;
  const bankPercentage = ((cashBank.bank_balance || 0) / totalBalance) * 100;

  return (
    <div className="dashboard_modern_wrapper">
      {/* Premium Header Cards Section */}
      <div className="dashboard_premium_header">
        <div className="header_card_v4 company">
          <div className="card_v4_inner">
            <div className="icon_circle">
              <FontAwesomeIcon icon={faBuildingSolid} />
            </div>
            <div className="card_v4_content">
              <span className="label_v4">{t("company_name")}</span>
              <h3 className="value_v4">{basicInfo.company_name || "-"}</h3>
            </div>
          </div>
        </div>

        <div className="header_card_v4 employees">
          <div className="card_v4_inner">
            <div className="icon_circle">
              <FontAwesomeIcon icon={faUsersSolid} />
            </div>
            <div className="card_v4_content">
              <span className="label_v4">{t("suppliers")}</span>
              <h3 className="value_v4">{basicInfo.suppliers_count || 0}</h3>
            </div>
          </div>
        </div>

        <div className="header_card_v4 customers">
          <div className="card_v4_inner">
            <div className="icon_circle">
              <FontAwesomeIcon icon={faUserTieSolid} />
            </div>
            <div className="card_v4_content">
              <span className="label_v4">{t("customers")}</span>
              <h3 className="value_v4">{basicInfo.customers_count || 0}</h3>
            </div>
          </div>
        </div>

        <div className="header_card_v4 branches">
          <div className="card_v4_inner">
            <div className="icon_circle">
              <FontAwesomeIcon icon={faStoreSolid} />
            </div>
            <div className="card_v4_content">
              <span className="label_v4">{t("branches")}</span>
              <h3 className="value_v4">{analysisData.branch_performance?.length || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard_main_container">
        {/* First Section: Doughnut + Revenue Line */}
        <div className="charts_section_v4">
          <div className="doughnut_wrapper_v4">
            <Doughnut options={netProfitOptions} data={debtorsCreditorsData} />
          </div>
          <div className="line_chart_wrapper_v4">
            <Line
              options={revenueOptions}
              data={revenueDataset}
              style={{ height: "400px" }}
            />
          </div>
        </div>

        {/* Second Section: Top Services + Recent Activity */}
        <div className="split_section_v4">
          <div className="branch_chart_container">
            <Bar
              options={topServicesOptions}
              data={topServicesDataset}
              style={{ height: "400px" }}
            />
          </div>

          <div className="activities_wrapper_v4">
            <div
              className="widget_header_v4"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FontAwesomeIcon
                icon={faHistorySolid}
                style={{ color: "var(--primary-color)" }}
              />
              <h5 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>
                {t("recent_activity")}
              </h5>
            </div>
            <div className="activities_list">
              {debtors.slice(0, 4).map((debtor, index) => (
                <div key={index} className="activity_item_premium">
                  <div className="activity_icon_small">
                    <FontAwesomeIcon icon={faUserTieSolid} />
                  </div>
                  <div className="activity_info">
                    <p className="activity_text">
                      {debtor.customer_name} ({t("remaining")}: {debtor.remaining_balance})
                    </p>
                    <span className="activity_time">{t("debtor") || "مدين"}</span>
                  </div>
                </div>
              ))}
              {debtors.length === 0 && (
                <div className="p-3 text-center text-muted">{t("no_data")}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Debtors List & Cash Box Distribution */}
        <div className="equal_split_v4">
          <div style={{ height: "350px" }} className="dashboard_widget">
            <div className="widget_header">
              <h5>{t("debtors") || "العملاء المدينون"}</h5>
            </div>
            <div className="widget_content scroll-none" style={{ overflowX: "auto" }}>
              <table className="mini_table">
                <thead>
                  <tr>
                    <th>{t("customer_name")}</th>
                    <th>{t("amount_due") || "المبلغ المستحق"}</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.map((debtor, idx) => (
                    <tr key={idx}>
                      <td>{debtor.customer_name}</td>
                      <td style={{ fontWeight: "700" }}>{debtor.remaining_balance}</td>
                    </tr>
                  ))}
                  {debtors.length === 0 && (
                    <tr>
                      <td colSpan="2" className="text-center">{t("no_data")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ height: "350px" }} className="dashboard_widget">
            <div className="widget_header">
              <h5>
                <FontAwesomeIcon icon={faStoreSolid} /> {t("cash_distribution") || "توزيع السيولة"}
              </h5>
            </div>
            <div className="widget_content">
              <div className="inventory_stat_v2">
                <div className="inventory_item_v2">
                  <CircularProgressBar
                    percentage={cashPercentage}
                    size={80}
                    strokeWidth={12}
                    bgColor="#eee"
                    useGradient={false}
                    textColor="var(--text-main)"
                    gradientStartColor="#4caf50"
                    gradientEndColor="#4caf50"
                  />
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      marginTop: "10px",
                    }}
                  >
                    {t("cash_safe") || "الخزنة الكاش"} ({cashBank.cash_balance?.toLocaleString()})
                  </span>
                </div>

                <div className="inventory_item_v2">
                  <CircularProgressBar
                    percentage={bankPercentage}
                    size={80}
                    strokeWidth={12}
                    bgColor="#eee"
                    useGradient={false}
                    textColor="var(--text-main)"
                    gradientStartColor="#2196f3"
                    gradientEndColor="#2196f3"
                  />
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      marginTop: "10px",
                    }}
                  >
                    {t("bank") || "البنك"} ({cashBank.bank_balance?.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 (Cards) */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            gap: "20px",
          }}
        >
          <div style={{ flex: "1" }} className="header_card_v4 company">
            <div className="card_v4_inner">
              <div className="icon_circle">
                <FontAwesomeIcon icon={faBuildingSolid} />
              </div>
              <div className="card_v4_content">
                <span className="label_v4">{t("commissions")}</span>
                <h3 className="value_v4">{basicInfo.total_commissions || 0}</h3>
              </div>
            </div>
          </div>
          <div style={{ flex: "1" }} className="header_card_v4 company">
            <div className="card_v4_inner">
              <div className="icon_circle">
                <FontAwesomeIcon icon={faBuildingSolid} />
              </div>
              <div className="card_v4_content">
                <span className="label_v4">{t("discounts")}</span>
                <h3 className="value_v4">{basicInfo.total_deductions || 0}</h3>
              </div>
            </div>
          </div>
          <div style={{ flex: "1" }} className="header_card_v4 employees">
            <div className="card_v4_inner">
              <div className="icon_circle">
                <FontAwesomeIcon icon={faUsersSolid} />
              </div>
              <div className="card_v4_content">
                <span className="label_v4">{t("employees")}</span>
                <h3 className="value_v4">{basicInfo.employees_count || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
