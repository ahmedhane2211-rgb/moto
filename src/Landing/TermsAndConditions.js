import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, ArrowLeft, Sun, Moon, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ReactComponent as Logo } from '../Group1171275083.svg';
import './landing_modern.css';

const TermsAndConditions = () => {
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
    <div className={`landing-page ${theme === 'dark' ? 'dark' : 'light'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-mesh"></div>
      <div className="blob blob-2"></div>
      
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link to="/" className="btn-modern-main py-2 px-4 mb-5 d-inline-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
              <ArrowLeft size={16} />
              {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
            <h1 className="hero-title-mega" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>{t("terms_conditions")}</h1>
          </motion.div>
        </div>
      </header>

      <section className="py-20 container">
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="modern-card p-4 p-md-5 mx-auto" 
          style={{ maxWidth: '900px' }}
        >
          <div className="d-flex align-items-center gap-3 mb-5">
            <div className="card-icon-modern m-0">
              <FileText size={32} />
            </div>
            <h2 className="h3 font-black uppercase m-0">{t("terms_conditions")}</h2>
          </div>

          <div className="content-text opacity-70 leading-relaxed" style={{ fontSize: '1rem' }}>
            <div className="mb-5 ">
              <p className="mb-1 font-bold h5">
                {i18n.language === 'ar' ? 'منصة موتوجيتس' : 'MotoGates Platform'}
              </p>
              <p className="mb-1">
                {i18n.language === 'ar' ? 'مملوكة لشركة IBGates' : 'Owned by IBGates'}
              </p>
              <p className="small opacity-50">
                {i18n.language === 'ar' ? 'آخر تحديث: [10 مارس 2026]' : 'Last Updated: [March 10, 2026]'}
              </p>
            </div>

            <div className="decorative-line mb-5"></div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">1. {i18n.language === 'ar' ? 'قبول الشروط' : 'Acceptance of Terms'}</h3>
              <p>
                {i18n.language === 'ar' 
                  ? 'بالوصول إلى منصة موتوجيتس أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام.'
                  : 'By accessing or using the MotoGates platform, you agree to be bound by these Terms and Conditions.'}
              </p>
              <p>
                {i18n.language === 'ar'
                  ? 'في حال عدم موافقتك، يُرجى عدم استخدام المنصة.'
                  : 'If you do not agree, please do not use the platform.'}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">2. {i18n.language === 'ar' ? 'وصف الخدمات' : 'Description of Services'}</h3>
              <p>{i18n.language === 'ar' ? 'موتوجيتس نظام رقمي يوفر ما يلي:' : 'MotoGates is a digital system that provides the following:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'إدارة مكاتب خدمة السيارات' : 'Car Service Office Management'}</li>
                <li>• {i18n.language === 'ar' ? 'إدارة معاملات التأمين' : 'Insurance Transaction Management'}</li>
                <li>• {i18n.language === 'ar' ? 'إدارة عقود بيع وشراء المركبات' : 'Vehicle Sales and Purchase Contract Management'}</li>
                <li>• {i18n.language === 'ar' ? 'تتبع نقل الملكية' : 'Ownership Transfer Tracking'}</li>
                <li>• {i18n.language === 'ar' ? 'أنظمة إدارة تأجير السيارات' : 'Car Rental Management Systems'}</li>
                <li>• {i18n.language === 'ar' ? 'حلول إدارة معارض السيارات' : 'Car Showroom Management Solutions'}</li>
                <li>• {i18n.language === 'ar' ? 'يُقدم النظام كمنصة برمجية كخدمة (SaaS).' : 'The system is offered as a Software as a Service (SaaS) platform.'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">3. {i18n.language === 'ar' ? 'تسجيل الحساب' : 'Account Registration'}</h3>
              <p>{i18n.language === 'ar' ? 'يجب على المستخدمين:' : 'Users must:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'تقديم معلومات دقيقة وكاملة' : 'Provide accurate and complete information'}</li>
                <li>• {i18n.language === 'ar' ? 'الحفاظ على سرية بيانات تسجيل الدخول' : 'Maintain the confidentiality of their login credentials'}</li>
                <li>• {i18n.language === 'ar' ? 'أن يكونوا مخولين قانونيًا لممارسة أنشطة متعلقة بالمركبات' : 'Be legally authorized to conduct vehicle-related activities'}</li>
                <li>• {i18n.language === 'ar' ? 'الامتثال للقوانين واللوائح المحلية' : 'Comply with local laws and regulations'}</li>
                <li>• {i18n.language === 'ar' ? 'تحتفظ IBGates بالحق في تعليق الحسابات في حال المخالفة.' : 'IBGates reserves the right to suspend accounts in case of violation.'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">4. {i18n.language === 'ar' ? 'مسؤوليات المستخدم' : 'User Responsibilities'}</h3>
              <p>{i18n.language === 'ar' ? 'يوافق المستخدمون على ما يلي:' : 'Users agree to the following:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'عدم استخدام النظام لأغراض غير قانونية' : 'Not to use the system for illegal purposes'}</li>
                <li>• {i18n.language === 'ar' ? 'عدم تحميل بيانات مزورة عن المركبات أو ملكيتها' : 'Not to upload false data about vehicles or their ownership'}</li>
                <li>• {i18n.language === 'ar' ? 'عدم التلاعب بسجلات التأمين أو العقود' : 'Not to tamper with insurance records or contracts'}</li>
                <li>• {i18n.language === 'ar' ? 'الامتثال لجميع قوانين المرور والتجارة والتأمين المعمول بها' : 'Comply with all applicable traffic, trade, and insurance laws'}</li>
                <li>• {i18n.language === 'ar' ? 'الحصول على تفويض رسمي من العملاء قبل معالجة بياناتهم' : 'Obtain formal authorization from customers before processing their data'}</li>
                <li>• {i18n.language === 'ar' ? 'الشركة غير مسؤولة عن رفض الجهات الحكومية لأي معاملة' : 'IBGates is not responsible for government rejection of any transaction'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">5. {i18n.language === 'ar' ? 'الملكية الفكرية' : 'Intellectual Property'}</h3>
              <p>
                {i18n.language === 'ar'
                  ? 'جميع محتويات وبرمجيات وتصميم وبنية نظام Motogates هي ملكية حصرية لشركة IBGates.'
                  : 'All content, software, design, and architecture of the Motogates system are the exclusive property of IBGates.'}
              </p>
              <p>{i18n.language === 'ar' ? 'جميع:' : 'All:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'الأكواد البرمجية' : 'Programming code'}</li>
                <li>• {i18n.language === 'ar' ? 'قواعد البيانات' : 'Databases'}</li>
                <li>• {i18n.language === 'ar' ? 'التصميم' : 'Design'}</li>
                <li>• {i18n.language === 'ar' ? 'الخوارزميات' : 'Algorithms'}</li>
              </ul>
              <p>{i18n.language === 'ar' ? 'مملوكة حصرياً لشركة IBGates.' : 'are the exclusive property of IBGates.'}</p>
              
              <div className="mt-4">
                <p className="fw-bold mb-2">{i18n.language === 'ar' ? 'لا يجوز للمستخدمين:' : 'Users may not:'}</p>
                <ul className="list-unstyled d-flex flex-wrap gap-3 ps-3 pe-3 py-2 rounded shadow-sm" style={{ color: 'var(--text-main)', opacity: 0.8 }}>
                  <li>{i18n.language === 'ar' ? 'النسخ' : '• Copying'}</li>
                  <li>{i18n.language === 'ar' ? 'التعديل' : '• Modifying'}</li>
                  <li>{i18n.language === 'ar' ? 'إعادة البيع' : '• Reselling'}</li>
                  <li>{i18n.language === 'ar' ? 'الهندسة العكسية' : '• Reverse Engineering'}</li>
                  <li>{i18n.language === 'ar' ? 'التوزيع' : '• Distribution'}</li>
                </ul>
                <p className="mt-2">{i18n.language === 'ar' ? 'أي جزء من النظام دون إذن كتابي.' : 'Any part of the system without written permission.'}</p>
              </div>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">6. {i18n.language === 'ar' ? 'الدفع والاشتراك' : 'Payment and Subscription'}</h3>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'المستخدمون ملزمون بدفع رسوم اشتراك سنوية' : 'Users are required to pay an annual subscription fee.'}</li>
                <li>• {i18n.language === 'ar' ? 'الرسوم غير قابلة للاسترداد ما لم يُنص على خلاف ذلك' : 'Fees are non-refundable unless otherwise stated.'}</li>
                <li>• {i18n.language === 'ar' ? 'يجوز لشركة IBGates تعديل الأسعار مع إشعار مسبق.' : 'IBGates may modify prices with prior notice.'}</li>
                <li>• {i18n.language === 'ar' ? 'هناك ثلاثة أيام كفترة تجريبية للبرنامج قبل إتمام عملية الإشتراك' : 'There is a three-day trial period before completing the subscription process.'}</li>
                <li>• {i18n.language === 'ar' ? 'الحد الأقصى لمسؤولية الشركة لا يتجاوز قيمة الاشتراك المدفوع خلال 12 شهراً' : 'The maximum liability of the company does not exceed the value of the subscription paid during 12 months'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">7. {i18n.language === 'ar' ? 'تحديد المسؤولية' : 'Limitation of Liability'}</h3>
              <p>{i18n.language === 'ar' ? 'لا تتحمل شركة IBGates المسؤولية عن:' : 'IBGates is not liable for:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'أخطاء البيانات التي يُدخلها المستخدمون' : 'Data errors entered by users'}</li>
                <li>• {i18n.language === 'ar' ? 'تأخيرات المعاملات الحكومية' : 'Delays in government transactions'}</li>
                <li>• {i18n.language === 'ar' ? 'الخسائر التجارية الناتجة عن سوء الاستخدام' : 'Business losses resulting from misuse'}</li>
                <li>• {i18n.language === 'ar' ? 'يتم توفير المنصة "كما هي".' : 'The platform is provided "as is".'}</li>
              </ul>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">8. {i18n.language === 'ar' ? 'توافر النظام' : 'System Availability'}</h3>
              <p>
                {i18n.language === 'ar'
                  ? 'مع أننا نسعى جاهدين لتحقيق أعلى نسبة تشغيل، إلا أن IBGates لا تضمن الوصول المتواصل. قد تتسبب أعمال الصيانة أو المشكلات التقنية في انقطاعات مؤقتة.'
                  : 'While we strive for the highest uptime, IBGates does not guarantee uninterrupted access. Maintenance or technical issues may cause temporary outages.'}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">9. {i18n.language === 'ar' ? 'الإنهاء' : 'Termination'}</h3>
              <p>{i18n.language === 'ar' ? 'يحق لـ IBGates تعليق أو إنهاء الحسابات في الحالات التالية:' : 'IBGates reserves the right to suspend or terminate accounts in the following cases:'}</p>
              <ul className="list-unstyled ps-3 pe-3">
                <li>• {i18n.language === 'ar' ? 'انتهاك الشروط' : 'Breach of Terms'}</li>
                <li>• {i18n.language === 'ar' ? 'اكتشاف أي نشاط احتيالي' : 'Detection of any fraudulent activity'}</li>
                <li>• {i18n.language === 'ar' ? 'التزامات قانونية تقتضي ذلك' : 'Legal obligations requiring such action'}</li>
              </ul>
              <p>
                {i18n.language === 'ar'
                  ? 'يحق للمستخدمين إنهاء حساباتهم بإشعار كتابي والتواصل مع خدمة العملاء.'
                  : 'Users may terminate their accounts by providing written notice and contacting customer support.'}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">10. {i18n.language === 'ar' ? 'القانون الحاكم' : 'Governing Law'}</h3>
              <p>
                {i18n.language === 'ar'
                  ? 'تخضع هذه الشروط لقوانين المملكة العربية السعودية.'
                  : 'These Terms are governed by the laws of the Kingdom of Saudi Arabia.'}
              </p>
              <p>
                {i18n.language === 'ar'
                  ? 'يتم حل أي نزاعات في المحاكم المختصة في المملكة العربية السعودية.'
                  : 'Any disputes shall be resolved in the competent courts of the Kingdom of Saudi Arabia.'}
              </p>
            </div>

            <div className="policy-section mb-5">
              <h3 className="h5 font-black mb-3 text-accent-custom">11. {i18n.language === 'ar' ? 'التعديلات' : 'Amendments'}</h3>
              <p>
                {i18n.language === 'ar'
                  ? 'تحتفظ IBGates بحق تعديل هذه الشروط في أي وقت. يُعد استمرار استخدام النظام بمثابة قبول للتحديثات.'
                  : 'IBGates reserves the right to modify these Terms at any time. Continued use of the system constitutes acceptance of the modifications.'}
              </p>
            </div>

            <div className="policy-section">
              <h3 className="h5 font-black mb-3 text-danger">12. {i18n.language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}</h3>
              <p>{i18n.language === 'ar' ? 'للاستفسارات المتعلقة بالخصوصية:' : 'For privacy-related inquiries:'}</p>
              <div className="fw-bold mb-3">IBGates</div>
              <p className="mb-2">
                <strong>{i18n.language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong>
                <br />
                <a href="mailto:info@ibgates.com" className="text-danger text-decoration-none">info@ibgates.com</a>
              </p>
              <p className="mb-2">
                <strong>{i18n.language === 'ar' ? 'العنوان:' : 'Address:'}</strong>
                <ul className="list-unstyled ps-0">
                  <li>• {i18n.language === 'ar' ? '[مصر، المنصورة، شارع الجلاء ]' : '[Egypt, Mansoura, Al-Galaa Street]'}</li>
                  <li>• {i18n.language === 'ar' ? '[المملكة العربية السعودية - ابها - شارع معمر بن عبد الله - حى المروج]' : '[Kingdom of Saudi Arabia - Abha - Muammar Bin Abdullah Street - Al-Muruj District]'}</li>
                </ul>
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

export default TermsAndConditions;
