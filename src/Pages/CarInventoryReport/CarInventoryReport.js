import { useState, useEffect } from "react";
import MyTable from "../../Components/MyTable";
import Mytitle from "../../Components/Mytitle";
import API from "../../Api/axiosConfig";
import { useTranslation } from "react-i18next";
import { FloatingLabel, Form } from "react-bootstrap";

function CarInventoryReport() {
  const { t } = useTranslation();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load branches
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await API.get("/branches");
      setBranches(response.data.data || []);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setRefreshKey((prev) => prev + 1);
  };

  const columns = [
    { header: t("brand"), accessor: "brand" },
    { header: t("model"), accessor: "model" },
    { header: t("color"), accessor: "color" },
    { header: t("chassis_number"), accessor: "chassis_number" },
    { header: t("manufacturing_year"), accessor: "manufacturing_year" },
    { header: t("plate_number"), accessor: "plate_number" },
    { header: t("license_expiry_date"), accessor: "license_expiry_date" },
    { header: t("car_price"), accessor: "car_price" },
  ];

  return (
    <div className="container mt-5">
      <Mytitle title={t("car_inventory_report")} />

      {/* Branch Filter */}
      <div className="row mb-4">
        <div className="col-md-2">
          {/* <div className="card shadow-sm">
                        <div className="card-body">
                            <label className="form-label fw-bold">
                                {t("filter_by_branch")}
                            </label>
                            <select
                                className="form-control"
                                value={selectedBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                            >
                                <option value="">{t("all_branches")}</option>
                                {branches.map((branch) => (
                                    <option key={branch.uuid} value={branch.uuid}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div> */}
          <FloatingLabel label={t("branch")}>
            <Form.Select
              className="form-select mb-3"
              style={{ height: "38px" }}
              value={selectedBranch || ""}
              onChange={(e) => handleBranchChange(e.target.value)}
            >
              <option value="">{t("all_branches")}</option>
              {branches.map((branch) => (
                <option key={branch.uuid} value={branch.uuid}>
                  {branch.name}
                </option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </div>
      </div>

      {/* Cars Table */}
      <MyTable
        resource={selectedBranch ? `cars?branch_id=${selectedBranch}` : "cars"}
        columns={columns}
        refreshKey={refreshKey}
        title={t("car_inventory_report")}
      />
    </div>
  );
}

export default CarInventoryReport;
