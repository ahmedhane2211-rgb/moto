import React, { useState, useEffect, useRef } from "react"; // <-- استيراد useState, useEffect, useRef
import PropTypes from "prop-types";

const CircularProgressBar = ({
  percentage, // <-- هذه هي القيمة النهائية المستهدفة
  size = 150,
  strokeWidth = 25,
  bgColor = "var(--cirprogress)",
  progressColor = "#4CAF50",
  textColor = "#FFFFFF",
  title = "",
  shadowColor = "rgba(0, 0, 0, 0.35)",
  shadowOffsetY = "5px",
  shadowBlur = "10px",
  useGradient = true,
  gradientStartColor = "#81C784",
  gradientEndColor = "#388E3C",
  animationDuration = 1000, // <-- مدة الأنيميشن بالمللي ثانية (اختياري)
  animationDelay = 0, // <-- تأخير بدء الأنيميشن (اختياري)
}) => {
  // --- حالة لتتبع النسبة المئوية الحالية للأنيميشن ---
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const requestRef = useRef(); // لتخزين معرّف requestAnimationFrame للإلغاء
  const startTimeRef = useRef(); // لتخزين وقت بدء الأنيميشن

  // --- حسابات (تعتمد الآن على currentPercentage) ---
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // حساب الـ offset بناءً على النسبة الحالية للأنيميشن
  const offset = circumference - (currentPercentage / 100) * circumference;

  // --- التأثير الجانبي لتشغيل الأنيميشن ---
  useEffect(() => {
    // دالة الأنيميشن التي سيتم استدعاؤها بشكل متكرر
    const animate = (timestamp) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp + animationDelay; // تطبيق التأخير
      }

      const elapsed = Math.max(0, timestamp - startTimeRef.current); // الوقت المنقضي منذ البدء (مع التأخير)

      // حساب التقدم في الأنيميشن (من 0 إلى 1)
      const progress = Math.min(1, elapsed / animationDuration);

      // حساب القيمة الحالية بناءً على منحنى التقدم (هنا خطي، يمكنك استخدام easing)
      const nextPercentage = progress * percentage; // الانتقال من 0 إلى القيمة النهائية

      setCurrentPercentage(nextPercentage);

      // الاستمرار في الأنيميشن إذا لم نصل للنهاية
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // تأكد من أن القيمة النهائية مضبوطة بدقة
        setCurrentPercentage(percentage);
      }
    };

    // إعادة تعيين وبدء الأنيميشن
    startTimeRef.current = undefined; // إعادة تعيين وقت البدء
    setCurrentPercentage(0); // البدء من الصفر دائمًا عند تغيير 'percentage' أو عند التحميل الأول

    // إلغاء أي أنيميشن سابقة قد تكون قيد التشغيل
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // بدء الأنيميشن الجديد
    requestRef.current = requestAnimationFrame(animate);

    // --- دالة التنظيف (Cleanup) ---
    // يتم استدعاؤها عند إلغاء تحميل المكون أو قبل إعادة تشغيل التأثير بسبب تغيير 'percentage'
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [percentage, animationDuration, animationDelay]); // <-- تشغيل التأثير عند تغيير القيمة النهائية أو مدة الأنيميشن أو التأخير

  // --- توليد ID فريد للتدرج (يعتمد الآن على القيمة النهائية لضمان ثبات الـ ID) ---
  const gradientId = `progressGradient-${size}-${percentage}`;

  // --- أنماط SVG --- (تبقى كما هي)
  const svgRotateStyle = {
    transform: "rotate(-90deg)",
    transformOrigin: "center center",
  };
  const textStyle = {
    fill: textColor,
    fontSize: `${size * 0.2}px`,
    fontWeight: "bold",
    dominantBaseline: "middle",
    textAnchor: "middle",
    transition: "fill 0.3s ease", // انتقال ناعم لتغيير اللون إذا لزم الأمر
  };
  const titleStyle = {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "1.1em",
    color: textColor,
    fontFamily: "sans-serif",
  };
  const containerStyle = {
    display: "inline-block",
    padding: "20px",
  };
  const svgShadowStyle = {
    filter: `drop-shadow(0 ${shadowOffsetY} ${shadowBlur} ${shadowColor})`,
    overflow: "visible",
  };

  const progressStrokeColor = useGradient
    ? `url(#${gradientId})`
    : progressColor;

  return (
    <div style={containerStyle}>
      {title && <div style={titleStyle}>{title}</div>}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={svgShadowStyle}
      >
        {useGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientStartColor} />
              <stop offset="100%" stopColor={gradientEndColor} />
            </linearGradient>
          </defs>
        )}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="ssssdewsfef"
          strokeWidth={strokeWidth}
        />

        {/* --- دائرة التقدم (تعتمد على currentPercentage) --- */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressStrokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset} // <-- تستخدم الـ offset المحسوب من currentPercentage
          strokeLinecap="round"
          style={svgRotateStyle}
        />

        {/* --- نص النسبة المئوية (يعرض currentPercentage مقربة) --- */}
        <text x="50%" y="50%" style={textStyle}>
          {/* تقريب القيمة لأقرب عدد صحيح للعرض */}
          {`${Math.round(currentPercentage)}%`}
        </text>
      </svg>
    </div>
  );
};

// --- PropTypes محدثة ---
CircularProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
   useGradient: PropTypes.bool,
  gradientStartColor: PropTypes.string,
  gradientEndColor: PropTypes.string,
  animationDuration: PropTypes.number, // <-- Prop جديد
  animationDelay: PropTypes.number, // <-- Prop جديد
};

export default CircularProgressBar;
