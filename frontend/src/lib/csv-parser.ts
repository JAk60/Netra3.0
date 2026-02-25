import { ImportType, ValidationError } from "@/store/Bulk import.store";
import { sensorMetadataCSVSchema, sensorReadingCSVSchema } from "@/types/Schema/sensor-reading.schema";

interface ParseResult<T> {
  data: T[];
  errors: ValidationError[];
  valid: boolean;
}

export function parseCSVFile<T>(
  file: File,
  type: ImportType
): Promise<ParseResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSVText<T>(text, type);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({
        data: [],
        errors: [{ row: 0, field: "file", message: "Failed to read file" }],
        valid: false,
      });
    };

    reader.readAsText(file);
  });
}

function parseCSVText<T>(text: string, type: ImportType): ParseResult<T> {
  const lines = text.trim().split("\n");

  if (lines.length < 2) {
    return {
      data: [],
      errors: [
        { row: 0, field: "file", message: "CSV file is empty or has no data rows" },
      ],
      valid: false,
    };
  }

  const headers = lines[0].split(/,|\t/).map((h) => h.trim());

  const requiredHeaders =
    type === "metadata"
      ? ["sensor_name", "min_value", "max_value"]
      : ["sensor_name", "value", "date"];

  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    return {
      data: [],
      errors: [
        {
          row: 0,
          field: "headers",
          message: `Missing required columns: ${missingHeaders.join(", ")}`,
        },
      ],
      valid: false,
    };
  }

  const data: T[] = [];
  const errors: ValidationError[] = [];

  const schema =
    type === "metadata" ? sensorMetadataCSVSchema : sensorReadingCSVSchema;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(/,|\t/).map((v) => v.trim());

    if (values.length !== headers.length) {
      errors.push({
        row: i + 1,
        field: "row",
        message: `Column count mismatch. Expected ${headers.length}, got ${values.length}`,
      });
      continue;
    }

    const rowData: any = {};
    headers.forEach((header, index) => {
      const value = values[index];

      if (value === "" || value === "null" || value === "NULL") {
        if (
          header === "operating_hours" ||
          header === "unit" ||
          header === "frequency" ||
          header === "P" ||
          header === "F" ||
          header === "failure_mode_name"
        ) {
          rowData[header] = null;
        } else {
          rowData[header] = value;
        }
      } else {
        rowData[header] = value;
      }
    });

    const validation = schema.safeParse(rowData);

    if (validation.success) {
      data.push(validation.data as T);
    } else {
      validation.error.issues.forEach((err) => {
        errors.push({
          row: i + 1,
          field: err.path.join("."),
          message: err.message,
          value: rowData[err.path[0]],
        });
      });
    }
  }

  return {
    data,
    errors,
    valid: errors.length === 0 && data.length > 0,
  };
}

export function generateMetadataTemplate(): string {
  const headers = [
    "sensor_name",
    "unit",
    "min_value",
    "max_value",
    "frequency",
    "P",
    "F",
    "failure_mode_name",
  ];

  return headers.join(",");
}

export function generateReadingsTemplate(): string {
  const headers = ["sensor_name", "value", "operating_hours", "date"];

  return headers.join(",");
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}