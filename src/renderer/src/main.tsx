import '@renderer/main.css';
import '@fontsource/nunito';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@renderer/App';
import { HashRouter } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
