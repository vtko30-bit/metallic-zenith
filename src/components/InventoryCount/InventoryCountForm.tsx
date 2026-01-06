'use client';

import { useState } from 'react';
import { Warehouse, Product } from '@/types';
import { recordInventoryCount } from '@/app/actions';
import styles from './InventoryCount.module.css';
import InventoryList from './InventoryList';
import InventorySetupForm from './InventorySetupForm';
import InventorySheet from './InventorySheet';

interface InventoryCountSummary {
  id: string;
  warehouseId: string;
  warehouseName: string;
  userId: string;
  userName: string;
  date: string;
  itemCount: number;
}

interface Props {
  readonly warehouses: Warehouse[];
  readonly products: Product[];
  readonly stock: Record<string, Record<string, number>>;
  readonly initialHistory: InventoryCountSummary[];
}

export default function InventoryCountForm({ warehouses, products, stock, initialHistory }: Props) {
  const [view, setView] = useState<'LIST' | 'SETUP' | 'SHEET'>('LIST');
  const [setupData, setSetupData] = useState<{ warehouseId: string; date: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(initialHistory);

  const handleCreateSetup = (data: { warehouseId: string; date: string }) => {
    setSetupData(data);
    setView('SHEET');
  };

  const handleSaveInventory = async (items: { productId: string; expectedQty: number; physicalQty: number }[]) => {
    if (!setupData) return;
    
    setLoading(true);
    try {
      const result = await recordInventoryCount({
        warehouseId: setupData.warehouseId,
        date: new Date(setupData.date),
        items
      });
      
      // Update local history (simplified, better to revalidate)
      const newCount: InventoryCountSummary = {
        id: result.id,
        warehouseId: setupData.warehouseId,
        warehouseName: warehouses.find(w => w.id === setupData.warehouseId)?.name || 'N/A',
        userId: '',
        userName: 'Yo', // Placeholder for current session
        date: setupData.date,
        itemCount: items.length
      };
      
      setHistory([newCount, ...history]);
      alert('Toma de inventario registrada y ajustes realizados con éxito.');
      setView('LIST');
      setSetupData(null);
    } catch (error) {
      console.error(error);
      alert('Error al registrar la toma de inventario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {view === 'LIST' && (
        <InventoryList 
          counts={history} 
          onNew={() => setView('SETUP')} 
        />
      )}

      {view === 'SETUP' && (
        <InventorySetupForm 
          warehouses={warehouses}
          onCreate={handleCreateSetup}
          onCancel={() => setView('LIST')}
        />
      )}

      {view === 'SHEET' && setupData && (
        <InventorySheet 
          warehouse={warehouses.find(w => w.id === setupData.warehouseId)!}
          date={setupData.date}
          products={products}
          currentStock={stock[setupData.warehouseId] || {}}
          onSave={handleSaveInventory}
          onBack={() => setView('SETUP')}
          loading={loading}
        />
      )}
    </div>
  );
}
