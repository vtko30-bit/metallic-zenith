import styles from './InventoryCount.module.css';
import { ClipboardList, Calendar, User, Package } from 'lucide-react';

interface InventoryCountSummary {
  id: string;
  warehouseId: string;
  warehouseName: string;
  userId: string;
  userName: string;
  date: string;
  itemCount: number;
}

interface Props {
  readonly counts: InventoryCountSummary[];
  readonly onNew: () => void;
}

export default function InventoryList({ counts, onNew }: Props) {
  return (
    <div className={styles.listContainer}>
      <header className={styles.listHeader}>
        <h3>Historial de Tomas</h3>
        <button onClick={onNew} className={styles.newBtn}>
          <ClipboardList size={20} />
          NUEVO INVENTARIO
        </button>
      </header>

      {counts.length === 0 ? (
        <div className={styles.emptyState}>
          <ClipboardList size={48} />
          <p>No hay registros de inventarios anteriores.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Bodega</th>
                <th>Responsable</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {counts.map(c => (
                <tr key={c.id}>
                  <td className={styles.dateCell}>
                    <Calendar size={14} />
                    {new Date(c.date).toLocaleDateString('es-CL')}
                  </td>
                  <td>{c.warehouseName}</td>
                  <td className={styles.userCell}>
                    <User size={14} />
                    {c.userName}
                  </td>
                  <td className={styles.itemCell}>
                    <Package size={14} />
                    {c.itemCount} ítems
                  </td>
                  <td>
                    {/* Placeholder for future "Ver Detalle" */}
                    <button className={styles.viewBtn} title="Ver Detalle">
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
