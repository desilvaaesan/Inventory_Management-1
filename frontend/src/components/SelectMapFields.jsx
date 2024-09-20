import { useState } from "react";
import { useAdminTheme } from "../context/AdminThemeContext";

const SelectMapFields = (props) => {
  const { options, index, mappedFields, handleSelect, currentValue } = props;
  const [value, setValue] = useState(currentValue);
  const { darkMode } = useAdminTheme();

  return (
    <div>
      <select
        className={`w-full border bg-transparent rounded-md p-2 ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
        onChange={(e) => {
          const currentValue = e.target.value;

          if (currentValue === "NONE") {
            handleSelect(undefined, index);
          } else {
            handleSelect(e.target.value, index);
          }

          setValue(e.target.value);
        }}
        value={value}
      >
        <option value={"NONE"} className="text-gray-400">
          Don't map this field
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={mappedFields?.includes(opt.value)}>
            {opt.display}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectMapFields;
