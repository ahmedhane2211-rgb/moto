// import { useState, useEffect, useMemo } from "react"; // استيراد useMemo
// import PreLoader from "./PreLoader";
// import { t } from "i18next";

// function AccountingTable(props) {
//   // const [rows, setRows] = useState(props.data); // لم نعد نستخدم هذه الحالة مباشرة للبيانات المعروضة
//   const [searchTerm, setSearchTerm] = useState(""); // حالة لنص البحث العام
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // حالة لتكوين الترتيب
//   const [currentPage, setCurrentPage] = useState(1); // الحالة للصفحة الحالية
//   const [itemsPerPage] = useState(10); // عدد العناصر في كل صفحة (يمكن أن يكون prop)

//   // إعادة تعيين الصفحة إلى الأولى عند تغيير البيانات الأصلية، البحث، أو الترتيب
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [props.data, searchTerm, sortConfig]);

//   // استخدام useMemo لتصفية وترتيب البيانات بكفاءة
//   const filteredAndSortedData = useMemo(() => {
//     let sortableItems = [...props.data]; // نبدأ بنسخة من البيانات الأصلية

//     // 1. منطق الفلترة (البحث العام)
//     if (searchTerm) {
//       sortableItems = sortableItems.filter((item) =>
//         props.columns.some((col) => {
//           // نتأكد أن العمود ليس عمود "الإجراءات" ولا نبحث في قيم null/undefined
//           if (col.key === "actions" || item[col.key] === null || item[col.key] === undefined) {
//             return false;
//           }
//           return String(item[col.key]) // تحويل القيمة إلى سلسلة نصية للبحث
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase());
//         })
//       );
//     }

//     // 2. منطق الترتيب (أبجدي/رقمي)
//     if (sortConfig.key) {
//       sortableItems.sort((a, b) => {
//         const aValue = a[sortConfig.key];
//         const bValue = b[sortConfig.key];

//         // التعامل مع قيم null أو undefined لضمان عدم تعطل الفرز
//         if (aValue === null || aValue === undefined) return sortConfig.direction === "ascending" ? -1 : 1;
//         if (bValue === null || bValue === undefined) return sortConfig.direction === "ascending" ? 1 : -1;

//         // محاولة التحويل إلى رقم للفرز الرقمي
//         const isNumericA = !isNaN(parseFloat(String(aValue))) && isFinite(Number(aValue));
//         const isNumericB = !isNaN(parseFloat(String(bValue))) && isFinite(Number(bValue));

//         if (isNumericA && isNumericB) {
//           return sortConfig.direction === "ascending"
//             ? parseFloat(String(aValue)) - parseFloat(String(bValue))
//             : parseFloat(String(bValue)) - parseFloat(String(aValue));
//         } else {
//           // الفرز الأبجدي باستخدام localeCompare لدعم اللغات المختلفة (مثل العربية)
//           return sortConfig.direction === "ascending"
//             ? String(aValue).localeCompare(String(bValue), 'ar', { sensitivity: 'base' }) // 'ar' للغة العربية
//             : String(bValue).localeCompare(String(aValue), 'ar', { sensitivity: 'base' });
//         }
//       });
//     }

//     return sortableItems;
//   }, [props.data, searchTerm, sortConfig, props.columns]); // تعتمد useMemo على هذه المتغيرات

//   // 3. منطق الترقيم (Pagination)
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredAndSortedData.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );

//   const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // دالة لطلب الترتيب عند النقر على رأس العمود
//   const requestSort = (key) => {
//     if (key === "actions") return; // لا تسمح بالفرز على عمود الإجراءات

//     let direction = "ascending";
//     if (
//       sortConfig.key === key &&
//       sortConfig.direction === "ascending"
//     ) {
//       direction = "descending";
//     } else if (
//       sortConfig.key === key &&
//       sortConfig.direction === "descending"
//     ) {
//       // إذا كان الترتيب تنازليًا بالفعل، قم بإعادة تعيين الترتيب (إزالة الفرز لهذا العمود)
//       key = null;
//       direction = null;
//     }
//     setSortConfig({ key, direction });
//   };

