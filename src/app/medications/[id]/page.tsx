import MedicationDetailClient from './MedicationDetailClient';

/**
 * Server Component shell for the medication detail page.
 * Required for static export with dynamic routes.
 */
export function generateStaticParams() {
  return [];
}

export default function MedicationDetailPage() {
  return <MedicationDetailClient />;
}
