'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setError('Credenciales inválidas');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <LogIn size={32} />
          </div>
          <h2>Bienvenido a WMS Pro</h2>
          <p>Ingrese sus credenciales para continuar</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.icon} />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.icon} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
