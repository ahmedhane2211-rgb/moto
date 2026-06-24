import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../Api/axiosConfig";
import { toast } from "react-toastify";
import MyButton from "../../Components/MyButton";
import Mytitle from "../../Components/Mytitle";
import Can from "../../Components/Can";
import { Spinner } from "react-bootstrap";

const permissionLabels = {
  sub_user_create: "permissions.sub_user_create",
  sub_user_show: "permissions.sub_user_show",
  sub_user_update: "permissions.sub_user_update",
  sub_user_delete: "permissions.sub_user_delete",
  permission_update: "permissions.permission_update",
  permission_show: "permissions.permission_show",
  subscription_show: "permissions.subscription_show",
  salary_create: "permissions.salary_create",
  salary_show: "permissions.salary_show",
  income_statement_show: "permissions.income_statement_show",
  account_statement_show: "permissions.account_statement_show",
  cash_report_show: "permissions.cash_report_show",
  service_create: "permissions.service_create",
  service_show: "permissions.service_show",
  service_update: "permissions.service_update",
  service_delete: "permissions.service_delete",
  money_invoice_create: "permissions.money_invoice_create",
  money_invoice_show: "permissions.money_invoice_show",
  money_invoice_update: "permissions.money_invoice_update",
  money_invoice_delete: "permissions.money_invoice_delete",
  invoice_create: "permissions.invoice_create",
  invoice_show: "permissions.invoice_show",
  invoice_update: "permissions.invoice_update",
  invoice_delete: "permissions.invoice_delete",
  expense_create: "permissions.expense_create",
  expense_show: "permissions.expense_show",
  expense_update: "permissions.expense_update",
  expense_delete: "permissions.expense_delete",
  employee_create: "permissions.employee_create",
  employee_show: "permissions.employee_show",
  employee_update: "permissions.employee_update",
  employee_delete: "permissions.employee_delete",
  empAdjustment_create: "permissions.empAdjustment_create",
  empAdjustment_show: "permissions.empAdjustment_show",
  empAdjustment_update: "permissions.empAdjustment_update",
  empAdjustment_delete: "permissions.empAdjustment_delete",
  customer_create: "permissions.customer_create",
  customer_show: "permissions.customer_show",
  customer_update: "permissions.customer_update",
  customer_delete: "permissions.customer_delete",
  category_create: "permissions.category_create",
  category_show: "permissions.category_show",
  category_update: "permissions.category_update",
  category_delete: "permissions.category_delete",
  owner_withdrawl_create: "permissions.owner_withdrawl_create",
  owner_withdrawl_show: "permissions.owner_withdrawl_show",
  setting_update: "permissions.setting_update",
  setting_show: "permissions.setting_show",
  cash_transfer_create: "permissions.cash_transfer_create",
  cash_transfer_show: "permissions.cash_transfer_show",
  invoice_taxReport: "permissions.invoice_taxReport",
  analysis_show: "permissions.analysis_show",
  branch_show: "permissions.branch_show",
  branch_create: "permissions.branch_create",
  branch_update: "permissions.branch_update",
  car_show: "permissions.car_show",
  car_create: "permissions.car_create",
  car_update: "permissions.car_update",
  car_delete: "permissions.car_delete",
  bank_show: "permissions.bank_show",
  bank_create: "permissions.bank_create",
  bank_update: "permissions.bank_update",
  bank_delete: "permissions.bank_delete",
  partner_show: "permissions.partner_show",
  partner_create: "permissions.partner_create",
  partner_update: "permissions.partner_update",
  partner_delete: "permissions.partner_delete",
  car_rental_show: "permissions.car_rental_show",
  car_rental_create: "permissions.car_rental_create",
  car_rental_update: "permissions.car_rental_update",
  car_rental_delete: "permissions.car_rental_delete",
  car_sale_show: "permissions.car_sale_show",
  car_sale_create: "permissions.car_sale_create",
  car_expense_show: "permissions.car_expense_show",
  car_expense_create: "permissions.car_expense_create",
  car_expense_update: "permissions.car_expense_update",
  car_expense_delete: "permissions.car_expense_delete",
  license_type_create: "permissions.license_type_create",
  license_type_show: "permissions.license_type_show",
  license_type_update: "permissions.license_type_update",
  license_type_delete: "permissions.license_type_delete",
  empWithdrawal_create: "permissions.empWithdrawal_create",
  empWithdrawal_show: "permissions.empWithdrawal_show",
  empWithdrawal_update: "permissions.empWithdrawal_update",
  empWithdrawal_delete: "permissions.empWithdrawal_delete",
  expense_invoice_show: "permissions.expense_invoice_show",
};

