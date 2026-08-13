import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { TestimonialAdmin } from './testimonial-admin';

export default async function TestimonialsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'testimonials.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage testimonials.</p>;
  }
  const items = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Testimonials</h1>
      <TestimonialAdmin items={items} />
    </div>
  );
}
