'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/utils/api';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

// Import Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('react-monaco-editor'),
  { ssr: false }
);

export default function ProblemDetail() {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id && user) {
      fetchProblem();
    }
  }, [id, user, authLoading, router]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/api/problems/${id}`);
      setProblem(response.data);
      setCode(response.data.solutionTemplate);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch problem details');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    setError('');

    try {
      const response = await api.post('/api/submissions', {
        problemId: id,
        code,
        language,
      });
      
      setResult(response.data.submission);
      setSubmitting(false);
    } catch (err) {
      setError('Error submitting code: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  const getResultColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'Wrong Answer':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'Compilation Error':
      case 'Runtime Error':
        return 'bg-orange-100 border-orange-400 text-orange-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    automaticLayout: true,
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Problem not found
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <div className="mt-2 flex items-center">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {problem.difficulty}
              </span>
            </div>
          </div>
          
          <div className="p-6 border-b">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
              <p className="whitespace-pre-line">{problem.description}</p>
              
              {problem.constraints && (
                <>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Constraints</h3>
                  <p className="whitespace-pre-line">{problem.constraints}</p>
                </>
              )}
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Examples</h3>
              <p className="whitespace-pre-line">{problem.examples}</p>
            </div>
          </div>
          
          <div className="flex flex-col h-[calc(100vh-400px)]">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border rounded px-2 py-1"
                  disabled={submitting}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c++">C++</option>
                </select>
              </div>
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            
            <div className="h-[500px] border-b">
              <MonacoEditor
                language={language === 'c++' ? 'cpp' : language}
                theme="vs-light"
                value={code}
                options={editorOptions}
                onChange={setCode}
              />
            </div>
            
            {/* Results */}
            <div className="p-4 flex-grow overflow-auto">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {result && (
                <div className={`border px-4 py-3 rounded mb-4 ${getResultColor(result.status)}`}>
                  <div className="font-bold">{result.status}</div>
                  {result.executionTime && (
                    <div className="text-sm">Execution Time: {result.executionTime} ms</div>
                  )}
                  {result.errorMessage && (
                    <div className="mt-2 whitespace-pre-line text-sm font-mono">
                      {result.errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 