const permissionGroups = {
  users: [
    "sub_user_create",
    "sub_user_show",
    "sub_user_update",
    "sub_user_delete",
  ],
  permissions: ["permission_show", "permission_update"],
  employees: [
    "employee_create",
    "employee_show",
    "employee_update",
    "employee_delete",
  ],
  adjustments: [
    "empAdjustment_create",
    "empAdjustment_show",
    "empAdjustment_update",
    "empAdjustment_delete",
  ],
  salaries: ["salary_create", "salary_show"],
  categories: [
    "category_create",
    "category_show",
    "category_update",
    "category_delete",
  ],
  services: ["service_create", "service_show", "service_update", "service_delete"],
  customers: [
    "customer_create",
    "customer_show",
    "customer_update",
    "customer_delete",
  ],
  invoices: [
    "invoice_create",
    "invoice_show",
    "invoice_update",
    "invoice_delete",
  ],
  expenses: ["expense_create", "expense_show", "expense_update", "expense_delete"],
  money: [
    "money_invoice_create",
    "money_invoice_show",
    "money_invoice_update",
    "money_invoice_delete",
  ],
  cash: ["cash_transfer_create", "cash_transfer_show"],
  withdrawls: ["owner_withdrawl_create", "owner_withdrawl_show"],
  reports: [
    "income_statement_show",
    "account_statement_show",
    "cash_report_show",
    "invoice_taxReport",
    "analysis_show",
    "expense_invoice_show",
  ],
  branches: ["branch_show", "branch_create", "branch_update"],
  cars: ["car_show", "car_create", "car_update", "car_delete"],
  banks: ["bank_show", "bank_create", "bank_update", "bank_delete"],
  partners: ["partner_show", "partner_create", "partner_update", "partner_delete"],
  carRental: ["car_rental_show", "car_rental_create", "car_rental_update", "car_rental_delete"],
  carSales: ["car_sale_show", "car_sale_create"],
  carExpenses: ["car_expense_show", "car_expense_create", "car_expense_update", "car_expense_delete"],
  licenseTypes: ["license_type_show", "license_type_create", "license_type_update", "license_type_delete"],
  empWithdrawals: ["empWithdrawal_show", "empWithdrawal_create", "empWithdrawal_update", "empWithdrawal_delete"],
  settings: ["setting_show", "setting_update"],
  subscriptions: ["subscription_show"],
};

function UserPermissions() {
  const { t, i18n } = useTranslation();

  const { uuid } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get(`/user-permissions/${uuid}`);
        if (userRes.data.data && userRes.data.data.length > 0) {
          setUser(userRes.data.data[0]);
          setSelectedPermissions(
            userRes.data.data[0].permissions.map((p) => p.id)
          );
        }

        const permsRes = await API.get("/permissions");
        const filtered = permsRes.data.data.filter((p) => p.type !== "system");
        setAllPermissions(filtered);
      } catch (err) {
        console.error(err);
        toast.error(t("common.load_failed"));
      }
    };

    fetchData();
  }, [uuid, t]);

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await API.post("/user-permissions", {
        uuid: user.uuid,
        permission_ids: selectedPermissions,
      });
      toast.success(t("permissions.updated"));
      navigate("/sub-users");
    } catch (err) {
      console.error(err);
      toast.error(t("permissions.save_failed"));
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
          <Mytitle title={`${t("permissions.title")} : ${user ? user.name : ""}`} />

          <div className="card p-4" dir={i18n.dir()}>
            {Object.entries(permissionGroups).map(([groupName, perms], index) => (
              <div key={groupName}>
                <div className="permission-group mb-4">
                  <h5 className="group-title mb-3">
                    {t(`permission_groups.${groupName}`)}
                  </h5>
                  <div className="row">
                    {perms
                      .map((permName) =>
                        allPermissions.find((p) => p.name === permName)
                      )
                      .filter(Boolean)
                      .map((perm) => (
                        <div key={perm.id} className="col-md-4 mb-3">
                          <div
                            className={`permission-card d-flex align-items-center gap-2 p-3 rounded cursor-pointer border ${selectedPermissions.includes(perm.id)
                              ? "selected"
                              : ""
                              }`}
                            onClick={() => togglePermission(perm.id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(perm.id)}
                              readOnly
                              className="form-check-input"
                            />
                            <span className="pointer">
                              {t(permissionLabels[perm.name])}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {index < Object.entries(permissionGroups).length - 1 && <hr className="my-4" />}
              </div>
            ))}
          </div>

          <Can permission="permission_update">
            <div className="mt-3 mb-2">
              <MyButton
                text={t("common.save")}
                variant="success"
                onClick={handleSave}
                className="mx-2"
                loading={loading}
              />
              <MyButton
                text={t("common.cancel")}
                variant="secondary"
                className="mx-2"
                onClick={() => navigate("/sub-users")}
              />
            </div>
          </Can>
        </>
      )}
    </div>
  );
}

export default UserPermissions;
