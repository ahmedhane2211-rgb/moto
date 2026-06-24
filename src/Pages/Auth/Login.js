// import { useState } from "react";
// import API from "../../Api/axiosConfig";
// import { Form, Container, Row, Col, Card } from "react-bootstrap";
// import MyInput from "../../Components/Myinput";
// import MyButton from "../../Components/MyButton";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate()
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await API.post("/login", { email, password });

//       // if (res.data.status) {
//       //   localStorage.setItem("token", res.data.data.token);
//       //   navigate("/");
//       //   console.log(res.data.data.message || "تم تسجيل الدخول بنجاح");
//       //   setTimeout(() => {
//       //     navigate("/");
//       //   }, 1500);
//       // }

//       if (res.data.status) {
//         localStorage.setItem("token", res.data.data.token);
//         localStorage.setItem("userType", res.data.data.user.type);

//         if (["admin", "subAdmin"].includes(res.data.data.user.type)) {
//           navigate("/admin/sub-admins");
//         } else {
//           navigate("/");
//         }
//       }

//       console.log(res);

//     } catch (err) {
//       console.log("فشل تسجيل الدخول");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container fluid className="vh-100 login-con">
//       <Row className="h-100 ">
//         <Col md={6} className="login-image d-none d-md-block"></Col>

//         <Col md={6} className="d-flex justify-content-center align-items-center">
//           <Card className="shadow-lg p-5 rounded-4 login-card w-75">
//             <Card.Body dir="rtl">
//               <h2 className="text-center mb-4">تسجيل الدخول</h2>
//               <Form onSubmit={handleSubmit}>
//                 <MyInput
//                   label="البريد الإلكتروني"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//                 <MyInput
//                   label="كلمة المرور"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <MyButton text="تسجيل الدخول" loading={loading} />
//               </Form>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default Login;

import { useState } from "react";
import API from "../../Api/axiosConfig";
import { Form, Container, Row, Col, Card } from "react-bootstrap";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 تسجيل الدخول العادي
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/login", { email, password });

      if (res.data.status) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("userType", res.data.data.user.type);

        if (["admin", "subAdmin"].includes(res.data.data.user.type)) {
          navigate("/admin/sub-admins");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.log(t("login_failed"));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 تسجيل الدخول باستخدام Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const response = await API.post("/auth/google", { token });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userType", response.data.user?.type || "user");

      if (["admin", "subadmin"].includes(response.data.user?.type)) {
        navigate("/admin/sub-admins");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(t("google_login_failed"), error);
    }
  };

  const handleGoogleError = () => {
    console.log(t("google_login_failed"));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <Container fluid className="login-con">
      {/* Background Decorative Shapes */}
      <div className="auth-background-shapes">
        <motion.div
          className="shape shape-1"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="shape shape-2"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Row className="w-100 justify-content-center align-items-center position-relative">
        {/* Centered Login Form */}
        <Col lg={4} md={6} sm={10} xs={12}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="glass-card p-4 p-md-5 login-card">
              <Card.Body dir={isRTL ? "rtl" : "ltr"}>
                <motion.div variants={itemVariants} className="text-center mb-4">
                  <h2 className="fw-bold mb-2">{t("login_title")}</h2>
                  <p className="text-muted small">{t("welcome_back")}</p>
                </motion.div>

                <Form onSubmit={handleSubmit}>
                  <motion.div variants={itemVariants}>
                    <MyInput
                      label={t("email")}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <MyInput
                      label={t("password")}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="d-flex justify-content-between mb-4 px-1">
                    <Form.Check type="checkbox" label={t("remember_me")} className="small" />
                    <Link to="/forgot-password" style={{ color: "var(--primary-color)", fontSize: "0.85rem", textDecoration: "none" }}>
                      {t("forgot_password")}
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <MyButton
                      text={t("login_button")}
                      loading={loading}
                      className="w-100 py-2 rounded-pill shadow-sm"
                    />
                  </motion.div>
                </Form>

                <motion.div variants={itemVariants} className="text-center my-4 divider">
                  <span className="px-2 text-muted small">{t("or")}</span>
                </motion.div>

                <motion.div variants={itemVariants} className="google-login-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="pill"
                    width="100%"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="text-center mt-4">
                  <p className="small mb-0">
                    {t("dont_have_account")}{" "}
                    <Link to="/register" className="fw-bold" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
                      {t("register_now")}
                    </Link>
                  </p>
                </motion.div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;

