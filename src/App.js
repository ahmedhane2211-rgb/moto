import { Routes, Route, useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useTheme } from "./context/ThemeContext";
import Navbar from "./Components/Navbar";

import Login from "./Pages/Auth/Login";
import Home from "./Pages/Home/Home";
import { ToastContainer } from "react-toastify";
import { SettingsProvider } from "./context/SettingsContext";
import Employees from "./Pages/Employees/Employees";
import DiscountRewards from "./Pages/DiscountReward/DiscountRewards";
import Expenses from "./Pages/Expenses/Expenses";
import Categories from "./Pages/Categories/Categories";
import Services from "./Pages/Services/Services";
import Customers from "./Pages/Customers/Customers";
import EmployeeWithdraws from "./Pages/EmployeeWithdraws/EmployeeWithdraws";
import MoneyInvoices from "./Pages/MoneyInvoices/MoneyInvoices";
import Invoices from "./Pages/Invoices/Invoices";
import IncomeStatement from "./Pages/Reports/IncomeStatement";
import Cash from "./Pages/Reports/Cash";
import TaxesReport from "./Pages/Reports/TaxesReport";
import ServicesExpenses from "./Pages/Reports/ServicesExpenses";
import CarExpenses from "./Pages/Reports/CarExpenses";
import AccountStatement from "./Pages/Reports/AccountStatement";
import Salary from "./Pages/Salary/Salary";
import EmployeeDetails from "./Pages/EmployeeDetails/EmployeeDetails";
import SubUsers from "./Pages/SubUseres/SubUsers";
import Register from "./Pages/Auth/Register";

import UserPermissions from "./Pages/Permissions/UserPermissions";
import SubAdmins from "./Pages/Dashboard/SubAdmins";
import AdminLayout from "./AdminLayout";
import ProtectedLayout from "./Api/ProtectedRoute";
import AdminPermissions from "./Pages/Dashboard/AdminPermissions";
import Complaints from "./Pages/Dashboard/Complaints";
import Reviews from "./Pages/Dashboard/Reviews";
import SubscriptionsDetails from "./Pages/SubscriptionsDetails/SubscriptionsDetails";

import { Outlet } from "react-router-dom";
import Subscriptions from "./Pages/Subscriptions/Subscriptions";
import Can from "./Components/Can";
import { PermissionProvider } from "./context/PermissionContext";
import { AuthProvider } from "./context/AuthContext";
import Settings from "./Pages/Settings/Settings";
import CashTransfer from "./Pages/CashTransfer/CashTransfer";
import Landing from "./Landing/Landing";
import PrivacyPolicy from "./Landing/PrivacyPolicy";
import TermsAndConditions from "./Landing/TermsAndConditions";
import RefundPolicy from "./Landing/RefundPolicy";
import Dashboard from "./Pages/ClientDashboard/Dashboard";
import Licences from "./Pages/Licences/Licences";
import Branches from "./Pages/Branches/Branches";
import Suppliers from "./Pages/Suppliers/Suppliers";
import AddCar from "./Pages/AddCar/AddCar";
import CarSales from "./Pages/CarSales/CarSales";
import CarInventoryReport from "./Pages/CarInventoryReport/CarInventoryReport";
import CarRental from "./Pages/CarRental/CarRental";
import Partners from "./Pages/Partners/Partners";
import PartnerWithdrawals from "./Pages/Partners/PartnerWithdrawals";
import Test from "./Pages/Test";
import InvoiceDetails from "./Pages/InvoiceDetails";
import CreateInstallment from "./Pages/Installments/CreateInstallment";
import CollectInstallment from "./Pages/Installments/CollectInstallment";
import InstallmentReport from "./Pages/Installments/InstallmentReport";
import Banks from "./Pages/Banks/Banks";
import CashInjection from "./Pages/CashInjection/CashInjection";
import SubscriptionHistory from "./Pages/SubscriptionHistory/SubscriptionHistory";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import AdminSettings from "./Pages/Dashboard/AdminSettings";

