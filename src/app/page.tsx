import { getProducts, getWarehouses, getRecipes } from '@/app/actions';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [products, warehouses, recipes] = await Promise.all([
    getProducts(),
    getWarehouses(),
    getRecipes()
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Resumen del Sistema</h2>
          <p>Vista general del inventario y operaciones</p>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <h4>Total Productos</h4>
            <span className={styles.statValue}>{products.length}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Bodegas Activas</h4>
            <span className={styles.statValue}>{warehouses.length}</span>
          </div>
          <div className={styles.statCard}>
            <h4>Recetas Configuradas</h4>
            <span className={styles.statValue}>{recipes.length}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
