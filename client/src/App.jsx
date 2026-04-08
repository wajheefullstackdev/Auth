import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/authSlice';
import AppRouter from './routes/routes.jsx';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
