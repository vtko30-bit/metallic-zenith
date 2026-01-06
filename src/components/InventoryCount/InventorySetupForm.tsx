'use client';

import { useState } from 'react';
import { Warehouse } from '@/types';
import styles from './InventoryCount.module.css';
import { Calendar, Warehouse as WarehouseIcon, Play } from 'lucide-react';

interface Props {
  readonly warehouses: Warehouse[];
  readonly onCreate: (data: { warehouseId: string; date: string }) => void;
  readonly onCancel: () => void;
}

export default function InventorySetupForm({ warehouses, onCreate, onCancel }: Props) {
  const [warehouseId, setWarehouseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) return alert('Seleccione una bodega');
    onCreate({ warehouseId, date });
  };

  return (
    <div className={styles.setupCard}>
      <header className={styles.setupHeader}>
        <WarehouseIcon size={24} className={styles.headerIcon} />
        <div>
          <h3>Nueva Toma de Inventario</h3>
          <p>Define la bodega y fecha para iniciar el conteo físico</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.setupForm}>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label>
              <Calendar size={16} />
              Fecha de Toma:
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label>
              <WarehouseIcon size={16} />
              Bodega a Inventariar:
            </label>
            <select 
              value={warehouseId} 
              onChange={e => setWarehouseId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">-- Seleccione Bodega --</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.createBtn}>
            <Play size={18} />
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}
