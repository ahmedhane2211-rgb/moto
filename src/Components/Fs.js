import * as React from "react";
import { PieChart, pieArcClasses, pieClasses } from "@mui/x-charts/PieChart";
import { rainbowSurgePalette } from "@mui/x-charts/colorPalettes";
import { Paper, Typography, Box, useTheme } from "@mui/material";

export default function CommissionsExpensesChart() {
  const theme = useTheme();
  const palette = rainbowSurgePalette(theme.palette.mode);

  const data = [
    {
      category: "المصروفات التشغيلية",
      value: 400,
      subCategories: [
        { label: "وقود ونقل", value: 150 },
        { label: "صيانة المعدات", value: 100 },
        { label: "إيجارات", value: 150 },
      ],
    },
    {
      category: "العمولات البنكية",
      value: 250,
      subCategories: [
        { label: "عمولات بطاقات", value: 100 },
        { label: "تحويلات مالية", value: 80 },
        { label: "رسوم خدمات", value: 70 },
      ],
    },
  ];

  const data1 = data.map((item) => ({
    label: item.category,
    value: item.value,
  }));

  const data2 = data.flatMap((item, index) =>
    item.subCategories.map((sub) => ({
      label: sub.label,
      value: sub.value,
      color: palette[index],
    }))
  );

  const settings = {
    series: [
      {
        innerRadius: 0,
        outerRadius: 80,
        data: data1,
        arcLabel: (item) => item.label,
        arcLabelMinAngle: 20,
        highlightScope: { fade: "global", highlight: "item" },
      },
      {
        id: "outer",
        innerRadius: 100,
        outerRadius: 120,
        data: data2,
        arcLabel: (item) => item.label,
        arcLabelMinAngle: 20,
        highlightScope: { fade: "global", highlight: "item" },
      },
    ],
    height: 350,
    hideLegend: true,
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
        نسبة العمولات والمصروفات
      </Typography>

      <Box>
        <PieChart
          series={[
            {
              innerRadius: 0,
              outerRadius: 80,
              data: data1,
              arcLabel: (item) => item.label,
              arcLabelMinAngle: 25, // يظهر فقط العناصر الكبيرة
              highlightScope: { fade: "global", highlight: "item" },
            },
            {
              id: "outer",
              innerRadius: 100,
              outerRadius: 120,
              data: data2,
              arcLabel: () => "", // <<< إخفاء تسميات الدائرة الخارجية
              highlightScope: { fade: "global", highlight: "item" },
            },
          ]}
          height={350}
          hideLegend={true}
          sx={{
            [`.${pieClasses.series}[data-series="outer"] .${pieArcClasses.root}`]:
              {
                opacity: 0.7,
              },
            "& .MuiChartsPie-label": {
              fill: theme.palette.mode === "dark" ? "#fff" : "#333",
              fontSize: "0.75rem",
              fontWeight: "bold",
            },
          }}
        />
      </Box>
    </Paper>
  );
}
