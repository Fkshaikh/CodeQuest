import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Coding Platform
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/problems" className="text-gray-700 hover:text-blue-600">
                    Problems
                  </Link>
                  <Link href="/submissions" className="text-gray-700 hover:text-blue-600">
                    My Submissions
                  </Link>
                  <div className="text-gray-700">
                    Welcome, {user.username}
                  </div>
                  <button 
                    onClick={logout}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
} 