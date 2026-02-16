import { redirect } from 'next/navigation';

export default function NewMapPage() {
  redirect('/app?create=1');
}
