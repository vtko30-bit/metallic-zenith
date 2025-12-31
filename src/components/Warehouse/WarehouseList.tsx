'use client';

import { Warehouse } from '@/types';
import styles from './Warehouse.module.css';
import { Warehouse as WarehouseIcon, MapPin } from 'lucide-react';

interface Props {
  initialWarehouses: Warehouse[];
}

export default function WarehouseList({ initialWarehouses }: Props) {
  if (initialWarehouses.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay bodegas registradas.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {initialWarehouses.map((w) => (
        <div key={w.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <WarehouseIcon className={styles.icon} size={24} />
            <h4>{w.name}</h4>
          </div>
          {w.location && (
            <div className={styles.cardBody}>
              <MapPin size={16} />
              <span>{w.location}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
