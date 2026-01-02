'use client';

import { useState } from 'react';
import { Recipe, Product } from '@/types';
import RecipeForm from '@/components/Recipe/RecipeForm';
import RecipeList from '@/components/Recipe/RecipeList';
import { deleteRecipe } from '@/app/actions';
import styles from './page.module.css';

interface Props {
  recipes: Recipe[];
  products: Product[];
  isAdmin: boolean;
}

export default function RecipesClient({ recipes, products, isAdmin }: Props) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta receta? Se eliminará también el producto asociado.')) return;
    try {
      await deleteRecipe(id);
      alert('Receta eliminada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la receta');
    }
  };

  return (
    <div className={styles.content}>
      {isAdmin && (
        <RecipeForm 
          products={products} 
          initialData={editingRecipe} 
          onCancel={() => setEditingRecipe(null)} 
        />
      )}
      <RecipeList 
        recipes={recipes} 
        products={products} 
        isAdmin={isAdmin}
        onEdit={(recipe) => setEditingRecipe(recipe)}
        onDelete={handleDelete}
      />
    </div>
  );
}
