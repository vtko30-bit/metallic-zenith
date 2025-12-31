'use client';

import { useState } from 'react';
import { addMovement } from '@/app/actions';
import { Product, Warehouse, MovementType } from '@/types';
import styles from './Movement.module.css';
import { Send } from 'lucide-react';

interface Props {
  products: Product[];
  warehouses: Warehouse[];
}

export default function MovementForm({ products, warehouses }: Props) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<MovementType>('ENTRADA');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const originWarehouseId = formData.get('originWarehouseId') as string;
    const destinationWarehouseId = formData.get('destinationWarehouseId') as string;
    const productId = formData.get('productId') as string;
    const quantity = Number(formData.get('quantity'));

    try {
      await addMovement({
        type,
        originWarehouseId: (type === 'SALIDA' || type === 'TRASPASO') ? originWarehouseId : undefined,
        destinationWarehouseId: (type === 'ENTRADA' || type === 'TRASPASO') ? destinationWarehouseId : undefined,
        items: [{ productId, quantity }],
        reference: formData.get('reference') as string,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.formContainer}>
      <h3>Registrar Movimiento</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="type">Tipo de Movimiento</label>
          <select 
            id="type" 
            name="type" 
            value={type} 
            onChange={(e) => setType(e.target.value as MovementType)}
            required 
            className={styles.select}
          >
            <option value="ENTRADA">Entrada de Mercadería</option>
            <option value="SALIDA">Salida de Mercadería</option>
            <option value="TRASPASO">Traspaso entre Bodegas</option>
          </select>
        </div>

        {(type === 'SALIDA' || type === 'TRASPASO') && (
          <div className={styles.field}>
            <label htmlFor="originWarehouseId">Bodega Origen</label>
            <select id="originWarehouseId" name="originWarehouseId" required className={styles.select}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        )}

        {(type === 'ENTRADA' || type === 'TRASPASO') && (
          <div className={styles.field}>
            <label htmlFor="destinationWarehouseId">Bodega Destino</label>
            <select id="destinationWarehouseId" name="destinationWarehouseId" required className={styles.select}>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="productId">Producto</label>
            <select id="productId" name="productId" required className={styles.select}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.uom})</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="quantity">Cantidad</label>
            <input type="number" id="quantity" name="quantity" required min="0.01" step="0.01" placeholder="0.00" />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="reference">Referencia / Nota</label>
          <input type="text" id="reference" name="reference" placeholder="Ej. Factura #1234" />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          <Send size={18} />
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}
