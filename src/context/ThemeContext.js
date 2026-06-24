import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// 🎨 هذا المكون مسؤول عن إدارة وضع (فاتح/داكن) وحفظه في المتصفح
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // 📂 جلب الوضع المحفوظ أو استخدام "light" كافتراضي
        return localStorage.getItem("theme") || "light";
    });

    useEffect(() => {
        // 💾 حفظ الوضع عند التغيير وتطبيقه على Bootstrap
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-bs-theme", theme); // Bootstrap 5.3 support
    }, [theme]);

    // 🔄 دالة التبديل بين الوضعين
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 🎣 هوك لاستخدام الثيم في أي مكان في التطبيق
export const useTheme = () => {
    return useContext(ThemeContext);
};
