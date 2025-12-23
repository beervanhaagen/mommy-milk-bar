import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root /admin to /admin/dashboard
  redirect('/dashboard');
}
