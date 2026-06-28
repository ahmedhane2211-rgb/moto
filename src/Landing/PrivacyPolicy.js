import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ArrowLeft, Sun, Moon, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { ReactComponent as Logo } from "../Group1171275083.svg";
import newLogo from "../newLogo.png";
import "./landing_modern.css";

const PrivacyPolicy = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };
  return (
    <div
      className={`landing-page ${theme === "dark" ? "dark" : "light"}`}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-mesh"></div>
      <div className="blob blob-1"></div>

      {/* 🚀 NAVBAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`landnavbar fixed-top w-100 d-flex justify-content-between align-items-center ${scrolled ? "scrolled" : ""}`}
      >
        <div className="d-flex align-items-center gap-4">
          <img src={newLogo} alt="Motogates logo" style={{ width: "50px" }} />
          <ul className="nav-links d-none d-lg-flex list-unstyled m-0 gap-4">
            <li>
              <a href="/#features">{t("our_advantages")}</a>
            </li>
            <li>
              <a href="/#services">{t("our_services")}</a>
            </li>
          </ul>
        </div>

        <div className="d-flex align-items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="theme-toggle"
            style={{ cursor: "pointer", color: "var(--text-main)" }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            onClick={toggleLanguage}
            className="lang-toggle"
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              color: "var(--text-main)",
            }}
          >
            <Globe size={18} className="me-1" />
            {i18n.language === "ar" ? "EN" : "AR"}
          </motion.div>

          {!isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="btn-modern-main py-2 px-4"
              style={{ fontSize: "0.9rem" }}
            >
              {t("login_landing")}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="btn-modern-main py-2 px-4"
            >
              {t("enter_dashboard")}
            </motion.button>
          )}
        </div>
      </motion.nav>

      <header
        className="header-section"
        style={{ height: "40vh", minHeight: "350px" }}
      >
        <div className="hero-glow"></div>
        <div className="container position-relative z-1 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/"
              className="btn-modern-main py-2 px-4 mb-5 d-inline-flex align-items-center gap-2"
              style={{ fontSize: "0.8rem" }}
            >
              <ArrowLeft size={16} />
              {i18n.language === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </Link>
            <h1
              className="hero-title-mega"
              style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)" }}
            >
              {t("privacy_policy")}
            </h1>
          </motion.div>
        </div>
      </header>

      <section className="py-20 container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="modern-card p-4 p-md-5 mx-auto"
          style={{ maxWidth: "900px" }}
        >
          <div className="d-flex align-items-center gap-3 mb-5">
            <div className="card-icon-modern m-0">
              <ShieldCheck size={32} />
            </div>
            <h2 className="h3 font-black uppercase m-0">
              {t("privacy_policy")}
            </h2>
          </div>

          <div
            className="content-text opacity-70 leading-relaxed"
            style={{ fontSize: "1rem" }}
          >
            <div className="mb-5">
              <p className="mb-1 font-bold h5">
                {i18n.language === "ar"
                  ? "منصة موتوجيتس"
                  : "Motogates Platform"}
              </p>
              <p className="mb-1">
                {i18n.language === "ar"
                  ? "مملوكة ومدارة من قبل IBGates"
                  : "Owned and operated by IBGates"}
              </p>
              <p className="small opacity-50">
                {i18n.language === "ar"
                  ? "آخر تحديث: [10 مارس 2026]"
                  : "Last updated: [March 10, 2026]"}
              </p>
            </div>

            <div className="decorative-line mb-5"></div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === "ar"
                  ? "المادة (1): التعريفات"
                  : "Article (1): Definitions"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "يقصد بالمصطلحات التالية المعاني المبينة قرين كل منها:"
                  : "The following terms shall have the meanings assigned to them below:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  <strong>
                    {i18n.language === "ar" ? '"المنصة":' : '"Platform":'}
                  </strong>{" "}
                  {i18n.language === "ar"
                    ? "نظام Motogates الإلكتروني."
                    : "The Motogates electronic system."}
                </li>
                <li>
                  •{" "}
                  <strong>
                    {i18n.language === "ar" ? '"الشركة":' : '"Company":'}
                  </strong>{" "}
                  {i18n.language === "ar"
                    ? "شركة IBGates المالكة للنظام."
                    : "IBGates, the owner of the system."}
                </li>
                <li>
                  •{" "}
                  <strong>
                    {i18n.language === "ar" ? '"المستخدم":' : '"User":'}
                  </strong>{" "}
                  {i18n.language === "ar"
                    ? "أي مكتب سيارات، معرض، شركة تأجير، أو جهة تجارية تستخدم النظام."
                    : "Any car dealership, showroom, rental company, or other business entity that uses the system."}
                </li>
                <li>
                  •{" "}
                  <strong>
                    {i18n.language === "ar" ? '"البيانات":' : '"Data":'}
                  </strong>{" "}
                  {i18n.language === "ar"
                    ? "أي معلومات يتم إدخالها أو معالجتها عبر النظام."
                    : "Any information entered or processed through the system."}
                </li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === "ar"
                  ? "المادة (2): الإطار القانوني المنظم"
                  : "Article (2): Governing Legal Framework"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "تخضع هذه السياسة إلى:"
                  : "This policy is subject to:"}
              </p>
              <div className="mb-3">
                <p className="fw-bold mb-1">
                  {i18n.language === "ar"
                    ? "في جمهورية مصر العربية:"
                    : "In the Arab Republic of Egypt:"}
                </p>
                <ul className="list-unstyled ps-3 pe-3">
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "قانون حماية البيانات الشخصية رقم 151 لسنة 2020"
                      : "Personal Data Protection Law No. 151 of 2020"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "قانون مكافحة جرائم تقنية المعلومات رقم 175 لسنة 2018"
                      : "Anti-Cybercrime Law No. 175 of 2018"}
                  </li>
                </ul>
              </div>
              <div>
                <p className="fw-bold mb-1">
                  {i18n.language === "ar"
                    ? "في المملكة العربية السعودية:"
                    : "In the Kingdom of Saudi Arabia:"}
                </p>
                <ul className="list-unstyled ps-3 pe-3">
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19)"
                      : "Personal Data Protection Law issued by Royal Decree No. (M/19)"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "نظام مكافحة الجرائم المعلوماتية"
                      : "Anti-Cybercrime Law"}
                  </li>
                </ul>
              </div>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                1. {i18n.language === "ar" ? "المقدمة" : "Introduction"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? 'مرحباً بكم في موتوجيتس ("المنصة"، "النظام"، "نحن")، وهو نظام رقمي مملوك ومدار من قبل IBGates.'
                  : "Welcome to Motogates (“the Platform,” “the System,” “we,” or “us”), a digital system owned and operated by IBGates."}
              </p>
              <p>
                {i18n.language === "ar"
                  ? "تقدم موتوجيتس حلولاً إدارية لـ:"
                  : "Motogates provides management solutions for:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "مراكز خدمة السيارات"
                    : "Car Service Centers"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "معالجة التأمين"
                    : "Insurance Processing"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "عقود البيع والشراء"
                    : "Sales and Purchase Contracts"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "إدارة نقل ملكية المركبات"
                    : "Vehicle Ownership Transfer Management"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "معارض تأجير السيارات"
                    : "Car Rental Dealerships"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "وكالات بيع وشراء السيارات"
                    : "Car Dealerships"}
                </li>
              </ul>
              <p>
                {i18n.language === "ar"
                  ? "توضح سياسة الخصوصية هذه كيفية جمعنا لمعلوماتك واستخدامها والإفصاح عنها وحمايتها عند استخدامك لموقعنا الإلكتروني:"
                  : "This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website:"}
              </p>
              <a
                href="https://www.motogates.com"
                target="_blank"
                rel="noreferrer"
                className="text-accent-custom text-decoration-none d-block mb-3"
              >
                https://www.motogates.com
              </a>
              <p>
                {i18n.language === "ar"
                  ? "بالوصول إلى المنصة أو استخدامها، فإنك توافق على شروط سياسة الخصوصية هذه."
                  : "By accessing or using the Platform, you agree to the terms of this Privacy Policy."}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                2.{" "}
                {i18n.language === "ar"
                  ? "المعلومات التي نجمعها"
                  : "Information We Collect"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "قد نجمع الأنواع التالية من المعلومات:"
                  : "We may collect the following types of information:"}
              </p>

              <div className="mb-3">
                <p className="fw-bold mb-1">
                  2.1.{" "}
                  {i18n.language === "ar"
                    ? "المعلومات الشخصية"
                    : "Personal Information"}
                </p>
                <ul className="list-unstyled ps-3 pe-3">
                  <li>
                    • {i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "الهوية الوطنية / السجل التجاري (إن وجد)"
                      : "National ID/Commercial Registration (if applicable)"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "عنوان البريد الإلكتروني"
                      : "Email Address"}
                  </li>
                  <li>
                    • {i18n.language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </li>
                  <li>• {i18n.language === "ar" ? "العنوان" : "Address"}</li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "معلومات الشركة"
                      : "Company Information"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "تفاصيل ملكية المركبة"
                      : "Vehicle Ownership Details"}
                  </li>
                </ul>
              </div>

              <div>
                <p className="fw-bold mb-1">
                  2.2.{" "}
                  {i18n.language === "ar"
                    ? "المعلومات التقنية"
                    : "Technical Information"}
                </p>
                <ul className="list-unstyled ps-3 pe-3">
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "عنوان بروتوكول الإنترنت (IP)"
                      : "Internet Protocol (IP) Address"}
                  </li>
                  <li>
                    • {i18n.language === "ar" ? "نوع المتصفح" : "Browser Type"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "معلومات الجهاز"
                      : "Device Information"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "نشاط تسجيل الدخول"
                      : "Login Activity"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "ملفات تعريف الارتباط وبيانات الاستخدام"
                      : "Cookies and Usage Data"}
                  </li>
                </ul>
              </div>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                3.{" "}
                {i18n.language === "ar"
                  ? "كيف نستخدم معلوماتك"
                  : "How We Use Your Information"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "نستخدم المعلومات التي نجمعها من أجل:"
                  : "We use the information we collect to:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "توفير وتشغيل نظام Motogates"
                    : "Provide and operate the Motogates system"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "إدارة حسابات المستخدمين"
                    : "Manage user accounts"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "تحسين أداء النظام"
                    : "Improve system performance"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "تقديم الدعم الفني"
                    : "Provide technical support"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "الامتثال للالتزامات القانونية والتنظيمية"
                    : "Comply with legal and regulatory obligations"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "منع الاحتيال الوصول غير المصرح به"
                    : "Preventing fraud and unauthorized access"}
                </li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                4.{" "}
                {i18n.language === "ar"
                  ? "مشاركة البيانات والإفصاح عنها"
                  : "Data Sharing and Disclosure"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "لا نبيع البيانات الشخصية. قد نشارك المعلومات مع:"
                  : "We do not sell personal data. We may share information with:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "السلطات الحكومية عند الاقتضاء قانونًا"
                    : "Government authorities were required by law"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "مقدمي خدمات معتمدين من جهات خارجية"
                    : "Authorized third-party service providers"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "معالجي الدفع"
                    : "Payment processors"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "المستشارين القانونيين"
                    : "Legal advisors"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "جميع الجهات الخارجية ملزمة بالحفاظ على سرية البيانات وأمنها."
                    : "All third parties are obliged to maintain the confidentiality and security of the data."}
                </li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                5. {i18n.language === "ar" ? "أمن البيانات" : "Data Security"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "تطبق IBGates تدابير أمنية تقنية وتنظيمية مناسبة، تشمل:"
                  : "IBGates implements appropriate technical and organizational security measures, including:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  • {i18n.language === "ar" ? "خوادم آمنة" : "Secure servers"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "نقل البيانات المشفر (SSL)"
                    : "Encrypted data transmission (SSL)"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "التحكم في الوصول بناءً على الأدوار"
                    : "Role-based access control"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "المراقبة الدورية للنظام"
                    : "Regular system monitoring"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "إجراءات النسخ الاحتياطي للبيانات"
                    : "Data backup procedures"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "مع ذلك، لا يوجد نظام يضمن أمنًا مطلقًا."
                    : "However, no system guarantees absolute security."}
                </li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                6.{" "}
                {i18n.language === "ar"
                  ? "الاحتفاظ بالبيانات"
                  : "Data Retention"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "نحتفظ ببيانات المستخدمين:"
                  : "We retain user data:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "طالما كان الحساب نشطًا"
                    : "For as long as the account is active"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "حسب ما يقتضيه القانون"
                    : "As required by law"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "حسب ما يلزم للوفاء بالالتزامات التعاقدية"
                    : "As necessary to fulfill contractual obligations"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "عند إنهاء الخدمة، قد تُؤرشف البيانات وفقًا للمتطلبات القانونية."
                    : "Upon termination of service, data may be archived in accordance with legal requirements."}
                </li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                7. {i18n.language === "ar" ? "حقوق المستخدمين" : "User Rights"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "بحسب القانون المعمول به، قد يكون للمستخدمين الحق في:"
                  : "In accordance with applicable law, users may have the right to:"}
              </p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "الوصول إلى بياناتهم"
                    : "Access their data"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "طلب تصحيحها"
                    : "Request its correction"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "طلب حذفها"
                    : "Request its deletion"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "تقييد معالجتها"
                    : "Restrict its processing"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "الاعتراض على معالجتها"
                    : "Object to its processing"}
                </li>
                <li>
                  •{" "}
                  {i18n.language === "ar"
                    ? "طلب نقلها"
                    : "Request for its transfer"}
                </li>
              </ul>
              <p>
                {i18n.language === "ar"
                  ? "يمكن تقديم الطلبات عبر:"
                  : "Requests can be submitted via:"}
                <br />
                📧{" "}
                <a
                  href="mailto:info@ibgates.com"
                  className="text-danger text-decoration-none"
                >
                  info@ibgates.com
                </a>
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-danger">
                8.{" "}
                {i18n.language === "ar"
                  ? "خصوصية الأطفال"
                  : "Children's Privacy"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "خدمات Motogates غير مخصصة للأفراد دون سن ١٨ عامًا."
                  : "Motogates services are not intended for individuals under the age of 18."}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-danger">
                9.{" "}
                {i18n.language === "ar"
                  ? "التغييرات على هذه السياسة"
                  : "Changes to this Policy"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "تحتفظ IBGates بالحق في تحديث سياسة الخصوصية هذه في أي وقت. سيتم نشر التغييرات على هذه الصفحة مع تاريخ التحديث."
                  : "IBGates reserves the right to update this Privacy Policy at any time. Changes will be posted on this page with the date of the update."}
              </p>
            </div>

            <div className="policy-section">
              <h3 className="h5 font-black mb-3 text-danger">
                10.{" "}
                {i18n.language === "ar"
                  ? "معلومات الاتصال"
                  : "Contact Information"}
              </h3>
              <p>
                {i18n.language === "ar"
                  ? "للاستفسارات المتعلقة بالخصوصية:"
                  : "For privacy-related inquiries:"}
              </p>
              <div className="fw-bold mb-3">IBGates</div>
              <p className="mb-2">
                <strong>
                  {i18n.language === "ar" ? "البريد الإلكتروني:" : "Email:"}
                </strong>
                <br />
                <a
                  href="mailto:info@ibgates.com"
                  className="text-danger text-decoration-none"
                >
                  info@ibgates.com
                </a>
              </p>
              <p className="mb-2">
                <strong>
                  {i18n.language === "ar" ? "العنوان:" : "Address:"}
                </strong>
                <ul className="list-unstyled ps-0">
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "[مصر، المنصورة، شارع الجلاء ]"
                      : "[Egypt, Mansoura, Al-Galaa Street]"}
                  </li>
                  <li>
                    •{" "}
                    {i18n.language === "ar"
                      ? "[المملكة العربية السعودية - ابها - شارع معمر بن عبد الله - حى المروج]"
                      : "[Kingdom of Saudi Arabia - Abha - Muammar Bin Abdullah Street - Al-Muruj District]"}
                  </li>
                </ul>
              </p>
              <p className="mb-0">
                <strong>{i18n.language === "ar" ? "الهاتف:" : "Phone:"}</strong>
                <ul className="list-unstyled ps-0">
                  <li>
                    •{" "}
                    <span dir="ltr" className="d-inline-block">
                      +966537980019
                    </span>
                  </li>
                  <li>
                    •{" "}
                    <span dir="ltr" className="d-inline-block">
                      +201508770072
                    </span>
                  </li>
                </ul>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
