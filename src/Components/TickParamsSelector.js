import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

// ===================== بيانات المصروفات =====================
const chartData = {
  2022: {
    costOfServices: [
      2100, 1500, 4200, 1800, 2900, 3100, 4000, 1500, 2200, 4100, 3500, 3900,
    ],
    generalExpenses: [
      1800, 1750, 1850, 1800, 1900, 1950, 2000, 1850, 1900, 2100, 2050, 2150,
    ],
  },
  2023: {
    costOfServices: [
      2400, 1398, 9800, 3908, 4800, 3800, 4300, 3200, 5000, 6100, 2900, 4900,
    ],
    generalExpenses: [
      2200, 2150, 2250, 2200, 2300, 2350, 2400, 2250, 2300, 2500, 2450, 2550,
    ],
  },
  2024: {
    costOfServices: [
      3100, 2200, 7450, 4150, 5100, 4100, 4800, 3750, 5500, 6800, 3500, 5200,
    ],
    generalExpenses: [
      2600, 2550, 2650, 2600, 2700, 2750, 2800, 2650, 2700, 2900, 2850, 2950,
    ],
  },
};

const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// ===================== المكون الرئيسي =====================
export default function ExpensesChartPro() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const theme = useTheme();

  const { reversedMonths, reversedData } = useMemo(() => {
    return {
      reversedMonths: [...months].reverse(),
      reversedData: {
        costOfServices: [...chartData[selectedYear].costOfServices].reverse(),
        generalExpenses: [...chartData[selectedYear].generalExpenses].reverse(),
      },
    };
  }, [selectedYear]);

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        background: theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ===== العنوان ===== */}
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: theme.palette.text.primary,
          mb: 3,
        }}
      >
        إجمالي الايرادات
      </Typography>

      {/* ===== اختيار السنة ===== */}
      <FormControl
        size="small"
        sx={{
          mb: 3,
          minWidth: 180,
          background: theme.palette.background.paper,
        }}
      >
        <InputLabel>السنة</InputLabel>
        <Select
          value={selectedYear}
          label="السنة"
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {Object.keys(chartData).map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ===== الرسم البياني ===== */}
      <Box sx={{ width: "100%", height: 420 }}>
        <BarChart
          series={[
            {
              data: reversedData.costOfServices,
              label: "الايرادات",
              id: "services",
              color: "#950d6e",
            },
            {
              data: reversedData.generalExpenses,
              label: "تكلفة الخدمات",
              id: "expenses",
              color: "#1952af",
            },
          ]}
          xAxis={[
            {
              data: reversedMonths,
              scaleType: "band",
              categoryGapRatio: 0.4,
            },
          ]}
        
          sx={{
            "& .MuiChartsGrid-line": {
              strokeDasharray: "4 4",
              stroke: "#ddd",
            },
            [`& .${axisClasses.left} .${axisClasses.label}`]: {
              transform: "translateX(-8px)",
            },
            "& .MuiChartsLegend-label": {
              fontWeight: "bold",
            },
          }}
        />
      </Box>

      {/* ===== ملاحظة أسفل الرسم ===== */}
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          mt: 2,
          color: theme.palette.text.secondary,
        }}
      >
        * البيانات معروضة حسب الأشهر (من ديسمبر إلى يناير)
      </Typography>
    </Paper>
  );
}
