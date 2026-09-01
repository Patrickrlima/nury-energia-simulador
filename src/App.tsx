import { Outlet, Route, Routes } from 'react-router-dom';
import { AudienceProvider, type Audiencia } from './context/AudienceContext';
import { Home } from './pages/Home';
import { Simulator } from './pages/Simulator';
import { Result } from './pages/Result';
import { HistoryPage } from './pages/History';

/** Envolve um grupo de rotas com a audiência correta (vendedor interno vs. site público). */
function AudienceLayout({ audiencia }: { audiencia: Audiencia }) {
  return (
    <AudienceProvider audiencia={audiencia}>
      <Outlet />
    </AudienceProvider>
  );
}

function App() {
  return (
    <Routes>
      {/* App interno do vendedor */}
      <Route element={<AudienceLayout audiencia="vendedor" />}>
        <Route path="/" element={<Home />} />
        <Route path="/simulador" element={<Simulator />} />
        <Route path="/resultado" element={<Result />} />
        <Route path="/simulacoes" element={<HistoryPage />} />
      </Route>

      {/* Versão pública, para linkar/embutir no site institucional (nuryenergia.com.br) */}
      <Route path="/simule" element={<AudienceLayout audiencia="site" />}>
        <Route index element={<Home />} />
        <Route path="simulador" element={<Simulator />} />
        <Route path="resultado" element={<Result />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
