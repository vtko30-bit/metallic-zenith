'use client';

import { useState } from 'react';
import { Product } from '@/types';
import styles from './Product.module.css';
import { Package } from 'lucide-react';

interface Props {
  initialProducts: Product[];
  onProductClick: (product: Product) => void;
}

export default function ProductList({ initialProducts, onProductClick }: Props) {
  const [tab, setTab] = useState<'MP' | 'PT'>('MP');

  const filteredProducts = initialProducts.filter(p => 
    tab === 'PT' ? p.isFinishedGood : !p.isFinishedGood
  );

  if (initialProducts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay productos registrados.</p>
      </div>
    );
  }

  return (
    <div className={styles.listWrapper}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${tab === 'MP' ? styles.tabActive : ''}`}
          onClick={() => setTab('MP')}
        >
          Insumos
        </button>
        <button 
          className={`${styles.tab} ${tab === 'PT' ? styles.tabActive : ''}`}
          onClick={() => setTab('PT')}
        >
          Productos
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>UOM</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Stock Mín.</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr 
                key={p.id} 
                onClick={() => onProductClick(p)}
                className={styles.clickableRow}
                title="Ver detalle del producto"
              >
                <td className={styles.pName}>
                  <Package size={16} className={styles.pIcon} />
                  {p.name}
                </td>
                <td><span className={styles.badge}>{p.uom}</span></td>
                <td>
                  {p.isFinishedGood ? (
                    <span className={styles.finishedBadge}>Producto</span>
                  ) : (
                    <span className={styles.rawBadge}>Insumo</span>
                  )}
                </td>
                <td className={styles.priceCell}>${p.price?.toLocaleString() || '0'}</td>
                <td className={styles.minStockCell}>
                  {p.minStock} {p.uom.toLowerCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredProducts.length === 0 && (
        <p className={styles.empty}>No hay {tab === 'MP' ? 'insumos' : 'productos'} registrados.</p>
      )}
    </div>
  );
}
