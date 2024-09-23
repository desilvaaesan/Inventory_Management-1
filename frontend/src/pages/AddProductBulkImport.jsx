import React from "react";
import { useAdminTheme } from "../context/AdminThemeContext";

const AddProductBulkImport = (props) => {
  const { error, validating } = props;
  const { darkMode } = useAdminTheme();

  return (
    <div>
      <h2 className="text-xl font-semibold">
        Import
      </h2>
      <div
        className={`border-t ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
      ></div>
      {validating && <p>Loading...</p>}
      <p>{error}</p>
    </div>
  );
};

export default AddProductBulkImport;
