import { getProducts, getWarehouses, getRecipes } from '@/app/actions';
import ProductionForm from '@/components/Production/ProductionForm';
import styles from './production.module.css';

export const dynamic = 'force-dynamic';

export default async function ProductionPage() {
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
          <p>Registra la fabricación de productos terminados y descuenta materias primas automaticamente</p>
        </div>
      </header>

      <div className={styles.content}>
        <ProductionForm 
          products={finishedGoodsWithRecipes} 
          warehouses={warehouses} 
        />
      </div>
    </div>
  );
}
