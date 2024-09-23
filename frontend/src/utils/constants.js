export const API_DOMAIN = 'http://localhost:5555';

export const ACCEPTED_FILE_TYPES = {
  csv: ".csv",
  xls: ".xls",
  xlsx: ".xlsx",
};

export const PRODUCT_CATEGORIES = [
  "Components",
  "Peripherals",
  "Accessories",
  "PC Furniture",
  "OS & Software",
];

export const PRODUCT_FIELDS = [
  { value: "name", display: "Product Name", required: true },
  { value: "category", display: "Product Category", required: true },
  { value: "quantity_in_stock", display: "Product Quantity", required: true },
  { value: "supplierId", display: "Product Supplier", required: true },
  { value: "buying_price", display: "Buying Price", required: true },
  { value: "selling_price", display: "Selling Price", required: true },
  { value: "near_low_stock_threshold", display: "Near Low Stock Threshold", required: true },
  { value: "low_stock_threshold", display: "Low Stock Threshold", required: true },
];

export const NUMERAL_HEADERS = [
  "quantity_in_stock",
  "supplierId",
  "buying_price",
  "selling_price",
  "near_low_stock_threshold",
  "low_stock_threshold"
];
