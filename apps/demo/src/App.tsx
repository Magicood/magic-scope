import { Dashboard } from './dashboard/Dashboard';
import { useHashPath } from './lib/router';
import { Landing } from './marketing/Landing';

export function App() {
  const path = useHashPath();
  const inApp = path.startsWith('/app');

  return (
    <>
      <div className="v-aurora" aria-hidden="true" />
      <div className="v-app">{inApp ? <Dashboard path={path} /> : <Landing />}</div>
    </>
  );
}
