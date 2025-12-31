'use client';

import { useState } from 'react';
import { produceProduct } from '@/app/actions';
import { Product, Warehouse } from '@/types';
import styles from './Production.module.css';
import { Play } from 'lucide-react';

interface Props {
  products: Product[];
  warehouses: Warehouse[];
}

export default function ProductionForm({ products, warehouses }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const quantity = Number(formData.get('quantity'));

    try {
      await produceProduct(productId, quantity, warehouseId);
      alert('Producción registrada con éxito. Se ha descontado el inventario según la receta.');
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error(error);
      alert('Error al procesar producción: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h3>Nueva Orden de Producción</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Producto a Fabricar</label>
          <select name="productId" required className={styles.select}>
            <option value="">Seleccione producto...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label>Bodega de Salida/Entrada</label>
          <select name="warehouseId" required className={styles.select}>
            <option value="">Seleccione bodega...</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label>Cantidad a Producir</label>
          <input type="number" name="quantity" required min="1" step="1" placeholder="Ej. 100" className={styles.input} />
        </div>

        <button type="submit" disabled={loading || products.length === 0} className={styles.submitBtn}>
          <Play size={18} />
          {loading ? 'Procesando...' : 'Iniciar Producción'}
        </button>

        {products.length === 0 && (
          <p className={styles.warning}>Debes definir productos terminados con recetas antes de producir.</p>
        )}
      </form>
    </div>
  );
}
