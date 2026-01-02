import { getProducts, getWarehouses, getStockByWarehouse } from '@/app/actions';
import styles from './page.module.css';
import ProductsClient from './ProductsClient';
import ProductForm from '@/components/Product/ProductForm';
import ProductImportButton from '@/components/Excel/ProductImportButton';
import ExcelExportButton from '@/components/Excel/ExcelExportButton';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, session, warehouses, stock] = await Promise.all([
    getProducts(),
    getServerSession(authOptions),
    getWarehouses(),
    getStockByWarehouse()
  ]);

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Gestión de Catálogo</h2>
          <p>Consulta detalles, existencias y movimientos de tus productos</p>
        </div>
        {isAdmin && (
          <div className={styles.actions}>
            <ProductImportButton />
            <ExcelExportButton data={products} filename="catalogo_productos" label="Exportar Productos" />
          </div>
        )}
      </header>

      <div className={styles.content}>
        {isAdmin && <ProductForm />}
        <ProductsClient 
          products={products} 
          warehouses={warehouses} 
          stock={stock} 
        />
      </div>
    </div>
  );
}