//   // دالة للحصول على اسم الكلاس لعمود معين (لإظهار مؤشر الترتيب)
//   const getClassNamesFor = (key) => {
//     if (!sortConfig.key || sortConfig.key !== key) {
//       return;
//     }
//     return sortConfig.key === key ? sortConfig.direction : undefined;
//   };

//   return (
//     <div className={`accountingTableContainer ${props.tableContainerClass}`}>
//       {/* قسم التحكم في الجدول (البحث والترقيم) */}
//       <div className="table-controls mb-3 d-flex justify-content-between align-items-center">
//         <input
//           type="text"
//           placeholder={t("بحث...")} // "Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="form-control" // افتراض استخدام Bootstrap أو ما شابه
//           style={{ maxWidth: '300px' }} // لتحديد عرض حقل البحث
//         />
//         {/* سيتم وضع عناصر الترقيم هنا لاحقًا */}
//       </div>

//       <table>
//         <thead>
//           <tr className="print-only-row">
//             <td colSpan={props.columns.length} className="print-header-cell">
//               <div className="header-top-section">
//                 <div className="logo-area">
//                   <h1>اسم الشركة</h1>
//                 </div>
//                 <div className="company-info">
//                   <div className="logo-placeholder">شعار الشركة</div>
//                   <p>
//                     <span>
//                       <strong>العنوان:</strong> شارع المعرفة، مدينة البيانات
//                     </span>
//                   </p>
//                 </div>
//                 <div className="header-left-info">
//                   <p>
//                     <strong>تاريخ الطباعة:</strong>{" "}
//                     {new Date().toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//               <div className="report-title-section">
//                 <h2>{props.reportTitle || "تقرير الحسابات"}</h2>
//               </div>
//             </td>
//           </tr>
//           <tr>
//             {props.columns.map((col, index) => (
//               <th
//                 key={index}
//                 className={`table${col.key} ${
//                   col.key === "actions" ? "tableactions" : ""
//                 } ${getClassNamesFor(col.key)}`} // إضافة كلاسات الترتيب
//                 onClick={() => requestSort(col.key)} // جعل رأس العمود قابلاً للنقر للترتيب
//                 style={{ cursor: col.key !== "actions" ? "pointer" : "default" }} // مؤشر يد للمؤشر
//               >
//                 {col.name}
//                 {/* مؤشر السهم للترتيب */}
//                 {sortConfig.key === col.key && (
//                   <span className="sort-icon">
//                     {sortConfig.direction === "ascending" ? " ⬆️" : " ⬇️"}
//                   </span>
//                 )}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {props.loading ? (
//             <tr>
//               <td
//                 colSpan={props.columns.length}
//                 style={{ textAlign: "center" }}
//               >
//                 <PreLoader />
//               </td>
//             </tr>
//           ) : currentItems.length > 0 ? ( // استخدام currentItems بدلاً من rows
//             currentItems.map((row, rowIndex) => (
//               <tr key={rowIndex}>
//                 {props.columns.map((col, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className={col.key === "actions" ? "tableactions" : ""}
//                   >
//                     {col.key === "actions" && props.renderActions
//                       ? props.renderActions(row)
//                       : row[col.key]}
//                   </td>
//                 ))}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan={props.columns.length}
//                 style={{ textAlign: "center" }}
//               >
//                 {t("noDataToDisplay")}
//               </td>
//             </tr>
//           )}
//         </tbody>

//         <tfoot className="print-cjc">
//           <tr className="print-only-row">
//             <td colSpan={props.columns.length} className="print-footer-cell">
//               <div className="print-footer-content">
//                 <span>
//                   <strong>{t("responsiblePerson")}:</strong>
//                   {t("مدير الحسابات")}
//                 </span>
//                 <span>
//                   <strong>{t("phone")}:</strong> 9876543210
//                 </span>
//               </div>
//               <div className="print-footer-content border-0">
//                 <span>
//                   <strong>{t("email")}:</strong> mmjmmck@gmail.com
//                 </span>
//                 <span>
//                   <strong>{t("taxNumber")}:</strong> 1234567890
//                 </span>
//               </div>
//               <div className="print-footer-content border-0">
//                 <span>
//                   <strong>{t("Website")}:</strong> ______
//                 </span>
//                 <span>
//                   <strong>{t("whatsapp")}:</strong> 9876543210
//                 </span>
//               </div>
//             </td>
//           </tr>
//         </tfoot>
//       </table>

