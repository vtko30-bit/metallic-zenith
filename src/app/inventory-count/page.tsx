export const dynamic = 'force-dynamic';
import { getStockByWarehouse, getProducts, getWarehouses } from '@/app/actions';
import styles from './page.module.css';
import InventoryCountForm from '@/components/InventoryCount/InventoryCountForm';


export default async function InventoryCountPage() {
  const [stock, products, warehouses] = await Promise.all([
    getStockByWarehouse(),
    getProducts(),
    getWarehouses()
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Toma de Inventario</h2>
          <p>Registra el stock físico real y ajusta las diferencias automáticamente</p>
        </div>
      </header>

      <div className={styles.content}>
        <InventoryCountForm 
          warehouses={warehouses} 
          products={products} 
          stock={stock} 
        />
      </div>
    </div>
  );
}
