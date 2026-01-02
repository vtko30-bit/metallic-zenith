'use client';

import { useEffect, useState } from 'react';
import { Product, Warehouse } from '@/types';
import { getProductMovements } from '@/app/actions';
import styles from './ProductDetail.module.css';
import { X, Package, Warehouse as WarehouseIcon, History, AlertTriangle } from 'lucide-react';

interface Props {
  product: Product;
  warehouses: Warehouse[];
  stockData: Record<string, number>; // warehouseId -> quantity
  onClose: () => void;
}

type ProductMovement = Awaited<ReturnType<typeof getProductMovements>>[number];

export default function ProductDetail({ product, warehouses, stockData, onClose }: Props) {
  const [movements, setMovements] = useState<ProductMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const history = await getProductMovements(product.id);
        setMovements(history);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [product.id]);

  const totalStock = Object.values(stockData).reduce((a, b) => a + b, 0);
  const isLowStock = totalStock < product.minStock;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label="Cerrar detalle"
    >
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <div className={styles.iconBox}>
              <Package size={24} />
            </div>
            <div>
              <h3 id="product-detail-title">{product.name}</h3>
              <span className={styles.productType}>
                {product.isFinishedGood ? 'Producto Terminado' : 'Insumo / Materia Prima'}
              </span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.grid}>
            {/* Info Section */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Información General</h4>
              <div className={styles.infoCard}>
                <div className={styles.infoItem}>
                  <div className={styles.fakeLabel}>Unidad de Medida</div>
                  <span>{product.uom}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.fakeLabel}>Precio Unitario</div>
                  <span>${product.price.toLocaleString()}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.fakeLabel}>Stock Mínimo</div>
                  <span>{product.minStock} {product.uom.toLowerCase()}</span>
                </div>
                <div className={`${styles.infoItem} ${isLowStock ? styles.warning : ''}`}>
                  <div className={styles.fakeLabel}>Stock Total</div>
                  <div className={styles.stockStatus}>
                    <strong>{totalStock} {product.uom.toLowerCase()}</strong>
                    {isLowStock && <AlertTriangle size={14} />}
                  </div>
                </div>
              </div>
            </section>

            {/* Warehouse Section */}
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Stock por Bodega</h4>
              <div className={styles.warehouseGrid}>
                {warehouses.map(w => {
                  const qty = stockData[w.id] || 0;
                  return (
                    <div key={w.id} className={styles.warehouseItem}>
                      <div className={styles.wName}>
                        <WarehouseIcon size={14} />
                        <span>{w.name}</span>
                      </div>
                      <span className={styles.wQty}>{qty} {product.uom.toLowerCase()}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* History Section */}
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <History size={16} /> Historial Reciente (Últimos 10)
            </h4>
            <div className={styles.historyWrapper}>
              {loading ? (
                <p className={styles.loading}>Cargando historial...</p>
              ) : movements.length === 0 ? (
                <p className={styles.emptyHistory}>Sin movimientos registrados</p>
              ) : (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Referencia</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => {
                      const isEntry = Boolean(m.destinationWarehouseId);
                      return (
                        <tr key={m.id}>
                          <td>{new Date(m.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`${styles.typeBadge} ${styles[m.type as keyof typeof styles] || ''}`}>
                              {m.type}
                            </span>
                          </td>
                          <td>
                            <span className={isEntry ? styles.positive : styles.negative}>
                              {isEntry ? '+' : '-'}{m.quantity}
                            </span>
                          </td>
                          <td className={styles.refCell}>{m.reference || '-'}</td>
                          <td>{m.userName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
