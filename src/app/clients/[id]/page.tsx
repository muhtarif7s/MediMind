import PatientDetailClient from './PatientDetailClient';

/**
 * Server Component shell for the patient detail page.
 * Required for static export with dynamic routes.
 */
export function generateStaticParams() {
  return [];
}

export default function PatientDetailPage() {
  return <PatientDetailClient />;
}
