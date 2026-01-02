import { getRecipes, getProducts } from '@/app/actions';
import styles from './page.module.css';
import RecipeList from '@/components/Recipe/RecipeList';
import RecipeForm from '@/components/Recipe/RecipeForm';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const [recipes, products, session] = await Promise.all([
    getRecipes(),
    getProducts(),
    getServerSession(authOptions)
  ]);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Crear Receta</h2>
          <p>Define la composición de tus productos terminados</p>
        </div>
      </header>

      <div className={styles.content}>
        {isAdmin && <RecipeForm products={products} />}
        <RecipeList recipes={recipes} products={products} />
      </div>
    </div>
  );
}
