import { useMemo } from "react";
import { useAdminTheme } from "../context/AdminThemeContext";
import { trimString } from "../utils/helper";
import { PRODUCT_FIELDS } from "../utils/constants";
import SelectMapFields from "../components/SelectMapFields";

const AddProductBulkMap = (props) => {
  const { values, mappedFields, handleMapFields } = props;
  const { darkMode } = useAdminTheme();

  const { headers, preview } = useMemo(
    () => ({ headers: values[0], preview: values[1] }),
    [values]
  );

  return (
    <div>
      <h2 className="text-xl font-semibold">Map fields</h2>
      <div
        className={`border-t ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
      ></div>
      <p className="my-2">
        Select the fields to import, then set how you would like these converted
        to product fields.
      </p>
      <p className="my-2">
        Please note all product fields are required to be mapped.
      </p>
      <div className="grid grid-cols-2">
        <h3 className="border-b border-b-light-SECONDARY mb-1">
          Document Field
        </h3>
        <h3 className="border-b border-b-light-SECONDARY mb-1">
          Product Field
        </h3>
        {headers.map((header, index) => {
          return (
            <>
              <div>
                <h4>{header}</h4>
                <h5 className="text-xs mb-1">{`(e.g. ${trimString(
                  preview[index],
                  15
                )})`}</h5>
              </div>
              <SelectMapFields
                options={PRODUCT_FIELDS}
                index={index}
                currentValue={mappedFields[index]}
                mappedFields={mappedFields}
                handleSelect={handleMapFields}
              />
            </>
          );
        })}
      </div>

      <div
        className={`my-2 border-t ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
      ></div>
    </div>
  );
};

export default AddProductBulkMap;
