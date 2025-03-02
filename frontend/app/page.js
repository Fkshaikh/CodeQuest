'use client';

import { useEffect } from 'react';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Coding Platform</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="mb-4">
            Practice your coding skills by solving problems of varying difficulty levels.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => router.push('/problems')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse Problems
            </button>
            <button 
              onClick={() => router.push('/submissions')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              My Submissions
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 