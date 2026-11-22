import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '80px 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Page non trouvée</h1>
      <p style={{ margin: '16px 0' }}>La page demandée n’existe pas.</p>
      <Link href="/" style={{ color: '#092b43', fontWeight: 'bold' }}>
        ← Revenir au Forum
      </Link>
    </main>
  );
}