//       {/* عناصر التحكم في الترقيم */}
//       {totalPages > 1 && (
//         <div className="pagination-controls mt-3 d-flex justify-content-center align-items-center">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="btn btn-sm btn-outline-secondary"
//           >
//             {t("السابق")}
//           </button>
//           {[...Array(totalPages)].map((_, index) => (
//             <button
//               key={index}
//               onClick={() => handlePageChange(index + 1)}
//               className={`btn btn-sm mx-1 ${
//                 currentPage === index + 1 ? "btn-primary" : "btn-outline-primary"
//               }`}
//             >
//               {index + 1}
//             </button>
//           ))}
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="btn btn-sm btn-outline-secondary"
//           >
//             {t("التالي")}
//           </button>
//           <span className="ms-2">
//             {t("صفحة")} {currentPage} {t("من")} {totalPages}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AccountingTable;
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; 
 
function AccountingTable(props) {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState(props.data);

  useEffect(() => {
    setRows(props.data);
  }, [props.data]);

  return (
    <div className={`accountingTableContainer ${props.tableContainerClass}`}>
      <table>
        <thead>
          <tr className="print-only-row">
            <td colSpan={props.columns.length} className="print-header-cell">
              <div className="header-top-section">
                <div className="logo-area">
                  <h1>{t("accounting_company_name")}</h1>
                </div>
                <div className="company-info">
                  <div className="logo-placeholder">
                    {t("accounting_company_logo")}
                  </div>
                  <p>
                    {/* <strong>الرقم الضريبي:</strong> 123456789012345 */}
                    <span>
                      <strong>{t("accounting_address")}:</strong>{" "}
                      {t("accounting_address_value")}
                    </span>
                  </p>
                </div>
                <div className="header-left-info">
                  <p>
                    <strong>{t("accounting_print_date")}:</strong>{" "}
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="report-title-section">
                <h2>
                  {props.reportTitle || t("accounting_report_title")}
                </h2>
              </div>
            </td>
          </tr>
          <tr>
            {props.columns.map((col, index) => (
              <th
                key={index}
                className={`table${col.key} ${
                  col.key === "actions" ? "tableactions" : ""
                }`}
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {props.loading ? (
            <tr>
              <td
                colSpan={props.columns.length}
                style={{ textAlign: "center" }}
              >
                {t("accounting_loading")}
              </td>
            </tr>
          ) : rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {props.columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={col.key === "actions" ? "tableactions" : ""}
                  >
                    {col.key === "actions" && props.renderActions
                      ? props.renderActions(row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={props.columns.length}
                style={{ textAlign: "center" }}
              >
                {t("accounting_no_data")}
              </td>
            </tr>
          )}
        </tbody>

        <tfoot className="print-cjc">
          <tr className="print-only-row">
            <td colSpan={props.columns.length} className="print-footer-cell">
              <div className="print-footer-content">
                <span>
                  <strong>{t("accounting_responsible_person")}:</strong>{" "}
                  {t("accounting_account_manager")}
                </span>
                <span>
                  <strong>{t("accounting_phone")}:</strong> 9876543210
                </span>
              </div>
              <div className="print-footer-content border-0">
                <span>
                  <strong>{t("accounting_email")}:</strong> mmjmmck@gmail.com
                </span>
                <span>
                  <strong>{t("accounting_tax_number")}:</strong> 1234567890
                </span>
              </div>
              <div className="print-footer-content border-0">
                <span>
                  <strong>{t("accounting_website")}:</strong> ______
                </span>
                <span>
                  <strong>{t("accounting_whatsapp")}:</strong> 9876543210
                </span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AccountingTable;
