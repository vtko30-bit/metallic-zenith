'use client';

import { useState } from 'react';
import { addWarehouse } from '@/app/actions';
import styles from './Warehouse.module.css';
import { PlusCircle } from 'lucide-react';

export default function WarehouseForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const location = formData.get('location') as string;

    try {
      await addWarehouse({ name, location });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Error al agregar bodega');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.formContainer}>
      <h3>Nueva Bodega</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name">Nombre</label>
          <input type="text" id="name" name="name" required placeholder="Ej. Bodega Central" />
        </div>
        <div className={styles.field}>
          <label htmlFor="location">Ubicación</label>
          <input type="text" id="location" name="location" placeholder="Ej. Sector Norte, Pasillo 4" />
        </div>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          <PlusCircle size={18} />
          {loading ? 'Agregando...' : 'Agregar Bodega'}
        </button>
      </form>
    </div>
  );
}
