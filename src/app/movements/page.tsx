import { getMovements, getProducts, getWarehouses } from '@/app/actions';
import styles from './page.module.css';
import MovementForm from '@/components/Movement/MovementForm';
import MovementList from '@/components/Movement/MovementList';
import ExcelExportButton from '@/components/Excel/ExcelExportButton';

export const dynamic = 'force-dynamic';

export default async function MovementsPage() {
  const [movements, products, warehouses] = await Promise.all([
    getMovements(),
    getProducts(),
    getWarehouses()
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Movimientos de Mercadería</h2>
          <p>Registra entradas, salidas y traspasos entre bodegas</p>
        </div>
        <ExcelExportButton data={movements} filename="movimientos_inventario" label="Exportar Historial" />
      </header>

      <div className={styles.content}>
        <section className={styles.formSection}>
          <MovementForm products={products} warehouses={warehouses} />
        </section>
        
        <section className={styles.listSection}>
          <MovementList movements={movements} products={products} warehouses={warehouses} />
        </section>
      </div>
    </div>
  );
}
