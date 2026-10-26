import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Rutas from './components/Rutas';

function Layout() {
  const location = useLocation();

  const noSidebar = ['/login'];
  const shouldHideSidebar = noSidebar.includes(location.pathname);

  if (shouldHideSidebar) {
    return <Rutas />;
  }

  return (
    <Sidebar>
      <Rutas />
    </Sidebar>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}