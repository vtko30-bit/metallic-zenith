import { getProducts } from '@/app/actions';
import styles from './page.module.css';
import ProductList from '@/components/Product/ProductList';
import ProductForm from '@/components/Product/ProductForm';
import ProductImportButton from '@/components/Excel/ProductImportButton';
import ExcelExportButton from '@/components/Excel/ExcelExportButton';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Crear Producto</h2>
          <p>Gestiona los insumos y productos de tu inventario</p>
        </div>
        <div className={styles.actions}>
          <ProductImportButton />
          <ExcelExportButton data={products} filename="catalogo_productos" label="Exportar Productos" />
        </div>
      </header>

      <div className={styles.content}>
        <ProductForm />
        <ProductList initialProducts={products} />
      </div>
    </div>
  );
}
