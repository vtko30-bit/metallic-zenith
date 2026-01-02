'use client';

import { useState } from 'react';
import { addUser, deleteUser } from '@/app/actions';
import styles from './User.module.css';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface Props {
  initialUsers: any[];
}

export default function UserManagement({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const newUser = await addUser({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
      });
      setUsers([...users, newUser]);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert('Error al agregar usuario');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h2>Gestión de Usuarios</h2>
          <p>Administra quién tiene acceso al sistema y sus permisos</p>
        </div>
      </header>

      <section className={styles.formSection}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <UserPlus size={20} className={styles.icon} />
            <h3>Nuevo Usuario</h3>
          </div>
          <form onSubmit={handleAddUser} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Nombre Completo</label>
              <input type="text" id="name" name="name" required placeholder="Ej: Juan Pérez" />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" required placeholder="admin@empresa.com" />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" name="password" required placeholder="••••••••" />
            </div>
            <div className={styles.field}>
              <label htmlFor="role">Rol de Usuario</label>
              <select id="role" name="role" required className={styles.select}>
                <option value="STAFF">Staff (Operario)</option>
                <option value="ADMIN">Administrador (Control Total)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      </section>

      <section className={styles.listSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userNameCell}>
                    <div className={styles.avatar}>
                      <UserIcon size={16} />
                    </div>
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className={styles.deleteBtn}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
