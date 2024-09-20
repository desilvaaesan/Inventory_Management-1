import React, { useState, useEffect, useMemo } from "react";
import { useAdminTheme } from "../context/AdminThemeContext";
import { IoCaretBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import AddProductBulkUpload from "./AddProductBulkUpload";
import AddProductBulkMap from "./AddProductBulkMap";
import AddProductBulkImport from "./AddProductBulkImport";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  arraysAreEqual,
  getFileExtension,
  isBlankString,
} from "../utils/helper";
import {
  ACCEPTED_FILE_TYPES,
  NUMERAL_HEADERS,
  PRODUCT_CATEGORIES,
  PRODUCT_FIELDS,
} from "../utils/constants";
import axios from "axios";
import ButtonSpinner from "../components/ButtonSpinner";

const AddProductBulk = () => {
  const { darkMode } = useAdminTheme();

  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [values, setValues] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [mappedFields, setMappedFields] = useState([]);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [requestBody, setRequestBody] = useState([]);
  const [importing, setImporting] = useState(false);

  const requiredProductFields = useMemo(
    () =>
      PRODUCT_FIELDS.filter((field) => field.required).map(
        (field) => field.value
      ),
    [PRODUCT_FIELDS]
  );

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:5555/supplier");
      setSuppliers(response.data.data);
    } catch (error) {
      console.error(
        "Error fetching suppliers:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (file) {
      handleValues();
    }
  }, [file]);

  const totalSteps = useMemo(() => 3, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const getIsDisabledBackBgColor = () => {
    if (getIsDisabledBackButton()) {
      return "text-gray-500";
    } else {
      return getActiveBgColorDarkMode();
    }
  };

  const getIsDisabledBackButton = () => {
    return step === 1 || validating || importing;
  }

  const getActiveBgColorDarkMode = () => {
    return darkMode ? "border-light-ACCENT" : "border-dark-ACCENT";
  };

  const getIsDisabledNextBgColor = () => {
    if (getIsDisabledPerStep()) {
      return "bg-light-SECONDARY text-light-TEXT";
    } else {
      return getActiveColoredBgColorDarkMode();
    }
  };

  const getActiveColoredBgColorDarkMode = () => {
    return darkMode
      ? "bg-light-ACCENT text-light-TEXT"
      : "bg-dark-ACCENT text-dark-TEXT";
  };

  const getIsDisabledPerStep = () => {
    if (step === 1) {
      return file === null || values.length < 2; // values should have headers and 1 row of data
    } else if (step === 2) {
      return !requiredProductFields.every((value) =>
        mappedFields.includes(value)
      );
    } else {
      return false;
    }
  };

  const handleFile = (newFile) => {
    const ext = getFileExtension(newFile.name);

    if (Object.values(ACCEPTED_FILE_TYPES).includes(`.${ext}`)) {
      setFile(newFile);
    } else {
      handleError("File not supported!");
      setFile(null);
    }

    resetMappings();
  };

  const handleValues = async () => {
    try {
      const ext = getFileExtension(file.name);

      let values = [];

      if (ext === "xls" || ext === "xlsx") {
        values = await parseExcel(file);
      } else if (ext === "csv") {
        values = await parseCsv(file);
      } else {
        throw new Error();
      }

      setValues(values);
    } catch (error) {
      handleError("Cannot parse the file!");
      setValues([]);
    }
  };

  const parseCsv = async (file) => {
    const data = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        delimiter: ",",
        skipEmptyLines: "greedy",
        worker: true,
        complete: function (results) {
          resolve(results.data);
        },
        error: function (err) {
          reject(err);
        },
      });
    });
    return data;
  };

  const parseExcel = async (file) => {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "array", cellStyles: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // always get the first sheet
        const jsonData = XLSX.utils.sheet_to_csv(worksheet, {
          blankrows: false,
          skipHidden: false,
        });

        resolve(parseCsv(jsonData));
      };

      reader.onerror = (e) => {
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });

    return data;
  };

  const handleUploadError = (error) => {
    setUploadError(error);
  };

  const handleValidationError = (error) => {
    setValidationError(error);
  };

  const handleBackClick = () => {
    navigate("/inventory/product");
  };

  const handleMapFields = (field, index) => {
    const newFields = [...mappedFields];
    newFields[index] = field;

    if (!arraysAreEqual(newFields, mappedFields)) {
      setValidated(false);
    }

    setMappedFields(newFields);
  };

  const handleValidate = () => {
    setValidating(true);
    const reqBody = handleFieldMapping(values, mappedFields);
    if (reqBody.length) {
      setValidated(true);
      setRequestBody(reqBody);
    } else {
      setValidated(false);
    }
    setValidating(false);
  };

  const handleFieldMapping = (values, mappedFields) => {
    let requestList = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const payload = applyFieldMapping(row, mappedFields);
      if (Object.keys(payload).length === 0) {
        requestList = [];
        break;
      } else {
        requestList.push(payload);
      }
    }

    return requestList;
  };

  const applyFieldMapping = (row, mappedFields) => {
    let payload = {};

    for (let i = 0; i < mappedFields.length; i++) {
      const header = mappedFields[i];

      if (header) {
        const required = requiredProductFields.includes(header);
        const value = row[i].trim();

        if (required && isBlankString(value)) {
          handleValidationError("There are missing required fields!");
          setValidated(false);
          payload = {};
          break;
        } else if (!isBlankString(value)) {
          if (header === "category") {
            const equivalentCategory = PRODUCT_CATEGORIES.find(
              (category) => category.toLowerCase() === value.toLowerCase()
            );

            if (!equivalentCategory) {
              handleValidationError(
                "Invalid Product Category! Please reupload file."
              );
              setValidated(false);
              payload = {};
              break;
            } else {
              payload[header] = equivalentCategory;
            }
          } else if (header === "supplierId") {
            const equivalentSupplier = suppliers.find(
              (supplier) => supplier.name.toLowerCase() === value.toLowerCase()
            );

            if (!equivalentSupplier) {
              handleValidationError("Invalid Supplier! Please reupload file.");
              setValidated(false);
              payload = {};
              break;
            } else {
              payload[header] = equivalentSupplier._id;
            }
          } else if (NUMERAL_HEADERS.includes(header)) {
            payload[header] = parseFloat(value);
          } else {
            payload[header] = value;
          }
        } else {
          continue;
        }
      }
    }

    return payload;
  };

  const resetMappings = () => {
    setMappedFields([]);
    setValues([]);
    setValidationError(null);
    setValidated(false);
  };

  const handleImport = () => {
    setImporting(true);
    console.log(requestBody);
    setImporting(false);
  };

  const getStepButtons = () => {
    if (totalSteps === step) {
      if (validated) {
        return (
          <button
            type="button"
            className={`px-6 py-2 rounded-md w-28
              ${getActiveColoredBgColorDarkMode()}`}
            onClick={handleImport}
            disabled={importing || validationError !== null}
          >
            {importing ? <ButtonSpinner /> : "Import"}
          </button>
        );
      } else {
        return (
          <button
            type="button"
            className={`px-6 py-2 rounded-md w-28
              ${getActiveColoredBgColorDarkMode()}`}
            onClick={handleValidate}
            disabled={validating || validationError !== null}
          >
            {validating ? <ButtonSpinner /> : "Validate"}
          </button>
        );
      }
    } else {
      return (
        <button
          type="button"
          className={`px-6 py-2 rounded-md w-28
                    ${getIsDisabledNextBgColor()}`}
          onClick={handleNext}
          disabled={getIsDisabledPerStep()}
        >
          Next
        </button>
      );
    }
  };

  return (
    <div
      className={`h-full w-full flex flex-col gap-2 ${
        darkMode ? "text-light-TEXT bg-light-BG" : "text-dark-TEXT bg-dark-BG"
      }`}
    >
      <div className="flex items-center justify-start h-[8%]">
        <button
          className={`flex gap-2 items-center py-4 px-6 outline-none ${
            darkMode ? "text-light-TEXT" : "dark:text-dark-TEXT"
          }`}
          onClick={handleBackClick}
        >
          <IoCaretBackOutline />
          Back to sales order
        </button>
      </div>

      <div className="w-full h-[82%] flex flex-col items-center justify-center gap-2">
        <p className="text-3xl">Bulk Add</p>
        <div
          className={`w-[40%] h-full rounded-md p-4 ${
            darkMode ? "bg-light-CARD" : "bg-dark-CARD"
          }`}
        >
          <Stepper step={step} />
          <div className="flex flex-col w-full gap-4 justify-between">
            <div>
              {step === 1 && (
                <AddProductBulkUpload
                  file={file}
                  handleFile={handleFile}
                  error={uploadError}
                  handleError={handleUploadError}
                />
              )}
              {step === 2 && (
                <AddProductBulkMap
                  values={values}
                  mappedFields={mappedFields}
                  handleMapFields={handleMapFields}
                />
              )}
              {step === 3 && (
                <AddProductBulkImport
                  error={validationError}
                  validating={validating}
                />
              )}
            </div>
            <div className="flex items-center gap-4 justify-between">
              <button
                type="button"
                className={`px-4 py-2 bg-transparent border rounded-md w-28
                  ${getIsDisabledBackBgColor()}`}
                onClick={handlePrevious}
                disabled={getIsDisabledBackButton()}
              >
                Back
              </button>
              {getStepButtons()}
            </div>
          </div>
        </div>
      </div>

      <div className={`w-full h-[10%] px-4 py-6`}></div>
    </div>
  );
};

export default AddProductBulk;
