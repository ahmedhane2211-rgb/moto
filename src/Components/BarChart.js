import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const colors = {
  cyan: {
    main: "#00bcd4",
    light: "#6ff9ff",
    dark: "#008ba3",
  },
  blue: {
    main: "#3f51b5",
    light: "#7986cb",
    dark: "#303f9f",
  },
  green: {
    main: "#4CAF50",
    light: "#81C784",
    dark: "#388E3C",
  },
  red: {
    main: "#F44336",
    light: "#E57373",
    dark: "#D32F2F",
  },
  orange: {
    main: "#FF9800",
    light: "#FFB74D",
    dark: "#F57C00",
  },
  purple: {
    main: "#9C27B0",
    light: "#BA68C8",
    dark: "#7B1FA2",
  },
  // أضف ألوان أخرى بنفس النمط
};

// --- المكونات المنسقة (Styled Components) ---

const ChartContainer = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  margin: 20px auto;
  width: 10%;
`;

const BarsArea = styled.div`
  display: flex;
  align-items: flex-end; /* Align bars to the bottom */
  justify-content: center;
  gap: 60px; /* Increased gap for 3D effect */
  height: 200px; /* IMPORTANT: Define the max height area */
  position: relative; /* Needed for potential absolute positioning within */
`;

// غلاف العمود والتسمية
const BarWrapper = styled.div`
  display: flex; /* اجعل الغلاف نفسه flex container */
  flex-direction: column; /* رتب محتوياته (العمود والتسمية) عمودياً */
  align-items: center; /* ركز المحتويات أفقياً */
  justify-content: flex-end; /* !!! ادفع المحتويات للأسفل !!! */
  height: 100%; /* !!! اجعل الغلاف يأخذ الارتفاع الكامل لمنطقة الرسم !!! */
  /* يمكنك إضافة لون خلفية مؤقت لرؤية حدود الغلاف */
  /* background-color: rgba(0, 255, 0, 0.1); */
`;

// --- عناصر الـ 3D ---
const BarTop = styled.div`
  content: "";
  position: absolute;
  top: -17px;
  left: 7px;
  width: 104%;
  height: 17px;
  transform: skewX(-45deg);
  background-color: ${(props) => colors[props.color]?.light || "#dddddd"};

  z-index: 1; /* Ensure top is above the side where they might overlap visually */
`;
//   background-color: ${(props) => colors[props.color]?.light || "#dddddd"};

const BarSide = styled.div`
  content: "";
  position: absolute;
  top: -9px;
  right: -18px;
  width: 18px;
  height: 100%;
  transform: skewY(-45deg);
  background-color: ${(props) => colors[props.color]?.dark || "#bbbbbb"};

  z-index: 0; /* Side is visually behind the front face */
`;
//   background-color: ${(props) => colors[props.color]?.dark || "#bbbbbb"};
// --------------------

// مكون العمود الرئيسي (الواجهة الأمامية)
const Bar = styled.div`
  width: 60px; /* Width of the front face */
  position: relative; /* Crucial for positioning the absolute top/side elements */
  transition: height 0.3s ease-out;
  background-color: ${(props) => colors[props.color]?.main || "#cccccc"};
  height: ${(props) => props.barHeight}%;
`;

// مكون التسمية
const Label = styled.div`
  margin-top: 15px; /* Space for 3D look */
  font-size: 16px;
  font-weight: bold; /* Bolder text for 3D version */
  text-align: center;
  white-space: nowrap;
`;

// --- المكون الرئيسي React ---
const BarChart3D = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("BarChart3D: No valid data provided.");
    return (
      <ChartContainer>
        <div className="centersss">
          {/* <p style={{ color: "red" }}>خطأ: بيانات المخطط غير متوفرة.</p> */}
          جاري التحمبل{" "}
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <BarsArea>
        {data.map((item, index) => {
          const isValidItem =
            item &&
            typeof item.value === "number" &&
            item.label &&
            item.color &&
            colors[item.color]; // Check color key exists

          if (!isValidItem) {
            console.warn(
              `BarChart3D: Skipping invalid data item at index ${index}:`,
              item
            );
            return (
              <div key={index} style={{ color: "orange", alignSelf: "center" }}>
                !
              </div>
            );
          }

          const barHeightValue = Math.max(0, Math.min(100, item.value));

          return (
            <BarWrapper key={index}>
              <Bar barHeight={barHeightValue} color={item.color}>
                <BarTop color={item.color} />
                <BarSide color={item.color} />
              </Bar>
              <Label>

                {item.value == 0 ? `(-) ${item.label} ` : `${item.label} (${item.value})`}
              </Label>
            </BarWrapper>
          );
        })}
      </BarsArea>
    </ChartContainer>
  );
};

// --- PropTypes ---
BarChart3D.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired, // Must match a key in 'colors' object
    })
  ),
};

// --- Export ---
export default BarChart3D;
