import { useEffect, useState } from "react";
import API from "../../Api/axiosConfig";
// import Mytitle from "../../Components/Mytitle";

export default function SubscribtionsDetails() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    // const columns = [
      // { header: "من", accessor: "from" },
      // { header: "إلى", accessor: "to" },
      // { header: "القيمة", accessor: "value" },
      // {
      //   header: "تجريبي؟",
      //   accessor: (row) => (row.is_trial ? "نعم" : "لا"),
      // },
      // {
      //   header: "مفعل؟",
      //   accessor: (row) => (row.active ? "نعم" : "لا"),
      // },
      // {
      //   header: "الايميل",
      //   accessor: (row) => row.store.user.email,
      // },
      // {
      //   header: "الإجراءات",
      //   accessor: (row) => (
      //     <Can permission="subscriber_update">
      //       <button
      //         className="btn btn-sm btn-primary mx-1 no-style"
      //         onClick={() => handleEdit(row)}>
      //         <SquarePen />
      //       </button>
      //     </Can>
      //   ),
      // },
    // ];
  useEffect(() => {
    API.get("users")
      .then((response) => {
        setUserData(response.data); // حفظ البيانات
        setLoading(false);
        // console.log("User data:", response.data); // عرضها في الكونسول
      })
      .catch((error) => {
        setError(error.message || "حدث خطأ");
        setLoading(false);
        console.error("API Error:", error);
      });
  }, []);

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>حدث خطأ: {error}</p>;

  return (
    <div className="container mt-5">
      {/* <Mytitle title="الاشتراكات" /> */}

      {/* <MyTable resource="users" columns={columns} refreshKey={refreshKey} /> */}
    </div>
  );
}
