import { IsAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import ClientApp from './ClientApp';

export default async function AdminPage() {
  if (!(await IsAdmin())) {
    redirect('/');
  }

  return <ClientApp />;
}