import { StrictMode, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './contexts/AuthContext';
import { router } from './router';
import './index.css';

function App() {
  return (
    <AuthContextProvider>
      <Suspense fallback={<div>Carregando o IDrive...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthContextProvider>
  );
}

export default App;