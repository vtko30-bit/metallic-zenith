import { getRecipes, getProducts } from '@/app/actions';
import styles from './page.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import RecipesClient from './RecipesClient';

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
          <h2>Gestión de Recetas</h2>
          <p>Define y edita la composición de tus productos terminados</p>
        </div>
      </header>

      <RecipesClient 
        recipes={recipes} 
        products={products} 
        isAdmin={isAdmin} 
      />
    </div>
  );
}
