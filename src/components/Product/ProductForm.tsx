'use client';

import { useState } from 'react';
import { addProduct } from '@/app/actions';
import { UnitOfMeasure } from '@/types';
import styles from './Product.module.css';
import { PackagePlus } from 'lucide-react';

export default function ProductForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addProduct({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        uom: formData.get('uom') as UnitOfMeasure,
        minStock: Number(formData.get('minStock')),
        price: Number(formData.get('price')),
        isFinishedGood: formData.get('isFinishedGood') === 'on',
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Error al agregar producto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.horizontalFormContainer}>
      <form onSubmit={handleSubmit} className={styles.formHorizontal}>
        <div className={styles.field}>
          <input type="text" id="name" name="name" required placeholder="Nombre del Producto" />
        </div>
        
        <div className={styles.fieldSmall}>
          <select id="uom" name="uom" required className={styles.select}>
            <option value="UNIDAD">Unidad</option>
            <option value="KILOS">Kilos</option>
            <option value="GRAMOS">Gramos</option>
            <option value="LITROS">Litros</option>
          </select>
        </div>

        <div className={styles.fieldSmall}>
          <input type="number" id="price" name="price" required min="0" step="0.01" placeholder="Precio $" />
        </div>

        <div className={styles.fieldSmall}>
          <input type="number" id="minStock" name="minStock" required defaultValue="0" min="0" placeholder="Stock Mín" />
        </div>

        <div className={styles.checkboxField}>
          <input type="checkbox" id="isFinishedGood" name="isFinishedGood" />
          <label htmlFor="isFinishedGood">Manufacturado</label>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          <PackagePlus size={18} />
          {loading ? '...' : 'Agregar'}
        </button>
      </form>
    </div>
  );
}