function Layout() {
  return (
    <>
      <Navbar />
      <div
        style={{ minHeight: "calc(100vh - 118px)" }}
        className="page-content"
      >
        <Outlet />
      </div>
    </>
  );
}

function App() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // 🌍 Global Direction Synchronization (LTR/RTL)
  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // 🎨 إعداد ألوان المكتبة الجاهزة (MUI) لتطابق الثيم الجديد
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme, // 🔄 الوضع الحالي
          primary: {
            // 💜 اللون الأساسي (بنفسجي) يتغير حسب الوضع
            main: theme === "light" ? "#6200ee" : "#bb86fc",
          },
          background: {
            // 🖼️ خلفية التطبيق (تأخذ من المتغيرات في index.css)
            default: "var(--main-bg)",
            // 🗂️ خلفية البطاقات والقوائم
            paper: "var(--card-bg)",
          },
          text: {
            // 📝 لون النصوص
            primary: theme === "light" ? "#121212" : "#ffffff",
            secondary: theme === "light" ? "#555555" : "#b0b0b0",
          },
        },
      }),
    [theme],
  );
  // const [locale, setLocale] = useState("ar")
  //   useEffect(()=>{
  //   i18n.changeLanguage("ar");

  // },[])

  const location = useLocation();
  // const noContextRoutes = ["/login", "/register", "/landing"];
  const noContextRoutes = [
    "/login",
    "/register",
    "/",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
  ];

  const isPublicInvoice = location.pathname.startsWith("/invoice/");
  return (
    <MuiThemeProvider theme={muiTheme}>
      <HelmetProvider>
        <CssBaseline />
        <>
          <ToastContainer
            position="bottom-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
            {/* للطباعه */}
            <Route path="/invoice/:uuid" element={<InvoiceDetails />} />
          </Routes>
          {noContextRoutes.includes(location.pathname) || isPublicInvoice ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/landing" element={<Landing />} /> */}
              <Route path="/" element={<Landing />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route path="/refund-policy" element={<RefundPolicy />} />
            </Routes>
          ) : (
            <PermissionProvider>
              <AuthProvider>
                <SettingsProvider>
                  <Routes>
                    <Route
                      element={
                        <ProtectedLayout allowedTypes={["admin", "subadmin"]} />
                      }
                    >
                      <Route element={<AdminLayout />}>
                        <Route
                          path="/admin/sub-admins"
                          element={<SubAdmins />}
                        />
                        <Route
                          path="/admin/complaints"
                          element={<Complaints />}
                        />
                        <Route path="/admin/reviews" element={<Reviews />} />
                        <Route
                          path="/admin/admin-permissions/:uuid"
                          element={
                            <Can permission="admin_permission_show">
                              <AdminPermissions />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/admin/subscriptions"
                          element={
                            <Can permission="subscriber_show">
                              <Subscriptions />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/admin/subscribtions-details"
                          element={
                            <Can permission="admin_show">
                              <SubscriptionsDetails />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <Can permission="admin_show">
                              <AdminSettings />{" "}
                            </Can>
                          }
                        />
                      </Route>
                    </Route>

                    <Route
                      element={
                        <ProtectedLayout allowedTypes={["user", "subuser"]} />
                      }
                    >
                      <Route element={<Layout />}>
                        {/* <Route path="/" element={<Home />} /> */}
                        <Route
                          path="/employees"
                          element={
                            <Can permission="employee_show">
                              {" "}
                              <Employees />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/test"
                          element={
                            <Can permission="employee_show">
                              {" "}
                              <Test />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/discount-rewards"
                          element={
                            <Can permission="empAdjustment_show">
                              <DiscountRewards />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/expenses"
                          element={
                            <Can permission="expense_show">
                              <Expenses />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/categories"
                          element={
                            <Can permission="category_show">
                              <Categories />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/services"
                          element={
                            <Can permission="service_show">
                              <Services />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/service-invoices"
                          element={
                            <Can permission="service_show">
                              <Invoices />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/licences"
                          element={
                            <Can permission="license_type_show">
                              <Licences />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/customers"
                          element={
                            <Can permission="customer_show">
                              <Customers />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/suppliers"
                          element={
                            <Can permission="customer_show">
                              <Suppliers />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/branches"
                          element={
                            <Can permission="branch_show">
                              <Branches />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/suppliers"
                          element={
                            <Can permission="service_show">
                              <Suppliers />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/add-car"
                          element={
                            <Can permission="car_show">
                              <AddCar />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/car-sales"
                          element={
                            <Can permission="car_sale_show">
                              <CarSales />
                            </Can>
                          }
                        />
                        <Route
                          path="/car-inventory-report"
                          element={
                            <Can permission="car_show">
                              <CarInventoryReport />
                            </Can>
                          }
                        />
                        <Route
                          path="/car-rental"
                          element={
                            <Can permission="car_rental_show">
                              <CarRental />
                            </Can>
                          }
                        />
                        <Route
                          path="/employeewithdraws"
                          element={
                            <Can permission="empWithdrawal_show">
                              <EmployeeWithdraws />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/money-invoices"
                          element={
                            <Can permission="money_invoice_show">
                              <MoneyInvoices />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/income-statement"
                          element={
                            <Can permission="income_statement_show">
                              <IncomeStatement />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/cash"
                          element={
                            <Can permission="cash_report_show">
                              <Cash />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/account-statement"
                          element={
                            <Can permission="account_statement_show">
                              <AccountStatement />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/services-expenses"
                          element={
                            <Can permission="expense_invoice_show">
                              <ServicesExpenses />
                            </Can>
                          }
                        />
                        <Route
                          path="/car-expenses"
                          element={
                            <Can permission="car_expense_show">
                              <CarExpenses />
                            </Can>
                          }
                        />
                        <Route
                          path="/taxes-report"
                          element={
                            <Can permission="invoice_taxReport">
                              <TaxesReport />
                            </Can>
                          }
                        />
                        <Route
                          path="/salary"
                          element={
                            <Can permission="salary_show">
                              <Salary />{" "}
                            </Can>
                          }
                        />

                        <Route
                          path="/partners"
                          element={
                            <Can permission="partner_show">
                              <Partners />
                            </Can>
                          }
                        />

                        <Route
                          path="/partner-withdrawals"
                          element={
                            <Can permission="owner_withdrawl_show">
                              <PartnerWithdrawals />
                            </Can>
                          }
                        />

                        <Route
                          path="/salary-details/:uuid"
                          element={<EmployeeDetails />}
                        />

                        <Route
                          path="/sub-users"
                          element={
                            <Can permission="sub_user_show">
                              {" "}
                              <SubUsers />{" "}
                            </Can>
                          }
                        />

                        <Route
                          path="/user-permissions/:uuid"
                          element={
                            <Can permission="permission_show">
                              <UserPermissions />{" "}
                            </Can>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <Can permission="setting_show">
                              <Settings />
                            </Can>
                          }
                        />
                        <Route
                          path="/cash-transfer"
                          element={
                            <Can permission="cash_transfer_show">
                              <CashTransfer />
                            </Can>
                          }
                        />

                        <Route
                          path="/dashboard"
                          element={
                            <Can permission="cash_transfer_show">
                              <Dashboard />
                            </Can>
                          }
                        />

                        <Route
                          path="/create-installment"
                          element={<CreateInstallment />}
                        />
                        <Route
                          path="/collect-installment"
                          element={<CollectInstallment />}
                        />
                        <Route
                          path="/installment-report"
                          element={<InstallmentReport />}
                        />
                        <Route
                          path="/banks"
                          element={
                            <Can permission="bank_show">
                              <Banks />
                            </Can>
                          }
                        />

                        <Route
                          path="/cash-injection"
                          element={
                            <Can permission="cash_injection_show">
                              <CashInjection />
                            </Can>
                          }
                        />

                        {/* <Route
                          path="/subscription-history"
                          element={<SubscriptionHistory />}
                        /> */}
                      </Route>
                    </Route>
                  </Routes>
                </SettingsProvider>
              </AuthProvider>
            </PermissionProvider>
          )}
        </>
      </HelmetProvider>
    </MuiThemeProvider>
  );
}

export default App;
