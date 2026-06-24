import React from "react";

const ProfitCircle = ({ value = 50 }) => {
  // تأكد أن القيمة بين 0 و 100
  const percentage = Math.min(Math.max(value, 0), 100);

  // حساب محيط الدائرة لملء النسبة
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        className="-rotate-90 transform"
      >
        {/* الخلفية الرمادية */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        {/* دائرة الربح الخضراء */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#22c55e"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>

      {/* القيمة النصية */}
      <div className="absolute flex flex-col items-center justify-center text-center mt-[-90px]">
        <p className="text-2xl font-bold text-green-600">{percentage}%</p>
        <p className="text-sm text-gray-700 font-medium mt-1">صافي الربح</p>
      </div>
    </div>
  );
};

export default ProfitCircle;
