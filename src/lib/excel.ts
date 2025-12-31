import * as XLSX from 'xlsx';

/**
 * Utility to export an array of data objects to Excel
 */
export function exportToExcel(data: Record<string, any>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Utility to parse an Excel file and return JSON data
 */
export async function parseExcel<T = Record<string, any>>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as T[];
        resolve(data);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsBinaryString(file);
  });
}
