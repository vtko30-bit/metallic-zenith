export const dynamic = 'force-dynamic';
import { getRecipes, getProducts } from '@/app/actions';
import styles from './page.module.css';
import RecipeList from '@/components/Recipe/RecipeList';
import RecipeForm from '@/components/Recipe/RecipeForm';

export default async function RecipesPage() {
  const [recipes, products] = await Promise.all([
    getRecipes(),
    getProducts()
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Crear Receta</h2>
          <p>Define la composición de tus productos terminados</p>
        </div>
      </header>

      <div className={styles.content}>
        <RecipeForm products={products} />
        <RecipeList recipes={recipes} products={products} />
      </div>
    </div>
  );
}
