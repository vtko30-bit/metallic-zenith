export const dynamic = 'force-dynamic';
import { getProducts, getWarehouses, getRecipes } from '@/app/actions';
import styles from './page.module.css';
import ProductionForm from '@/components/Production/ProductionForm';

export default async function DashboardPage() {
  const [products, warehouses, recipes] = await Promise.all([
    getProducts(),
    getWarehouses(),
    getRecipes()
  ]);

  const finishedGoodsWithRecipes = products.filter(p => 
    p.isFinishedGood && recipes.some(r => r.productId === p.id)
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Consola de Producción</h2>
          <p>Inicia el proceso de fabricación y descuenta inventario</p>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.prodSection}>
          <ProductionForm 
            products={finishedGoodsWithRecipes} 
            warehouses={warehouses} 
          />
        </section>
        
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
