import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import Mytitle from "../../Components/Mytitle";
import Can from "../../Components/Can";
import { Spinner } from "react-bootstrap";

const permissionLabels = {
  admin_show: "عرض المديرين",
  admin_create: "إضافة مدير",
  admin_update: "تعديل مدير",
  admin_delete: "حذف مدير",
  subscriber_show: "عرض المشتركين",
  subscriber_create: "إضافة مشترك",
  subscriber_update: "تعديل مشترك",
  admin_permission_create: "إضافة صلاحيات للمدير",
  admin_permission_show: "عرض صلاحيات المدير",
};

function AdminPermissions() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminRes = await API.get(`/admin-permissions/${uuid}`);
        if (adminRes.data.data && adminRes.data.data.length > 0) {
          setAdmin(adminRes.data.data[0]);
          setSelectedPermissions(
            adminRes.data.data[0].permissions.map((p) => p.id)
          );
        }

        const permsRes = await API.get("/admin-permissions");
        const filtered = permsRes.data.data.filter((p) => p.type === "system");
        setAllPermissions(filtered);
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل البيانات");
      }
    };

    fetchData();
  }, [uuid]);

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      await API.post("/admin-permissions", {
        uuid: admin.uuid,
        permission_ids: selectedPermissions,
      });
      toast.success("تم تحديث صلاحيات المدير بنجاح");
      navigate("/admin/sub-admins");
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ الصلاحيات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {allPermissions.length === 0 ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <Spinner animation="border" style={{ color: "white" }} />
        </div>
      ) : (
        <>
          <Mytitle title={`صلاحيات المدير: ${admin ? admin.name : ""}`} />

          <div className="card p-3">
            <div className="row flex-row-reverse">
              {allPermissions.map((perm) => (
                <div key={perm.id} className="col-md-4 mb-3">
                  <div
                    className={`permission-card d-flex align-items-center gap-2 p-3 rounded cursor-pointer border direction-rtl ${
                      selectedPermissions.includes(perm.id) ? "selected" : ""
                    }`}
                    onClick={() => togglePermission(perm.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      readOnly
                    />
                    <span  className="pointer">{permissionLabels[perm.name] || perm.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Can permission="admin_permission_create">
            <div className="mt-3">
              <MyButton
                text="حفظ"
                variant="success"
                onClick={handleSave}
                className="mx-2"
                loading={loading}
              />
              <MyButton
                text="إلغاء"
                variant="secondary"
                className="mx-2"
                onClick={() => navigate("/admin/sub-admins")}
              />
            </div>
          </Can>
        </>
      )}
    </div>
  );
}

export default AdminPermissions;
