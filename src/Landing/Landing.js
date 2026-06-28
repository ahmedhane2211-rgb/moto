import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  Car,
  ArrowRight,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Sun,
  Moon,
  Landmark,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";
import { ReactComponent as Logo } from "../Group1171275083.svg";
import { useTheme } from "../context/ThemeContext";
import "./landing_modern.css";
import MyInput from "../Components/Myinput";
import MyButton from "../Components/MyButton";
import { toast } from "react-toastify";
import API from "../Api/axiosConfig";
import Seo from "../Components/Seo";

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);
  const [scrolled, setScrolled] = useState(false);
  const [isContact, setIsContact] = useState(false);
  const [isComplain, setIsComplain] = useState(false);
  const [isRateModal, setIsRateModal] = useState(false);
  const isLoggedIn = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);

      const cards = document.querySelectorAll(".modern-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const [rateData, setRateData] = useState({
    name: "",
    phone: "",
    email: "",
    rate: "",
    message: "",
  });
  const handleRateSubmit = async (e) => {
  e.preventDefault();

  if (rateData.rate === 0) {
    toast.error(
      i18n.language === "ar"
        ? "برجاء اختيار التقييم بالنجوم أولاً"
        : "Please select a star rating first",
    );
    return;
  }

  try {
    const res = await API.post("/reviews", rateData);
    toast.success(
      i18n.language === "ar"
        ? "شكراً لك! تم إرسال تقييمك بنجاح"
        : "Thank you! Your review has been submitted",
    );
    setIsRateModal(false);
    setRateData({ name: "", phone: "", email: "", rate: 0, message: "" });
  } catch (error) {
    const generalMessage =
      error?.response?.data?.message ||
      (i18n.language === "ar"
        ? "حدث خطأ أثناء إرسال التقييم"
        : "An error occurred while submitting your review");

    toast.error(generalMessage);
  }
};
  const [complaintData, setComplaintData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    complaint: "",
  });
  const [complaintErrors, setComplaintErrors] = useState({});
  // ستيت للتحكم في تأثير الـ Hover على النجوم
  const [hoverRate, setHoverRate] = useState(0);

  const handleComplaintSubmit = async (e) => {
  e.preventDefault();

  setComplaintErrors({});

  try {
    await API.post("/complaints", complaintData);

    toast.success("تم إرسال الشكوى بنجاح");

    setIsComplain(false);

    setComplaintData({
      name: "",
      phone: "",
      email: "",
      address: "",
      complaint: "",
    });

    setComplaintErrors({});
  } catch (error) {
    const backendErrors = error?.response?.data?.errors;

    if (backendErrors) {
      // نحول كل array لأول رسالة فيها (string) لعرضها تحت الـ input
      const formattedErrors = Object.fromEntries(
        Object.entries(backendErrors).map(([field, messages]) => [
          field,
          Array.isArray(messages) ? messages[0] : messages,
        ])
      );
      setComplaintErrors(formattedErrors);
    } else {
      // مفيش errors تفصيلية (يعني مشكلة عامة في السيرفر مثلاً) → هنا التوست مناسب
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إرسال الشكوى"
      );
    }
  }
};

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <>
      <Seo
        title={t("seo.landing_title")}
        description={t("seo.landing_description")}
        keywords={t("seo.landing_keywords")}
      />
      <div
        className={`landing-page ${theme === "dark" ? "dark" : "light"}`}
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <motion.div style={{ y: y2 }} className="bg-mesh"></motion.div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        {/* 🚀 NAVBAR */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`landnavbar fixed-top w-100 d-flex justify-content-between align-items-center ${scrolled ? "scrolled" : ""}`}
        >
          <div className="d-flex align-items-center gap-4">
            <Logo style={{ width: "50px" }} />
            <ul className="nav-links d-none d-lg-flex list-unstyled m-0 gap-4">
              <li>
                <a href="#features">{t("our_advantages")}</a>
              </li>
              <li>
                <a href="#services">{t("our_services")}</a>
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

        {/* 🔥 HERO SECTION */}
        <section className="header-section text-center">
          <div className="hero-glow"></div>
          <motion.div
            style={{ y: y1, opacity: opacityHero }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container position-relative z-1"
          >
            <motion.p
              variants={itemVariants}
              className="hero-subtitle-p mx-auto font-black"
              style={{
                fontSize: "1.2rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--accent-custom)",
              }}
            >
              {t("hero_title")}
            </motion.p>
            <motion.h1 variants={itemVariants} className="hero-title-mega">
              {t("hello")}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="hero-subtitle-p mx-auto mb-5"
              style={{ maxWidth: "800px", opacity: 0.8 }}
            >
              {t("why_us_subtitle")}
            </motion.p>
          </motion.div>
        </section>

        {/* 📊 DESCRIPTION SECTION */}
        <div className="container py-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p
              className="lead opacity-80 mx-auto"
              style={{
                maxWidth: "900px",
                fontSize: "1.2rem",
                lineHeight: "1.8",
              }}
            >
              {t("landing_detailed_desc")}
            </p>
          </motion.div>
        </div>

        {/* ✨ FEATURES SECTION */}
        <section id="features" className="py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2
                className="hero-title-mega"
                style={{ fontSize: "3rem", textAlign: "start" }}
              >
                {t("our_advantages")}
              </h2>
            </motion.div>

            <div className="row g-5">
              {[
                {
                  icon: <Car />,
                  title: t("landing_rental_title"),
                  desc: t("landing_rental_desc"),
                },
                {
                  icon: <TrendingUp />,
                  title: t("landing_sales_title"),
                  desc: t("landing_sales_desc"),
                },
                {
                  icon: <Clock />,
                  title: t("landing_installment_title"),
                  desc: t("landing_installment_desc"),
                },
                {
                  icon: <Landmark />,
                  title: t("landing_bank_title"),
                  desc: t("landing_bank_desc"),
                },
              ].map((feature, idx) => (
                <div key={idx} className="col-lg-6" >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="modern-card h-100"
                    style={{border:"2px solid #84b2d3"}}
                  >
                    <div className="card-icon-modern">{feature.icon}</div>
                    <h3 className="h4 font-bold mb-4">{feature.title}</h3>
                    <p className="opacity-60 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🛠 WHY MOTOGATES SECTION */}
        <section id="services" className="py-20 services-section-bg">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="hero-title-mega" style={{ fontSize: "3rem" }}>
                {t("landing_why_motogates")}
              </h2>
            </motion.div>

            <div className="services-ultra-grid">
              {[
                { title: t("why_motogates_1") },
                { title: t("why_motogates_2") },
                { title: t("why_motogates_3") },
                { title: t("why_motogates_4") },
                { title: t("why_motogates_5") },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }} style={{border:"2px solid #84b2d3"}}
                  className="modern-card d-flex align-items-center justify-content-between p-6"
                >
                  <div>
                    <h4 className="h5 font-bold mb-0">{item.title}</h4>
                  </div>
                  <div
                    className="card-icon-modern m-0 p-0"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <CheckCircle size={18} className="text-accent-custom" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🤝 FOOTER REimagined */}
        <footer className="py-20 text-center premium-footer-modern">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Logo style={{ width: "80px" }} className="mb-10" />
              <h2 className="h1 font-black mb-10 opacity-80">
                {t("footer_desc")}
              </h2>

              {/* 📞 قسم تواصل معنا المباشر (الرقم والإيميل بروابط نقر سريعة) */}
              <div className="d-flex justify-content-center gap-5 flex-wrap mb-5 fs-5">
                <a
                  href={`mailto:${t("contact_email")}`}
                  className="d-flex align-items-center gap-2 text-decoration-none opacity-80 hover-opacity-100 transition-all"
                  style={{ color: "var(--accent-custom)" }}
                >
                  <Mail size={20} />
                  <span>{t("contact_email")}</span>
                </a>
                <a
                  href={`https://wa.me/${t("contact_phone_display")
                    .replace(/\+/g, "")
                    .replace(/\s/g, "")
                    .replace(/-/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="d-flex align-items-center gap-2 text-decoration-none opacity-80 hover-opacity-100 transition-all"
                  style={{ color: "var(--accent-custom)" }}
                  dir="ltr"
                >
                  <Phone size={20} />
                  <span>{t("contact_phone_display")}</span>
                </a>
              </div>

              <div className="d-flex justify-content-center gap-4 flex-wrap mb-5">
                <button
                  onClick={() => setIsRateModal(true)}
                  className="footer-link-modern text-decoration-none bg-transparent border-0 opacity-60 hover-opacity-100"
                  style={{ color: "var(--text-main)" }}
                >
                  {t("rates")}
                </button>
                <button
                  onClick={() => setIsComplain(true)}
                  className="footer-link-modern text-decoration-none bg-transparent border-0 opacity-60 hover-opacity-100"
                  style={{ color: "var(--text-main)" }}
                >
                  {t("Complaints")}
                </button>
                <Link
                  to="/privacy-policy"
                  className="footer-link-modern text-decoration-none opacity-60 hover-opacity-100"
                  style={{ color: "var(--text-main)" }}
                >
                  {t("privacy_policy")}
                </Link>
                <Link
                  to="/terms-and-conditions"
                  className="footer-link-modern text-decoration-none opacity-60 hover-opacity-100"
                  style={{ color: "var(--text-main)" }}
                >
                  {t("terms_conditions")}
                </Link>
                <Link
                  to="/refund-policy"
                  className="footer-link-modern text-decoration-none opacity-60 hover-opacity-100"
                  style={{ color: "var(--text-main)" }}
                >
                  {t("refund_policy")}
                </Link>
              </div>

              <a href="https://ibgates.com" target="_blank" rel="noopener noreferrer" className="mt-10 opacity-30 small text-decoration-none text-black">
                © {new Date().getFullYear()} IBgates - {t("rights_reserved")}
              </a>
            </motion.div>
          </div>
        </footer>

        {/* MODALS (تم حذف المودال الخاص بالتواصل والاحتفاظ بمودال الشكاوى) */}
        <Modal
          show={isComplain}
          onHide={() => setIsComplain(false)}
          centered
          className="modal-modern"
        >
          <Modal.Header
            closeButton
            className="border-0 px-5 pt-5 d-flex justify-content-between"
          >
            <Modal.Title className="h3 font-black uppercase">
              {t("Complaints")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <form onSubmit={handleComplaintSubmit}>
              <MyInput
                value={complaintData.name}
                onChange={(e) =>
                  setComplaintData({ ...complaintData, name: e.target.value })
                }
                label={t("name")}
                type="text"
                 error={complaintErrors.name}
              />
              <MyInput
                value={complaintData.email}
                onChange={(e) =>
                  setComplaintData({ ...complaintData, email: e.target.value })
                }
                label={t("email")}
                type="email"
                 error={complaintErrors.email}
              />
              <MyInput
                value={complaintData.phone}
                onChange={(e) =>
                  setComplaintData({ ...complaintData, phone: e.target.value })
                }
                label={t("phone")}
                type="tel"
                error={complaintErrors.phone}
              />
              <MyInput
                value={complaintData.address}
                onChange={(e) =>
                  setComplaintData({
                    ...complaintData,
                    address: e.target.value,
                  })
                }
                 error={complaintErrors.address}
                label={t("address")}
                type="address"
              />
              <MyInput
                value={complaintData.complaint}
                onChange={(e) =>
                  setComplaintData({
                    ...complaintData,
                    complaint: e.target.value,
                  })
                }
                 error={complaintErrors.complaint}
                label={t("complaint")}
                type="textarea"
                required
              />
              <MyButton
                text={t("submit")}
                variant="main"
                type="submit"
                className="w-fit me-auto d-block"
              />
            </form>
          </Modal.Body>
        </Modal>
        <Modal
          show={isRateModal}
          onHide={() => setIsRateModal(false)}
          centered
          className="modal-modern"
        >
          <Modal.Header
            closeButton
            className="border-0 px-5 pt-5 d-flex justify-content-between"
          >
            <Modal.Title className="h3 font-black uppercase">
              {t("rate_us_title", "تقييم خدماتنا")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-5 pb-5">
            <form onSubmit={handleRateSubmit}>
              {/* 🌟 نظام التقييم بالنجوم التفاعلي */}
              <div className="mb-4 text-center">
                <label className="d-block mb-2 opacity-70 small font-bold">
                  {t("your_rating", "ما هو تقييمك لبرنامج motoGates؟")}
                </label>
                <div className="d-flex justify-content-center gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.span
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ cursor: "pointer", transition: "color 0.2s" }}
                      onClick={() => setRateData({ ...rateData, rate: star })}
                      onMouseEnter={() => setHoverRate(star)}
                      onMouseLeave={() => setHoverRate(0)}
                    >
                      <Star
                        size={32}
                        fill={
                          (hoverRate || rateData.rate) >= star
                            ? "gold"
                            : "none"
                        }
                        stroke={
                          (hoverRate || rateData.rate) >= star
                            ? "gold"
                            : "currentColor"
                        }
                        className={
                          (hoverRate || rateData.rate) >= star
                            ? "opacity-100"
                            : "opacity-30"
                        }
                      />
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* الحقول المتبقية باستخدام المكون المخصص لديك MyInput */}
              <MyInput
                value={rateData.name}
                onChange={(e) =>
                  setRateData({ ...rateData, name: e.target.value })
                }
                label={t("name")}
                type="text"
                required
              />

              <MyInput
                value={rateData.email}
                onChange={(e) =>
                  setRateData({ ...rateData, email: e.target.value })
                }
                required
                label={t("email")}
                type="email"
              />

              <MyInput
                value={rateData.phone}
                onChange={(e) =>
                  setRateData({ ...rateData, phone: e.target.value })
                }
                label={t("phone")}
                type="tel"
                // required
              />

              <MyInput
                value={rateData.message}
                onChange={(e) =>
                  setRateData({ ...rateData, message: e.target.value })
                }
                label={t("your_message", "ملاحظاتك أو تجربتك")}
                type="textarea"
              />

              <MyButton
                text={t("submit_rate", "إرسال التقييم")}
                variant="main"
                type="submit"
                className="w-fit me-auto d-block mt-4"
              />
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default Landing;
