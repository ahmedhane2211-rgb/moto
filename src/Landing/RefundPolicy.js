import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './landing_modern.css';
import { ReactComponent as Logo } from '../Group1171275083.svg';

const RefundPolicy = () => {
  const { t, i18n } = useTranslation();
  const { theme,toggleTheme } = useTheme();
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
    <div className={`landing-page ${theme === 'dark' ? 'dark' : 'light'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-mesh"></div>
      <div className="blob blob-1"></div>
      {/* 🚀 NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`landnavbar fixed-top w-100 d-flex justify-content-between align-items-center ${scrolled ? 'scrolled' : ''}`}
      >
        <div className="d-flex align-items-center gap-4">
          <Logo style={{ width: "50px" }} />
          <ul className="nav-links d-none d-lg-flex list-unstyled m-0 gap-4">
            <li><a href="/#features">{t("our_advantages")}</a></li>
            <li><a href="/#services">{t("our_services")}</a></li>
          </ul>
        </div>

        <div className="d-flex align-items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="theme-toggle"
            style={{ cursor: "pointer", color: "var(--text-main)" }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.1 }}
            onClick={toggleLanguage}
            className="lang-toggle"
            style={{ cursor: "pointer", fontWeight: 'bold', color: "var(--text-main)" }}
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
              style={{ fontSize: '0.9rem' }}
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
      <header className="header-section" style={{ height: '40vh', minHeight: '350px' }}>
        <div className="hero-glow"></div>
        <div className="container position-relative z-1 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/" className="btn-modern-main py-2 px-4 mb-5 d-inline-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
              <ArrowLeft size={16} />
              {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
            <h1 className="hero-title-mega" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                {i18n.language === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}
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
          style={{ maxWidth: '900px' }}
        >
          <div className="d-flex align-items-center gap-3 mb-5">
            <div className="card-icon-modern m-0">
              <RefreshCcw size={32} />
            </div>
            <h2 className="h3 font-black uppercase m-0">{i18n.language === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}</h2>
          </div>

          <div className="content-text opacity-70 leading-relaxed" style={{ fontSize: '1rem' }}>
            <div className="mb-5 text-white">
              <p className="mb-1 font-bold h5">
                {i18n.language === 'ar' ? 'منصة موتوجيتس' : 'Motogates Platform'}
              </p>
              <p className="mb-1">
                {i18n.language === 'ar' ? 'مملوكة ومدارة من قبل IBGates' : 'Owned and operated by IBGates'}
              </p>
              <p className="small opacity-50">
                {i18n.language === 'ar' ? 'آخر تحديث: [10 مارس 2026]' : 'Last updated: [March 10, 2026]'}
              </p>
            </div>

            <div className="decorative-line mb-5"></div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === 'ar' ? 'المادة (1): الاشتراكات' : 'Article (1): Subscriptions'}
              </h3>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'الاشتراكات سنوية أو شهرية' : 'Annual or monthly subscriptions are available.'}</li>
                <li>• {i18n.language === 'ar' ? 'لا يتم رد قيمة الاشتراك بعد بدء فترة الخدمة' : 'Subscription fees are non-refundable after the service period has commenced.'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === 'ar' ? 'المادة (2): الاستثناءات' : 'Article (2): Exceptions'}
              </h3>
              <p>{i18n.language === 'ar' ? 'يجوز رد المبلغ في حال:' : 'Refunds may be issued in the following cases:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'تعطل كامل للنظام لمدة تتجاوز 15 يوماً متصلة' : 'Complete system outage for more than 15 consecutive days'}</li>
                <li>• {i18n.language === 'ar' ? 'ثبوت إخلال جوهري من الشركة' : 'Proven material breach by the company'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === 'ar' ? 'المادة (3): آلية الاسترجاع' : 'Article (3): Refund Procedure'}
              </h3>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'تقديم طلب رسمي الى خدمة العملاء باسم البريد الالكترونى المسجل به الإشتراك' : 'Submit a formal request to customer service using the email address registered with the subscription.'}</li>
                <li>• {i18n.language === 'ar' ? 'مراجعة فنية خلال 10 أيام عمل' : 'Technical review within 10 business days'}</li>
                <li>• {i18n.language === 'ar' ? 'إصدار القرار خلال 30 يوماً' : 'Decision issued within 30 days'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">
                {i18n.language === 'ar' ? 'المادة (4): بخصوص العملاء' : 'Article (4): Regarding Clients'}
              </h3>
              <p>{i18n.language === 'ar' ? 'بخصوص العملاء / المسخدمون:' : 'Regarding Clients/Users:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'يحظر على العميل تطوير نظام مماثل باستخدام خبرات مكتسبة من النظام لمدة 3 سنوات.' : 'The client is prohibited from developing a similar system using experience gained from the system for a period of 3 years.'}</li>
                <li>• {i18n.language === 'ar' ? 'لا يجوز نقل الحساب دون موافقة خطية.' : 'The account may not be transferred without written consent.'}</li>
                <li>• {i18n.language === 'ar' ? 'يحق للشركة تعديل خصائص النظام دون الرجوع للعميل.' : "The company has the right to modify the system's features without consulting the client."}</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3 className="h5 font-black mb-3 text-accent-custom">{i18n.language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}</h3>
              <div className="fw-bold mb-3">IBGates</div>
              <p className="mb-2">
                <strong>{i18n.language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong>
                <br />
                <a href="mailto:info@ibgates.com" className="text-accent-custom text-decoration-none">info@ibgates.com</a>
              </p>
              <p className="mb-0">
                <strong>{i18n.language === 'ar' ? 'الهاتف:' : 'Phone:'}</strong>
                <ul className="list-unstyled ps-0">
                  <li>• <span dir="ltr" className="d-inline-block">+966537980019</span></li>
                  <li>• <span dir="ltr" className="d-inline-block">+201508770072</span></li>
                </ul>
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default RefundPolicy;
