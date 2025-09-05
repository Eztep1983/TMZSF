'use client'
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas que no requieren autenticación
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        // Usuario no autenticado intentando acceder a ruta protegida
        router.push('/login');
      } else if (user && isPublicRoute) {
        // Usuario autenticado en página de login
        router.push('/');
      }
    }
  }, [user, loading, isPublicRoute, router, pathname]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // No mostrar contenido si el usuario no debería estar en esta ruta
  if (!user && !isPublicRoute) {
    return null;
  }

  if (user && isPublicRoute) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;