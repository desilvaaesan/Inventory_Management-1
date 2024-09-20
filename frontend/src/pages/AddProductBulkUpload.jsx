import { useAdminTheme } from "../context/AdminThemeContext";
import { ACCEPTED_FILE_TYPES } from "../utils/constants";

const AddProductBulkUpload = (props) => {
  const { file, handleFile, error, handleError } = props;

  const { darkMode } = useAdminTheme();

  const handleUpload = (event) => {
    handleError(null);
    const files = Array.from(event.target.files);
    if (files.length > 0) handleFile(files[0]);
  };

  const triggerFileUpload = () => {
    document.getElementById("file-upload").click(); // Trigger click on hidden input
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Upload</h2>
      <div
        className={`border-t ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
      ></div>
      <p className="my-2">
        To import issues in bulk, you need to provide the data in CSV or Excel
        (XLSX) file format.
      </p>
      <div className="flex flex-col">
        <label htmlFor="file-upload">
          Source File<span className="text-red-500">*</span>
        </label>
        <input
          hidden
          id="file-upload"
          name="files"
          type="file"
          accept={Object.values(ACCEPTED_FILE_TYPES).join(",")}
          onChange={handleUpload}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={triggerFileUpload}
            className="px-4 py-2 bg-light-ACCENT text-white rounded hover:bg-light-PRIMARY"
          >
            Choose File
          </button>
          <p>{file?.name ?? "No file chosen"}</p>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div
        className={`my-2 border-t ${
          darkMode ? "border-light-ACCENT" : "border-dark-ACCENT"
        }`}
      ></div>
    </div>
  );
};

export default AddProductBulkUpload;
