'use client';

import { useState } from 'react';
import { Warehouse, Product } from '@/types';
import { updateStockAdjustment } from '@/app/actions';
import styles from './InventoryCount.module.css';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  warehouses: Warehouse[];
  products: Product[];
  stock: Record<string, Record<string, number>>;
}

export default function InventoryCountForm({ warehouses, products, stock }: Props) {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleCountChange = (productId: string, value: string) => {
    setCounts({ ...counts, [productId]: Number(value) });
  };

  const handleNewInventory = () => {
    if (Object.keys(counts).length > 0 && !confirm('Tienes cambios sin guardar. ¿Seguro que deseas iniciar un nuevo inventario?')) {
      return;
    }
    setSelectedWarehouse('');
    setCounts({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return alert('Seleccione una bodega');

    setLoading(true);
    const adjustments = products.map(p => ({
      productId: p.id,
      physicalQty: counts[p.id] !== undefined ? counts[p.id] : (stock[selectedWarehouse]?.[p.id] || 0),
      currentQty: stock[selectedWarehouse]?.[p.id] || 0
    }));

    try {
      await updateStockAdjustment(selectedWarehouse, adjustments);
      alert('Ajuste de inventario completado');
      setCounts({});
    } catch (error) {
      console.error(error);
      alert('Error al procesar el ajuste');
    } finally {
      setLoading(false);
    }
  };

  const warehouseStock = stock[selectedWarehouse] || {};

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <button 
          onClick={handleNewInventory} 
          className={styles.newBtn}
        >
          <CheckCircle size={18} />
          Nuevo Inventario
        </button>
      </div>

      {!selectedWarehouse ? (
        <div className={styles.setupCard}>
          <header className={styles.setupHeader}>
            <AlertTriangle size={24} className={styles.warningIcon} />
            <div>
              <h3>Iniciar Toma de Inventario</h3>
              <p>Selecciona una bodega para generar la lista de conteo actual</p>
            </div>
          </header>
          <div className={styles.warehouseSelector}>
            <label>Seleccionar Bodega:</label>
            <select 
              value={selectedWarehouse} 
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className={styles.select}
            >
              <option value="">-- Seleccione Bodega --</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock Sistema</th>
                  <th>Stock Físico (Real)</th>
                  <th>Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const current = warehouseStock[p.id] || 0;
                  const physical = counts[p.id] !== undefined ? counts[p.id] : current;
                  const diff = physical - current;

                  return (
                    <tr key={p.id}>
                      <td className={styles.pName}>{p.name} <small>({p.uom})</small></td>
                      <td className={styles.currentQty}>{current}</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.001"
                          value={counts[p.id] ?? current}
                          onChange={(e) => handleCountChange(p.id, e.target.value)}
                          className={styles.input}
                        />
                      </td>
                      <td className={diff === 0 ? '' : diff > 0 ? styles.positive : styles.negative}>
                        {diff === 0 ? '-' : diff > 0 ? `+${diff}` : diff}
                        {diff !== 0 && (diff > 0 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <Save size={18} />
            {loading ? 'Guardando Ajustes...' : 'Confirmar y Ajustar Inventario'}
          </button>
        </form>
      )}
    </div>
  );
}
