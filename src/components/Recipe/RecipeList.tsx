'use client';

import { Recipe, Product } from '@/types';
import styles from './Recipe.module.css';
import { CookingPot, ChevronRight } from 'lucide-react';

interface Props {
  readonly recipes: Recipe[];
  readonly products: Product[];
}

export default function RecipeList({ recipes, products }: Props) {
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Desconocido';
  const getProductUom = (id: string) => products.find(p => p.id === id)?.uom || '';

  if (recipes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay recetas definidas.</p>
      </div>
    );
  }

  return (
    <div className={styles.listWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Producto Final</th>
            <th>Composición de la Fórmula</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => (
            <tr key={r.id}>
              <td className={styles.recipeName}>
                <CookingPot className={styles.recipeIcon} size={20} />
                {getProductName(r.productId)}
              </td>
              <td>
                <div className={styles.ingredientsCell}>
                  {r.ingredients.map((ing, idx) => (
                    <div key={idx} className={styles.ingMiniItem}>
                      <ChevronRight size={12} />
                      <span>{getProductName(ing.productId)}</span>
                      <strong>
                        {ing.quantity} {getProductUom(ing.productId).toLowerCase()}
                      </strong>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
