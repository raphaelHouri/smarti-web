import { IsAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import ClientApp from './ClientApp';

export default function AdminPage() {
  if (!IsAdmin()) {
    redirect('/');
  }

  return <ClientApp />;
}