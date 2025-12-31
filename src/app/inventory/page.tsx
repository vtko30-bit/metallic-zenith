import { getStockByWarehouse, getProducts, getWarehouses } from '@/app/actions';
import styles from './page.module.css';
import { Package, Warehouse as WarehouseIcon } from 'lucide-react';
import ExcelExportButton from '@/components/Excel/ExcelExportButton';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [stock, products, warehouses] = await Promise.all([
    getStockByWarehouse(),
    getProducts(),
    getWarehouses()
  ]);

  // Flatten stock for export
  const exportData = Object.entries(stock).flatMap(([warehouseId, productsData]) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return Object.entries(productsData).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        Bodega: warehouse?.name || '?',
        Producto: product?.name || '?',
        Cantidad: quantity,
        UOM: product?.uom || '?'
      };
    });
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Estado de Inventario</h2>
          <p>Consulta existencias actuales por bodega</p>
        </div>
        <ExcelExportButton data={exportData} filename="reporte_inventario" label="Exportar Inventario" />
      </header>

      <div className={styles.grid}>
        {warehouses.map((w) => (
          <div key={w.id} className={styles.warehouseCard}>
            <div className={styles.cardHeader}>
              <WarehouseIcon size={20} />
              <h3>{w.name}</h3>
            </div>
            <div className={styles.stockList}>
              {Object.entries(stock[w.id] || {}).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product || quantity === 0) return null;
                return (
                  <div key={productId} className={styles.stockItem}>
                    <Package size={14} className={styles.itemIcon} />
                    <span className={styles.itemName}>{product.name}</span>
                    <span className={`${styles.itemQty} ${quantity < product.minStock ? styles.lowStock : ''}`}>
                      {quantity} {product.uom.toLowerCase()}
                    </span>
                  </div>
                );
              })}
              {(!stock[w.id] || Object.keys(stock[w.id]).length === 0) && (
                <p className={styles.empty}>Sin existencias</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
