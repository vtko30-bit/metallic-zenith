'use client';

import { useState } from 'react';
import { Recipe, Product } from '@/types';
import RecipeForm from '@/components/Recipe/RecipeForm';
import RecipeList from '@/components/Recipe/RecipeList';
import styles from './page.module.css';

interface Props {
  recipes: Recipe[];
  products: Product[];
  isAdmin: boolean;
}

export default function RecipesClient({ recipes, products, isAdmin }: Props) {
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

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
      />
    </div>
  );
}
