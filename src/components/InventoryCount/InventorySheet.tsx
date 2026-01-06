'use client';

import { useState } from 'react';
import { Product, Warehouse } from '@/types';
import styles from './InventoryCount.module.css';
import { Save, ArrowLeft, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  readonly warehouse: Warehouse;
  readonly date: string;
  readonly products: Product[];
  readonly currentStock: Record<string, number>;
  readonly onSave: (items: { productId: string; expectedQty: number; physicalQty: number }[]) => void;
  readonly onBack: () => void;
  readonly loading: boolean;
}

export default function InventorySheet({ warehouse, date, products, currentStock, onSave, onBack, loading }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const handleCountChange = (productId: string, value: string) => {
    const num = value === '' ? 0 : Number(value);
    setCounts(prev => ({ ...prev, [productId]: num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = products.map(p => ({
      productId: p.id,
      expectedQty: currentStock[p.id] || 0,
      physicalQty: counts[p.id] ?? (currentStock[p.id] || 0)
    }));
    onSave(items);
  };

  return (
    <div className={styles.sheetContainer}>
      <header className={styles.sheetHeader}>
        <div className={styles.sheetInfo}>
          <button onClick={onBack} className={styles.backBtn} title="Volver">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3>Hoja de Conteo: {warehouse.name}</h3>
            <p>Fecha: {new Date(date).toLocaleDateString('es-CL')}</p>
          </div>
        </div>
        <button 
          form="inventory-form" 
          type="submit" 
          className={styles.saveBtn}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Procesando...' : 'Finalizar Toma'}
        </button>
      </header>

      <form id="inventory-form" onSubmit={handleSubmit} className={styles.sheetForm}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Sistema</th>
                <th>Físico</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const expected = currentStock[p.id] || 0;
                const physical = counts[p.id] ?? expected;
                const diff = physical - expected;

                return (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.pInfo}>
                        <Package size={14} />
                        <span>{p.name}</span>
                        <small>{p.uom}</small>
                      </div>
                    </td>
                    <td className={styles.systemQty}>{expected}</td>
                    <td>
                      <input 
                        type="number"
                        step="0.001"
                        placeholder={expected.toString()}
                        value={counts[p.id] ?? ''}
                        onChange={e => handleCountChange(p.id, e.target.value)}
                        className={styles.sheetInput}
                        autoFocus={p === products[0]}
                      />
                    </td>
                    <td className={diff > 0 ? styles.positive : diff < 0 ? styles.negative : ''}>
                      {diff === 0 ? '-' : (diff > 0 ? `+${diff}` : diff.toString())}
                      {diff !== 0 && (diff > 0 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
