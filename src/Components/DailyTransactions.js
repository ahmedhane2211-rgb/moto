import * as React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function DynamicDailyTransactions(dailyTransactions) {
  // const totalAmount = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          height: 380,
          display: "flex",
          flexDirection: "column",
        }}>
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          اليومية المالية
        </Typography>
        <div></div>
      </Paper>

      <Table
        striped
        bordered
        hover
        size="sm"
        className="table-dashboard direction-rtl">
        <thead>
          <tr>
            <th>م</th>
            <th>رقم الفاتورة</th>
            <th>التاريخ</th>
            <th>القيمة (ج.م)</th>
          </tr>
        </thead>
        <tbody>
          {/* {dailyTransactions.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell align="center">{row.invoiceNo}</TableCell>
              <TableCell align="center">{row.date}</TableCell>
              <TableCell align="center">
              {row.amount.toLocaleString()}
              </TableCell>
              </TableRow>
              ))} */}
          {dailyTransactions.map((row, index) => (
            <tr key={index}>
              <td colSpan="3" style={{ textAlign: "center" }}>
                {index + 1}
              </td>
              <td colSpan="3" style={{ textAlign: "center" }}>
                {row.invoice_number}
              </td>
              <td colSpan="3" style={{ textAlign: "center" }}>
                {row.date}
              </td>
              <td colSpan="3" style={{ textAlign: "center" }}>
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
