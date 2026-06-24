import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../../src/App.css";
import "../../src/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faHome,
  faUsersGear,
  faUserTie,
  faBalanceScale,
  faMoneyCheckAlt,
  faTags,
  faConciergeBell,
  faUserFriends,
  faWallet,
  faFileInvoiceDollar,
  faReceipt,
  faChartLine,
  faCashRegister,
  faFileAlt,
  faSackDollar,
  faSignOutAlt,
  faGear,
  faChevronUp,
  faCar,
  faUserPlus,
  faChevronDown,
  faGlobe,              // 🌐 أيقونة تغيير اللغة
  faSun,                // ☀️ أيقونة الوضع النهاري
  faMoon,               // 🌙 أيقونة الوضع الليلي
  faCodeBranch,         // 🏢 أيقونة الفروع
  faTruck,              // 🚚 أيقونة الموردين
  faShoppingCart,       // 🛒 أيقونة مبيعات الخدمات
  faCrown,              // 👑 أيقونة الاشتراكات
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/ThemeContext";
import Can from "./Can";
import { useAuth } from "../context/AuthContext";
import defaultLogo from "../default-logo.jpg";
import { useTranslation } from "react-i18next"; // 🌍 i18n


// import {Logo as React}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🌍 i18n
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [locale, setLocale] = useState(i18n.language || "ar");

  // const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [openSubSection, setOpenSubSection] = useState(null);

  // 🌐 تغيير اللغة
  const toggleLanguage = () => {
    const newLang = locale === "ar" ? "en" : "ar";
    setLocale(newLang);
    i18n.changeLanguage(newLang);
  };

  // useEffect(() => {
  //   const subscription = user?.data?.lastSubscription;

  //   if (subscription && subscription.to) {

      // const today = new Date();
      // const endDate = new Date(subscription.to);
      // const diffTime = endDate - today;
      // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      // const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      // console.log("end", endDate, "today", today, "days", diffDays, diffHours);

      // if (diffDays > 0 && diffDays <= 10) {
      //     setSubscriptionMessage(
      //         `الاشتراك سينتهي بعد ${diffDays } يوم`
      //     );
      // }
  //     const now = new Date();
  //     const endDate = new Date(subscription.to);
  //     endDate.setHours(23, 59, 59, 999); 

  //     const diffMs = endDate - now;

  //     if (diffMs > 0) {
  //       const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  //     const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //     const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  //     if (diffDays >= 1) {
  //       // إذا كان هناك يوم واحد أو أكثر
  //       setSubscriptionMessage(
  //         t("subscription_ends_days", {
  //           days: diffDays,
  //           hours: diffHours,
  //           minutes: diffMinutes,
  //         })
  //       );
  //     } else {
  //       // إذا كان باقي ساعات ودقائق فقط (أقل من 24 ساعة)
  //       setSubscriptionMessage(
  //         t("subscription_ends_hours", {
  //           hours: diffHours,
  //           minutes: diffMinutes,
  //         })
  //       );
  //     }
  //   } else {
  //     // الوقت انتهى فعلياً
  //     setSubscriptionMessage(t("subscription_expired"));
  //   }
  // }

  // }, [user, t]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/login", { replace: true });
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
    setOpenSubSection(null); // Close sub-sections when switching main sections
  };

  const toggleSubSection = (subSection) => {
    setOpenSubSection(openSubSection === subSection ? null : subSection);
  };

  // console.log(user?.data);

  return (
    <>
      <nav  style={{borderBottom:theme === "dark" ? "1px solid #2a2627" : ""}} className="navbar no-print">
        <div className="navbar-container">
          <button className="menu-btn" onClick={toggleSidebar}>
            ☰
          </button>

          {/* {subscriptionMessage && (
            <div
              className="alert text-white mb-0 p-2"
              style={{
                background: "linear-gradient(135deg, #6a11cb 0%, #E50914 100%)",
                borderRadius: "5px",
                border: "none",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                fontWeight: "500",
              }}
            >
              {subscriptionMessage}
            </div>
          )} */}

          {/* logo + language icon */}
          <div className="d-flex align-items-center gap-3">
            

            {/* 🌗 زر تبديل الوضع (نهاري / ليلي) */}
            {/* <div
              onClick={toggleTheme}
              className="d-flex align-items-center gap-1 theme-toggle"
              style={{ cursor: "pointer", marginLeft: "10px", marginRight: "10px" }}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
            </div> */}
            <label className="switch" title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}>
              <span className="sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g fill="#ffd43b">
                    <circle r="5" cy="12" cx="12"></circle>
                    <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                  </g>
                </svg>
              </span>
              <span className="moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                </svg>
              </span>
              <input
                type="checkbox"
                className="input"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>




            {/* 🌐 Language Toggle */}
            <div
              onClick={toggleLanguage}
              className="d-flex align-items-center gap-1 lang-toggle"
              style={{ cursor: "pointer" }}
              title="Change Language"
            >
              <FontAwesomeIcon icon={faGlobe} color={`${theme === 'dark' ? "white" :"black"}`}/>
              <span style={{ fontWeight: "600",color:"initial" }}>
                {locale === "ar" ? "EN" : "AR"}
              </span>
            </div>

              <Link to="/dashboard">
              <img
                src={user?.data?.setting?.company_logo || defaultLogo}
                alt="Company Logo"
                style={{borderRadius:"50%",width:"35px",height:"35px",objectFit:"cover",objectPosition:"center"}}
                className="navbar-logo"
              />
            </Link>

          </div>
        </div>
      </nav>

      <div style={{borderInlineEnd:theme === "dark" ? "1px solid #2a2627" : ""}} className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={closeSidebar}>
          ×
        </button>
        <ul style={{borderTop:theme === "dark" ? "1px solid #2a2627" : ""}} >
          <li
            className="section-title"
            onClick={() => toggleSection("operations")}
          >
            {t("operations")}{" "}
            <FontAwesomeIcon
              icon={openSection === "operations" ? faChevronUp : faChevronDown}
            />
          </li>

          {openSection === "operations" && (
            <>
              {/* 1. التصنيفات */}
              <Can permission="category_show">
                <li>
                  <NavLink
                    to="/categories"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faTags} /> {t("categories")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="service_show">
                <li>
                  <NavLink
                    to="/services"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faTags} /> {t("services")}
                  </NavLink>
                </li>
              </Can>


              {/* 2. التراخيص */}
              <Can permission="license_type_show">
                <li>
                  <NavLink
                    to="/licences"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faConciergeBell} /> {t("licenses")}
                  </NavLink>
                </li>
              </Can>

              {/* 4. الفروع - NEW MODULE */}
              <Can permission="branch_show">
                <li>
                  <NavLink
                    to="/branches"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faCodeBranch} /> {t("branches")}
                  </NavLink>
                </li>
              </Can>

              {/* 5. العملاء */}
              {/* <Can permission="customer_show">
                <li>
                  <NavLink
                    to="/suppliers"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faUserFriends} /> {t("suppliers")}
                  </NavLink>
                </li>
              </Can> */}
              {/* 5. العملاء */}
              <Can permission="customer_show">
                <li>
                  <NavLink
                    to="/customers"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faUserFriends} /> {t("customers")}
                  </NavLink>
                </li>
              </Can>

              {/* 6. الموردين - NEW MODULE */}
              <Can permission="supplier_show">
                <li>
                  <NavLink
                    to="/suppliers"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faTruck} /> {t("suppliers")}
                  </NavLink>
                </li>
              </Can>


              {/* 7. مبيعات الخدمات */}
              <Can permission="invoice_show">
                <li>
                  <NavLink
                    to="/service-invoices"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} /> {t("service_sales")}
                  </NavLink>
                </li>
              </Can>



            </>
          )}

          <li className="section-title" onClick={() => toggleSection("cars")}>
            {t("cars")}{" "}
            <FontAwesomeIcon
              icon={openSection === "cars" ? faChevronUp : faChevronDown}
            />
          </li>
          {openSection === "cars" && (
            <>
              {/* إضافة سيارة جديدة */}
              <Can permission="car_show">
                <li>
                  <NavLink
                    to="/add-car"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}>
                    <FontAwesomeIcon icon={faCar} /> {t("add_new_car")}
                  </NavLink>
                </li>
              </Can>

              {/* مبيعات السيارات */}
              <Can permission="car_sale_show">
                <li>
                  <NavLink
                    to="/car-sales"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}>
                    <FontAwesomeIcon icon={faShoppingCart} /> {t("car_sales")}
                  </NavLink>
                </li>
              </Can>

              {/* عرض السيارات */}
              <Can permission="car_show">
                <li>
                  <NavLink
                    to="/car-inventory-report"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}>
                    <FontAwesomeIcon icon={faCar} /> {t("car_inventory_report")}
                  </NavLink>
                </li>
              </Can>

              {/* إيجار سيارة */}
              <Can permission="car_rental_show">
                <li>
                  <NavLink
                    to="/car-rental"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}>
                    <FontAwesomeIcon icon={faShoppingCart} /> {t("car_rental")}
                  </NavLink>
                </li>
              </Can>

              {/* مصروفات السيارات */}
              <Can permission="car_expense_show">
                <li>
                  <NavLink
                    to="/car-expenses"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} /> {t("car_expenses_title")}
                  </NavLink>
                </li>
              </Can>


            </>
          )}

          <li className="section-title" onClick={() => toggleSection("hr")}>
            {t("hr")}{" "}
            <FontAwesomeIcon
              icon={openSection === "hr" ? faChevronUp : faChevronDown}
            />
          </li>
          {openSection === "hr" && (
            <>
              <Can permission="employee_show">
                <li>
                  <NavLink
                    to="/employees"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faUserTie} /> {t("employees")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="empAdjustment_show">
                <li>
                  <NavLink
                    to="/discount-rewards"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faBalanceScale} /> {t("discountReward_title")}
                  </NavLink>
                </li>
              </Can>

              {/* مسحوبات الموظفين */}
              <Can permission="empWithdrawal_show">
                <li>
                  <NavLink
                    to="/employeewithdraws"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} /> {t("employee_withdraws")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="salary_show">
                <li>
                  <NavLink
                    to="/salary"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faMoneyCheckAlt} /> {t("salary_title")}
                  </NavLink>
                </li>
              </Can>

              {/* الشركاء */}
              <Can permission="partner_show">
                <li>
                  <NavLink
                    to="/partners"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faUserFriends} /> {t("partners_title")}
                  </NavLink>
                </li>
              </Can>
            </>
          )}

          <li className="section-title" onClick={() => toggleSection("financials")}>
            {t("financials_title")}{" "}
            <FontAwesomeIcon
              icon={openSection === "financials" ? faChevronUp : faChevronDown}
            />
          </li>
          {openSection === "financials" && (
            <>
              {/* 9. المصروفات */}
              <Can permission="expense_show">
                <li>
                  <NavLink
                    to="/expenses"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faWallet} /> {t("expenses")}
                  </NavLink>
                </li>
              </Can>

              {/* 11. سندات القبض */}
              <Can permission="money_invoice_show">
                <li>
                  <NavLink
                    to="/money-invoices"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faReceipt} /> {t("moneyInvoices_title")}
                  </NavLink>
                </li>
              </Can>

              {/* 13. تحويلات نقدية */}
              <Can permission="cash_transfer_show">
                <li>
                  <NavLink
                    to="/cash-transfer"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faSackDollar} /> {t("cash_transfers")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="owner_withdrawl_show">
                <li>
                  <NavLink
                    to="/partner-withdrawals"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} /> {t("partnerWithdrawals_title")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="cash_injection_show">
                <li>
                  <NavLink
                    to="/cash-injection"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faSackDollar} /> {t("cash_injection_title")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="bank_show">
                <li>
                  <NavLink
                    to="/banks"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faWallet} /> {t("banks_title")}
                  </NavLink>
                </li>
              </Can>
            </>
          )}

          <li className="section-title" onClick={() => toggleSection("installments")}>
            {t("installments")}{" "}
            <FontAwesomeIcon
              icon={openSection === "installments" ? faChevronUp : faChevronDown}
            />
          </li>
          {openSection === "installments" && (
            <>
              <li>
                <NavLink
                  to="/create-installment"
                  
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faMoneyCheckAlt} /> {t("create_installment")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/collect-installment"
                  
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faMoneyCheckAlt} /> {t("collect_installment")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/installment-report"
                  
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faFileAlt} /> {t("installment_report")}
                </NavLink>
              </li>
            </>
          )}

          <li
            className="section-title"
            onClick={() => toggleSection("reports")}
          >
            {t("reports")}{" "}
            <FontAwesomeIcon
              icon={openSection === "reports" ? faChevronUp : faChevronDown}
            />
          </li>
          {openSection === "reports" && (
            <>
              <Can permission="income_statement_show">
                <li>
                  <NavLink
                    to="/income-statement"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faChartLine} /> {t("income_statement")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="cash_report_show">
                <li>
                  <NavLink
                    to="/cash"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faCashRegister} /> {t("cash_report")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="account_statement_show">
                <li>
                  <NavLink
                    to="/account-statement"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faFileAlt} /> {t("account_statement")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="expense_invoice_show">
                <li>
                  <NavLink
                    to="/services-expenses"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faFileAlt} /> {t("service_expenses")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="invoice_taxReport">
                <li>
                  <NavLink
                    to="/taxes-report"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faSackDollar} /> {t("permissions.invoice_taxReport")}
                  </NavLink>
                </li>
              </Can>



              {/* 14. الأقساط */}

            </>
          )}

          <li className="section-title" onClick={() => toggleSection("system")}>
            {t("system")}{" "}
            <FontAwesomeIcon
              icon={openSection === "system" ? faChevronUp : faChevronDown}
            />
          </li>

          {openSection === "system" && (
            <>
              {/* <li>
                <NavLink
                  to="/"
                  
                  className={({ isActive }) => (isActive ? "active" : "")}>
                  <FontAwesomeIcon icon={faHome} /> الرئيسية
                </NavLink>
              </li> */}

              <Can permission="sub_user_show">
                <li>
                  <NavLink
                    to="/sub-users"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faUsersGear} /> {t("users")}
                  </NavLink>
                </li>
              </Can>

              <Can permission="setting_show">
                <li>
                  <NavLink
                    to="/settings"
                    
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <FontAwesomeIcon icon={faGear} /> {t("settings")}
                  </NavLink>
                </li>
              </Can>

              {/* <li>
                <NavLink
                  to="/subscription-history"
                  
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FontAwesomeIcon icon={faCrown} /> {t("subscription_history")}
                </NavLink>
              </li> */}

            </>
          )}
          <hr />

          <button onClick={handleLogout} className="logout-btn">
            <FontAwesomeIcon icon={faSignOutAlt} /> {t("logout")}
          </button>

        </ul>
      </div>
    </>
  );
}

export default Navbar;
