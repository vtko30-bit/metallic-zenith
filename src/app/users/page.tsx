import { getUsers } from '@/app/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import UserManagement from '@/components/User/UserManagement';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  const users = await getUsers();

  return (
    <div>
      <UserManagement initialUsers={users} />
    </div>
  );
}
