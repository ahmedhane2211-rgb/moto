import { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../Api/axiosConfig";
import { Form, Container, Row, Col, Card } from "react-bootstrap";
import MyInput from "../../Components/Myinput";
import MyButton from "../../Components/MyButton";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

function Register() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("/register", formData);

            if (res.data.status === 200) {
                localStorage.setItem("token", res.data.data.token);
                // تعيين نوع المستخدم تلقائياً كـ "user" عند التسجيل الجديد
                localStorage.setItem("userType", res.data.data.user?.type || "user");
                toast.success(res.data.message || t("register.success"));
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                Object.values(err.response.data.errors).forEach((msg) =>
                    toast.error(msg[0])
                );
            } else {
                toast.error(t("register.failed"));
            }
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
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

            <Row className="w-100 justify-content-center align-items-center position-relative py-5">
                <Col lg={5} md={7} sm={10} xs={12}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="glass-card p-4 p-md-5 login-card">
                            <Card.Body dir={isRTL ? "rtl" : "ltr"}>
                                <motion.div variants={itemVariants} className="text-center mb-4">
                                    <h2 className="fw-bold mb-2">{t("register.title")}</h2>
                                    <p className="text-muted small">{t("join_us_today")}</p>
                                </motion.div>

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <motion.div variants={itemVariants}>
                                                <MyInput
                                                    label={t("register.name")}
                                                    name="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </motion.div>
                                        </Col>
                                        <Col md={12}>
                                            <motion.div variants={itemVariants}>
                                                <MyInput
                                                    label={t("register.email")}
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </motion.div>
                                        </Col>
                                        <Col md={6}>
                                            <motion.div variants={itemVariants}>
                                                <MyInput
                                                    label={t("register.password")}
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </motion.div>
                                        </Col>
                                        <Col md={6}>
                                            <motion.div variants={itemVariants}>
                                                <MyInput
                                                    label={t("register.password_confirmation")}
                                                    name="password_confirmation"
                                                    type="password"
                                                    value={formData.password_confirmation}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </motion.div>
                                        </Col>
                                    </Row>

                                    <motion.div variants={itemVariants} className="mt-3">
                                        <MyButton
                                            text={t("register.submit")}
                                            loading={loading}
                                            className="w-100 py-2 rounded-pill shadow-sm"
                                        />
                                    </motion.div>
                                </Form>

                                <motion.div variants={itemVariants} className="text-center mt-4">
                                    <p className="small mb-0">
                                        {t("already_have_account")}{" "}
                                        <Link to="/login" className="fw-bold" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
                                            {t("login_button")}
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

export default Register;
