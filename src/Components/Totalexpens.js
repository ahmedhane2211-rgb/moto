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
import { useTranslation } from "react-i18next";

// ترتيب الأشهر بالعربي
const arabicMonths = [
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

// ✅ الكومبوننت الآن يستقبل props
export default function ExpensesChartPro({ data, tytle, smallLabel, revenueField, costField }) {
  const theme = useTheme();
  const { t } = useTranslation();

  // استخراج كل السنوات المتاحة
  const years = [...new Set(data.map((item) => item.year))].sort(
    (a, b) => b - a
  );
  const [selectedYear, setSelectedYear] = useState(years[0] || "");

  // تجهيز البيانات للرسم البياني
  const { revenueData, costData, monthLabels } = useMemo(() => {
    const filtered = data.filter((item) => item.year === Number(selectedYear));

    // ترتيب البيانات حسب ترتيب الأشهر
    const sorted = [...filtered].sort(
      (a, b) => arabicMonths.indexOf(a.month) - arabicMonths.indexOf(b.month)
    );

    return {
      revenueData: sorted.map((item) => item[revenueField]),
      costData: sorted.map((item) => item[costField]),
      monthLabels: sorted.map((item) => item.month),
    };
  }, [data, selectedYear, revenueField, costField]);

  // if (!data || data.length === 0) {
  //   return (
  //     <Paper sx={{ p: 3, textAlign: "center" }}>لا توجد بيانات لعرضها</Paper>
  //   );
  // }

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "var(--card-bg)",
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        {tytle}
      </Typography>

      {/* اختيار السنة */}
      <FormControl size="small" sx={{ mb: 3, minWidth: 180 }}>
        <InputLabel>{t("year")}</InputLabel>

        <Select
          value={selectedYear}
          label={t("year")}
          onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* الرسم البياني */}
      <Box sx={{ width: "100%", height: 420 }}>
        <BarChart
          series={[
            {
              data: revenueData,
              label: smallLabel.r,
              color: "#4caf50",
            },
            {
              data: costData,
              label: smallLabel.l,
              color: "#f44336",
            },
          ]}
          xAxis={[
            {
              data: monthLabels,
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
    </Paper>
  );
}
