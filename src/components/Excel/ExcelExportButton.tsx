'use client';

import { exportToExcel } from '@/lib/excel';
import { Download } from 'lucide-react';
import styles from './ExcelActions.module.css';

interface Props {
  data: any[];
  filename: string;
  label: string;
}

export default function ExcelExportButton({ data, filename, label }: Props) {
  return (
    <button 
      onClick={() => exportToExcel(data, filename)} 
      className={styles.exportBtn}
      title="Exportar a Excel"
    >
      <Download size={18} />
      <span>{label}</span>
    </button>
  );
}
