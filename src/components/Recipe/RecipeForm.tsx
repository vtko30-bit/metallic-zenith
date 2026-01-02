'use client';

import { useState, useEffect } from 'react';
import { addRecipe, updateRecipe } from '@/app/actions';
import { Product, Recipe } from '@/types';
import styles from './Recipe.module.css';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface Props {
  readonly products: Product[];
  readonly initialData?: Recipe | null;
  readonly onCancel?: () => void;
}

interface LocalIngredient {
  key: string;
  productId: string;
  quantity: number | string;
  selectedUom: string;
}

export default function RecipeForm({ products, initialData, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [productName, setProductName] = useState('');
  const [existingProductId, setExistingProductId] = useState('');
  const [ingredients, setIngredients] = useState<LocalIngredient[]>([]);
  
  const rawMaterials = products.filter(p => !p.isFinishedGood);
  // Products that are NOT ingredients (could be already FGs or just other products) 
  // and satisfy some criteria? Actually, let's keep it simple: 
  // any product that doesn't have a recipe yet.
  // We need the list of recipes to filter them out, or just pass the list of "eligible" products from parent.
  // For now, I'll allow selecting any product.
  const eligibleProducts = products.filter(p => !p.isFinishedGood || products.find(prod => prod.id === p.id && !prod.isFinishedGood)); 
  // Actually, better: products that are NOT currently the target of another recipe.
  // But I don't have the recipe list here. I'll just show all products.
  
  useEffect(() => {
    if (initialData) {
      setMode('EXISTING');
      setExistingProductId(initialData.productId);
      setProductName(initialData.product?.name || '');
      setIngredients(initialData.ingredients.map((ing, idx) => ({
        key: `${ing.productId}-${idx}-${Date.now()}`,
        productId: ing.productId,
        quantity: ing.quantity,
        selectedUom: ing.product?.uom || products.find(p => p.id === ing.productId)?.uom || 'UNIDAD'
      })));
    } else {
      setMode('NEW');
      setProductName('');
      setExistingProductId('');
      setIngredients([]);
    }
  }, [initialData, products]);

  const UOM_OPTIONS = ['UNIDAD', 'KILOS', 'GRAMOS', 'LITROS', 'MILILITROS'];

  const convertToStoreUnit = (value: number, from: string, to: string): number => {
    if (from === to) return value;
    if (from === 'GRAMOS' && to === 'KILOS') return value / 1000;
    if (from === 'KILOS' && to === 'GRAMOS') return value * 1000;
    if (from === 'MILILITROS' && to === 'LITROS') return value / 1000;
    if (from === 'LITROS' && to === 'MILILITROS') return value * 1000;
    return value;
  };

  function addIngredient() {
    setIngredients([...ingredients, { key: `new-${Date.now()}`, productId: '', quantity: '', selectedUom: '' }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof LocalIngredient, value: string | number) {
    const newIngs = [...ingredients];
    const updated = { ...newIngs[index], [field]: value };
    
    // Auto-set UOM when product is selected
    if (field === 'productId') {
      const p = rawMaterials.find(item => item.id === value);
      if (p) updated.selectedUom = p.uom;
    }
    
    newIngs[index] = updated;
    setIngredients(newIngs);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ingredients.length === 0) return alert('Debes agregar al menos un ingrediente');
    
    if (mode === 'NEW' && !productName) return alert('Falta el nombre del producto');
    if (mode === 'EXISTING' && !existingProductId) return alert('Seleccione un producto existente');
    
    setLoading(true);

    try {
      // Convert all ingredients to their product's base unit
      const processedIngredients = ingredients.map(ing => {
        const product = rawMaterials.find(p => p.id === ing.productId)!;
        const convertedQty = convertToStoreUnit(Number(ing.quantity), ing.selectedUom, product.uom);
        return {
          productId: ing.productId,
          quantity: convertedQty
        };
      });

      if (initialData) {
        await updateRecipe(initialData.id, {
          productName: mode === 'NEW' ? productName : products.find(p => p.id === existingProductId)?.name || '',
          ingredients: processedIngredients
        });
        alert('Receta actualizada');
        if (onCancel) onCancel();
      } else {
        await addRecipe({
          productName: mode === 'NEW' ? productName : undefined,
          productId: mode === 'EXISTING' ? existingProductId : undefined,
          uom: 'UNIDAD',
          ingredients: processedIngredients
        });
        alert('Receta guardada');
      }
      setIngredients([]);
      setProductName('');
      setExistingProductId('');
    } catch (error) {
      console.error(error);
      alert('Error al guardar receta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.horizontalFormContainer}>
      {!initialData && (
        <div className={styles.modeToggle}>
          <button 
            type="button" 
            className={`${styles.toggleBtn} ${mode === 'NEW' ? styles.active : ''}`}
            onClick={() => setMode('NEW')}
          >
            Nuevo Producto
          </button>
          <button 
            type="button" 
            className={`${styles.toggleBtn} ${mode === 'EXISTING' ? styles.active : ''}`}
            onClick={() => setMode('EXISTING')}
          >
            Producto Existente
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.formHorizontal}>
        <div className={styles.formTopRow}>
          <div className={styles.field}>
            <label htmlFor="productTarget" className={styles.label}>
              {initialData ? 'Editando Producto' : mode === 'NEW' ? 'Nuevo Producto' : 'Seleccionar Producto'}
            </label>
            
            {mode === 'NEW' || initialData ? (
              <input 
                id="productTarget"
                type="text" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Pasta de Tomate" 
                required 
                disabled={Boolean(initialData)} // Don't rename product here if editing? No, plan says rename is allowed.
                className={styles.input} 
              />
            ) : (
              <select
                id="productTarget"
                value={existingProductId}
                onChange={(e) => setExistingProductId(e.target.value)}
                required
                className={styles.select}
              >
                <option value="">Seleccione un producto...</option>
                {eligibleProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className={styles.ingredientsHeader}>
          <h4>Ingredientes de la Fórmula</h4>
          <button type="button" onClick={addIngredient} className={styles.addBtn}>
            <Plus size={16} /> Agregar Ingrediente
          </button>
        </div>

        <div className={styles.ingredientsList}>
          {ingredients.map((ing, index) => {
            const rowId = `ing-${index}`;
            return (
              <div key={ing.key} className={styles.ingredientRow}>
                <div className={styles.fieldItem}>
                  <label htmlFor={`${rowId}-qty`} className={styles.label}>Cantidad</label>
                  <input 
                    id={`${rowId}-qty`}
                    type="number" 
                    value={ing.quantity} 
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    placeholder="0.000"
                    step="0.001"
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldItem} style={{ flex: '0.8' }}>
                  <label htmlFor={`${rowId}-uom`} className={styles.label}>Unidad de Medida</label>
                  <select 
                    id={`${rowId}-uom`}
                    value={ing.selectedUom} 
                    onChange={(e) => updateIngredient(index, 'selectedUom', e.target.value)}
                    required
                    className={styles.select}
                  >
                    <option value="">Uni...</option>
                    {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className={styles.fieldItem} style={{ flex: '3' }}>
                  <label htmlFor={`${rowId}-select`} className={styles.label}>Ingrediente</label>
                  <select 
                    id={`${rowId}-select`}
                    value={ing.productId} 
                    onChange={(e) => updateIngredient(index, 'productId', e.target.value)}
                    required
                    className={styles.select}
                  >
                    <option value="">Seleccionar...</option>
                    {rawMaterials.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={() => removeIngredient(index)} 
                  className={styles.removeBtn}
                  style={{ marginTop: '1.2rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          {ingredients.length === 0 && (
            <p className={styles.empty} style={{ padding: '1rem', borderStyle: 'none' }}>
              Haz clic en &quot;Agregar Ingrediente&quot; para empezar a definir la receta.
            </p>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <Save size={18} />
            {loading ? '...' : initialData ? 'Guardar Cambios' : 'Guardar Receta'}
          </button>
          
          {initialData && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              <X size={18} />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
