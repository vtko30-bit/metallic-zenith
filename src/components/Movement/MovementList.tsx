'use client';

import { Movement, Product, Warehouse } from '@/types';
import styles from './Movement.module.css';
import { 
  ArrowRightCircle, 
  ArrowLeftCircle, 
  RefreshCcw, 
  Calendar,
  Tag,
  User as UserIcon
} from 'lucide-react';

interface Props {
  movements: Movement[];
  products: Product[];
  warehouses: Warehouse[];
}

export default function MovementList({ movements, products, warehouses }: Props) {
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Desconocido';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Externo';

  const sortedMovements = [...movements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={styles.listContainer}>
      <h3>Historial de Movimientos</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Ref.</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {sortedMovements.map((m) => {
              const item = m.items[0]; // Simplification for now
              return (
                <tr key={m.id}>
                  <td className={styles.dateCell}>
                    <Calendar size={14} />
                    {new Date(m.date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[m.type]}`}>
                      {m.type === 'ENTRADA' && <ArrowRightCircle size={14} />}
                      {m.type === 'SALIDA' && <ArrowLeftCircle size={14} />}
                      {m.type === 'TRASPASO' && <RefreshCcw size={14} />}
                      {m.type}
                    </span>
                  </td>
                  <td>{m.originWarehouseId ? getWarehouseName(m.originWarehouseId) : '-'}</td>
                  <td>{m.destinationWarehouseId ? getWarehouseName(m.destinationWarehouseId) : '-'}</td>
                  <td>
                    <div className={styles.productCell}>
                      <Tag size={12} />
                      {getProductName(item.productId)}
                    </div>
                  </td>
                  <td className={styles.quantityCell}>{item.quantity}</td>
                  <td className={styles.refCell}>{m.reference || '-'}</td>
                  <td>
                    <div className={styles.userCell}>
                      <UserIcon size={12} />
                      {m.userName}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
