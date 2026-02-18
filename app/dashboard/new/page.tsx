import { redirect } from 'next/navigation';

export default function NewMapPage() {
  redirect('/dashboard?create=1');
}
