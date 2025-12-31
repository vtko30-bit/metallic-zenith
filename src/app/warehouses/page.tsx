import { getWarehouses } from '@/app/actions';
import styles from './page.module.css';
import WarehouseList from '@/components/Warehouse/WarehouseList';
import WarehouseForm from '@/components/Warehouse/WarehouseForm';

export const dynamic = 'force-dynamic';

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Gestión de Bodegas</h2>
          <p>Administra tus ubicaciones de almacenamiento</p>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.formSection}>
          <WarehouseForm />
        </section>
        
        <section className={styles.listSection}>
          <WarehouseList initialWarehouses={warehouses} />
        </section>
      </div>
    </div>
  );
}
