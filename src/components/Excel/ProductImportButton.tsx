'use client';

import { useRef, useState } from 'react';
import { parseExcel } from '@/lib/excel';
import { importProducts } from '@/app/actions';
import { Upload } from 'lucide-react';
import styles from './ExcelActions.module.css';

export default function ProductImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await parseExcel(file);
      await importProducts(data as any);
      alert('Productos importados correctamente');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Error al importar archivo Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.importWrapper}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".xlsx, .xls" 
        style={{ display: 'none' }} 
      />
      <button 
        onClick={() => fileInputRef.current?.click()} 
        className={styles.importBtn}
        disabled={loading}
      >
        <Upload size={18} />
        {loading ? 'Importando...' : 'Importar Excel'}
      </button>
    </div>
  );
}
