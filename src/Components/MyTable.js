import { useEffect, useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import API from "../Api/axiosConfig";
import MyButton from "./MyButton";
import Can from "./Can";
import MyInput from "./Myinput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";
import { FloatingLabel } from "react-bootstrap";
import Logo from "../logo.svg";
import Alert from "react-bootstrap/Alert";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import PrintTemplate from "./PrintTemplate";


function MyTable({
  resource,
  columns,
  refreshKey,
  method = "get",
  title,
  body = {},
  filters = [],
  appendData = true,
  dateFilter = null,
  button = { text: "", onClick: null, variant: "success", permission: "" },
  component = null,
  invoice = false,
  baseFilter = null,
}) {
  const [data, setData] = useState([]);
  const { t, i18n } = useTranslation();
  const [lastTotalValue, setLastTotalValue] = useState();
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const tableRef = useRef(null);
  const { settings } = useSettings();
  const [balance, setBalance] = useState();
  const [taxBalance, setTaxBalance] = useState();
  const { theme } = useTheme();
  const printRef = useRef(null);

  useEffect(() => {
    setData([]);
    setCurrentPage(1);
  }, [resource, refreshKey]);

  const bodyString = JSON.stringify(body);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        const url = `/${resource}?page=${currentPage}`;

        if (method.toLowerCase() === "post") {
          res = await API.post(url, body);
        } else {
          res = await API.get(url);
        }
        let newData = [];
        if (component === "taxesReport") {
          newData = res.data.data.invoices || [];
          setTaxBalance(res.data.data.total_tax);
        } else {
          newData = res.data.data || [];
        }
        // const newData = res.data.data || [];
        const lastTotalValue = res.data.last_total_value || null;
        // console.log(newData);

        if (appendData && currentPage > 1) {
          setData((prevData) => [...prevData, ...newData]);
        } else {
          setData(newData);
        }
        setLastTotalValue(lastTotalValue);

        const paginationData = res.data.pagination;
        if (paginationData) {
          setHasMore(paginationData.current_page < paginationData.last_page);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error(`فشل في جلب ${resource}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resource, refreshKey, method, currentPage, appendData, bodyString]);
  
  useEffect(() => {
    if (component === "accountStatement" && data.length > 0) {
      const total = data.reduce(
        (sum, item) => sum + parseFloat(item.value || 0),
        0,
      );
      // console.log(data);
      setBalance(`${total < 0 ? `(${total})` : total} : الرصيد الحالي`);
    } else if (component === "accountStatement" && data.length == 0) {
      setBalance(null);
    }
    if (component === "cash" && data.length > 0) {
      // console.log(data);

      // const totalValue = data.reduce(
      //   (sum, item) => item.total_value,
      // );

      const cashType = data[0]?.cash_type === "bank" ? "البنك" : "الخزنة";

      setBalance(
        `${
          lastTotalValue
            ? typeof lastTotalValue === "object"
              ? "UnKnown"
              : lastTotalValue
            : "unKnown"
        } : رصيد ${cashType}`,
      );
    }
  }, [data, component]);

  

  useEffect(() => {
    const today = new Date();

    // أول يوم في الشهر الحالي
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    // آخر يوم في الشهر الحالي
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // نحول التاريخ إلى صيغة YYYY-MM-DD بدون UTC
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setDateFrom(formatDate(firstDay));
    setDateTo(formatDate(lastDay));
  }, []);

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const filteredData = data.filter((item) => {
    if (baseFilter && !baseFilter(item)) return false;

    const passesFilters = filters.every((f) => {
      const filterValue = filterValues[f.name];
      if (!filterValue || filterValue === "") return true;
      const cellValue = f.name.includes(".")
        ? f.name.split(".").reduce((acc, key) => acc?.[key], item)
        : item[f.name];
      return cellValue
        ?.toString()
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });

    if (dateFilter && (dateFrom || dateTo)) {
      const itemDate = dateFilter.field.includes(".")
        ? dateFilter.field.split(".").reduce((acc, key) => acc?.[key], item)
        : item[dateFilter.field];
      if (!itemDate) return false;
      const itemDateObj = new Date(itemDate);
      if (dateFrom) {
        const fromDateObj = new Date(dateFrom);
        if (itemDateObj < fromDateObj) return false;
      }
      if (dateTo) {
        const toDateObj = new Date(dateTo);
        toDateObj.setHours(23, 59, 59, 999);
        if (itemDateObj > toDateObj) return false;
      }
    }
    return passesFilters;
  });
  
  const handlePrint = useReactToPrint({
  contentRef: printRef, // نربطه بمكون الطباعة وليس الجدول الرئيسي
  documentTitle: title || "Print",
});

  const exportToExcel = () => {
    const isRTL = i18n.language === "ar";
    const visibleColumns = columns.filter((col) => !col.hideOnPrint);

    // Build header row
    const headers = [isRTL?"م" :"No", ...visibleColumns.map((col) => col.header)];

    // Build data rows
    const dataRows = filteredData.map((row, rowIndex) => {
      const cells = visibleColumns.map((col) => {
        let value;
        if (typeof col.accessor === "function") {
          value = col.accessor(row, rowIndex);
          // If accessor returns JSX, try to extract a plain value
          if (typeof value === "object" && value !== null) {
            if (row.rate !== undefined) {
              value = `${row.rate} / 5`;
            } else {
              value = "";
            }
          }
        } else if (
          typeof col.accessor === "string" &&
          col.accessor.includes(".")
        ) {
          value = col.accessor
            .split(".")
            .reduce((acc, key) => acc?.[key], row);
        } else {
          value = row[col.accessor];
        }
        return value ?? "";
      });
      return [rowIndex + 1, ...cells];
    });

    // Combine headers + data
    const worksheetData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set RTL direction for the sheet
    if (isRTL) {
      if (!ws["!sheetView"]) ws["!sheetView"] = [];
      ws["!sheetView"] = [{ rightToLeft: true }];
    }

    // Style header row: bold + background color
    const headerRange = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center", readingOrder: isRTL ? 2 : 1 },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    // Style data cells: alternating rows + center alignment
    for (let R = 1; R <= headerRange.e.r; R++) {
      for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: "", t: "s" };
        }
        ws[cellAddress].s = {
          alignment: { horizontal: "center", vertical: "center", readingOrder: isRTL ? 2 : 1, wrapText: true },
          fill: { fgColor: { rgb: R % 2 === 0 ? "F2F2F2" : "FFFFFF" } },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        };
      }
    }

    // Auto column widths
    ws["!cols"] = headers.map((h, i) => {
      const maxLen = Math.max(
        String(h).length,
        ...dataRows.map((row) => String(row[i] ?? "").length)
      );
      return { wch: Math.min(maxLen + 4, 40) };
    });

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || resource || "Sheet1");
    XLSX.writeFile(wb, `${title || resource || "export"}.xlsx`);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-end flex-nowrap">
        <div className="d-flex gap-3">
          {button.text &&
            (button.permission ? (
              <Can permission={button.permission}>
                <MyButton
                  text={button.text || "إضافة"}
                  variant={button.variant || "success"}
                  type="button"
                  className="align-self-end text-white fw-bold"
                  onClick={button.onClick}
                />
              </Can>
            ) : (
              <MyButton
                text={button.text || "إضافة"}
                variant={button.variant || "success"}
                type="button"
                className="align-self-end text-white fw-bold"
                onClick={button.onClick}
              />
            ))}
          <div className="no-print align-self-end d-flex gap-2">
            <button className="btn" onClick={handlePrint} title={i18n.language === "ar" ? "طباعة" : "Print"}>
              <FontAwesomeIcon icon={faPrint} />
            </button>
            <button className="btn text-success" onClick={exportToExcel} title={i18n.language === "ar" ? "تصدير إكسل" : "Export to Excel"}>
              <FontAwesomeIcon icon={faFileExcel} />
            </button>
          </div>
        </div>
        {(filters.length > 0 || dateFilter) && (
          <div className="d-flex mb-3 gap-4 flex-wrap flex-grow-1 justify-content-end">
            {filters.map((f, i) => (
              <div key={i} style={{ minWidth: "180px" }}>
                {f.type === "select" ? (
                  // <div className="newSelect">
                  //   <label>{f.label}</label>
                  //   <select onChange={(e) =>
                  //       handleFilterChange(f.name, e.target.value)
                  //     } value={filterValues[f.name] || ""}>
                  //     {f.options.map((opt, j) => (
                  //       <option key={j} value={opt.value}>
                  //         {opt.label}
                  //       </option>
                  //     ))}
                  //   </select>
                  // </div>
                  <FloatingLabel label={f.label}>
                    <Form.Select
                      className="form-select mb-3"
                      style={{ height: "38px", }}
                      value={filterValues[f.name] || ""}
                      onChange={(e) =>
                        handleFilterChange(f.name, e.target.value)
                      }
                    >
                      {f.options.map((opt, j) => (
                        <option key={j} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                ) : (
                  <MyInput
                    type="text"
                    className="form-control mb-3"
                    value={filterValues[f.name] || ""}
                    label={f.label}
                    onChange={(e) => handleFilterChange(f.name, e.target.value)}
                    placeholder={f.label}
                    style={{ height: "38px" }}
                  />
                )}
              </div>
            ))}

            {dateFilter && (
              <>
                <div
                  className="d-flex align-items-end justify-content-between"
                  style={{ minWidth: "180px" }}
                >
                  <div className="d-flex gap-4 align-items-start">
                    <div style={{ minWidth: "180px" }}>
                      <MyInput
                        type="date"
                        label={t("from")}
                        className="form-control"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div style={{ minWidth: "180px" }}>
                      <MyInput
                        type="date"
                        label={t("to")}
                        className="form-control"
                        value={dateTo}
                        min={dateFrom}
                        onChange={(e) => {
                          // منع اختيار تاريخ يدوي أقل من dateFrom إذا كان المتصفح لا يدعم min بشكل صارم
                          if (dateFrom && e.target.value < dateFrom) {
                            setDateTo(dateFrom);
                          } else {
                            setDateTo(e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* {loading && currentPage === 1 ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <> */}
          <div ref={tableRef} style={{ color: "#000", marginTop: "10px" }}>
            {component && (
              <div className="text-center">
                <p className="fs-5 fw-medium text-white mb-0">{balance}</p>
              </div>
            )}

            <Table
              striped
              bordered
              hover
              responsive
              className="text-center my-table-container"
            >
              <thead>
                {/* <tr className="bg-transparent ">
                  <th
                    className="bg-transparent p-0"
                    colSpan={columns.length + 1}
                    style={{ border: "none" }}
                  >
                    <div
                      className="print-header w-100"
                      style={{
                        display: "flex",
                        justifyItems: "center",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        borderBottom: "1px solid black",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {settings?.head_invoice_address == 1 &&
                          settings?.company_address}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "22px",
                        }}
                      >
                        {settings?.head_company_name == 1 &&
                          settings?.company_name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {settings?.head_company_logo == 1 &&
                        settings?.company_logo ? (
                          <img
                            src={settings?.company_logo}
                            alt="Logo"
                            style={{ height: "40px", width: "auto" }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "16px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            logo{" "}
                            <img
                              src={Logo}
                              alt="logo"
                              style={{ height: "24px", marginLeft: "5px" }}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                </tr> */}

                <tr className="my-table-head">
                  <th
                    style={{
                      background: theme === "dark" ? "#16161a" : "#75777E",
                    }}
                  >
                    {t("serial_number")}
                  </th>
                  {columns.map((col, i) => (
                    <th
                      style={{
                        background: theme === "dark" ? "#16161a" : "#75777E",
                      }}
                      // c
                      key={i}
                      className={
                        col.hideOnPrint ? "no-print my-table-header" : ""
                      }
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="my-table-content">
                      <td>{rowIndex + 1}</td>
                      {columns.map((col, colIndex) => {
                        let value;
                        if (typeof col.accessor === "function") {
                          value = col.accessor(row, rowIndex);
                        } else if (
                          typeof col.accessor === "string" &&
                          col.accessor.includes(".")
                        ) {
                          value = col.accessor
                            .split(".")
                            .reduce((acc, key) => acc?.[key], row);
                        } else {
                          value = row[col.accessor];
                        }
                        return (
                          <td
                            key={colIndex}
                            className={`my-table-cell ${
                              col.hideOnPrint ? "no-print" : ""
                            }`}
                          >
                            {value ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center">
                      {t("no_data_available")}
                    </td>
                  </tr>
                )}
              </tbody>
              {/* <tfoot className="only-print">
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    style={{ border: "none", padding: 0 }}
                  >
                    <div className="only-print  w-100">
                      <div
                        className="d-flex justify-content-between px-4 py-3"
                        style={{ borderTop: "1px solid black" }}
                      >
                        <div
                          style={{
                            fontSize: "16px",
                            textAlign: "end",
                            lineHeight: "2",
                            direction: { ar: "ltr", en: "rtl" }[i18n.language],
                          }}
                        >
                          <div>
                            <span>
                              {settings?.company_phone || "01005612315"}
                            </span>{" "}
                            <strong> :واتساب</strong>
                          </div>
                          <div>
                            <span>
                              {settings?.company_phone || "01023150231"}
                            </span>{" "}
                            <strong> :هاتف الشركة</strong>
                          </div>
                          <div>
                            <span>
                              {settings?.company_commercial || "5132501"}
                            </span>{" "}
                            <strong> :رقم حساب الشركة</strong>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "16px",
                            lineHeight: "2",
                            direction: { ar: "rtl", en: "ltr" }[i18n.language],
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <strong>الموقع الإلكتروني: </strong>{" "}
                            {settings?.company_website ||
                              "http://www.nyhexiruru.me.uk"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <strong>عنوان الشركة: </strong>{" "}
                            {settings?.company_email || "ahmed@gmail.com"}
                          </div>
                          <div
                            style={{ display: "" }}
                            className="d-flex align-items-center gap-2 mt-1"
                          >
                            <strong>ختم الشركة :</strong>
                            {settings?.company_seal ? (
                              <img
                                src={settings?.company_seal}
                                alt="Seal"
                                style={{
                                  width: "40px",
                                  height: "auto",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  background: "#e0e0e0",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span
                                  style={{ fontSize: "20px", color: "#888" }}
                                  className="fw-bold px-3 py-2"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    fill="currentColor"
                                    className="bi bi-person-fill"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                  </svg>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot> */}
            </Table>
            {/* Footer */}
            <PrintTemplate 
            ref={printRef} 
            data={filteredData} 
            columns={columns} 
            settings={settings} 
            title={title} 
            t={t} 
            i18n={i18n} 
          />
          </div>
          {component === "taxesReport" && filteredData.length > 0 && (
            <Alert
              variant="info"
              className="mt-4 text-center fs-6 fw-bold shadow-sm"
              style={{
                backgroundColor: "#b19bd5",
                color: "#f4f8ffff",
                border: "none",
                textAlign: "center",
              }}
            >
              إجمالي المستحقات الضريبية : {taxBalance}
            </Alert>
          )}
          {/* {loading && currentPage > 1 && (
            <div className="text-center my-3">
              <Spinner animation="border" variant="light" size="sm" />
              <span className="ms-2">جاري التحميل...</span>
            </div>
          )} */}

          {hasMore && !loading && (
            <div className="text-center mt-3">
              <Button variant="outline-light" onClick={handleLoadMore}>
                {t("load_more")}
              </Button>
            </div>
          )}
        {/* </>
      )} */}
    </div>
  );
}

export default MyTable;
