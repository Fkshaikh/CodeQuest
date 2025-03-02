'use client';

import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('react-monaco-editor'),
  { ssr: false }
);

export default function SubmissionDetail() {
  const [submission, setSubmission] = useState(null);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
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
      fetchSubmission();
    }
  }, [id, user, authLoading, router]);

  const fetchSubmission = async () => {
    try {
      const response = await api.get(`/api/submissions/${id}`);
      setSubmission(response.data);
      
      // Fetch problem details
      const problemResponse = await api.get(`/api/problems/${response.data.problemId}`);
      setProblem(problemResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch submission details');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Wrong Answer':
        return 'bg-red-100 text-red-800';
      case 'Compilation Error':
      case 'Runtime Error':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const editorOptions = {
    readOnly: true,
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

  if (!submission) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Submission not found'}
          </div>
        </div>
      </Layout>
    );
  }

  const isWrongAnswer = submission.status === 'Wrong Answer';
  const isRuntimeError = submission.status === 'Runtime Error';
  const isCompilationError = submission.status === 'Compilation Error';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Submission Info */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
            <h1 className="text-2xl font-bold mb-4">Submission Details</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Submission ID</p>
                <p className="font-medium">{submission.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Problem</p>
                <p className="font-medium">{problem?.title || submission.problemId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-medium">{submission.language}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Submitted At</p>
                <p className="font-medium">{formatDate(submission.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </p>
              </div>
              
              {submission.executionTime && (
                <div>
                  <p className="text-sm text-gray-600">Execution Time</p>
                  <p className="font-medium">{submission.executionTime} ms</p>
                </div>
              )}
            </div>

            {isWrongAnswer && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Wrong Answer Details</h3>
                <div className={`${getStatusColor(submission.status)} p-3 rounded whitespace-pre-line font-mono text-sm`}>
                  Unfortunately, your submission produced an incorrect output. To improve, carefully review the problem description, your code logic, and consider the following:
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                    <li>Double-check your algorithm against the problem requirements.</li>
                    <li>Consider edge cases and boundary conditions.</li>
                    <li>Compare your output with the expected output for the test cases (if available below).</li>
                  </ul>
                  {submission.testCaseResults && submission.testCaseResults.some(result => !result.passed) && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-red-700 mb-1">Failed Test Cases (Example)</h4>
                      {submission.testCaseResults.filter(result => !result.passed).slice(0, 3).map((result, index) => (
                        <div key={index} className="mb-2 p-2 border border-gray-300 rounded-md bg-gray-50">
                          <p className="text-sm"><span className="font-semibold">Test Case Input:</span> {result.input || 'N/A'}</p>
                          <p className="text-sm"><span className="font-semibold">Expected Output:</span> {result.expectedOutput || 'N/A'}</p>
                          <p className="text-sm"><span className="font-semibold">Your Output:</span> {result.actualOutput || 'N/A'}</p>
                        </div>
                      ))}
                      {submission.testCaseResults.filter(result => !result.passed).length > 3 && (
                        <p className="text-sm text-gray-700 mt-1">...and {submission.testCaseResults.filter(result => !result.passed).length - 3} more failed test cases.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isRuntimeError && submission.errorMessage && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Runtime Error</h3>
                <div className={`${getStatusColor(submission.status)} p-3 rounded whitespace-pre-line font-mono text-sm`}>
                  Your code encountered a runtime error during execution. Review the error message below and debug your code.
                </div>
                <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-100 overflow-x-auto">
                  <pre className="text-sm font-mono text-red-800">{submission.errorMessage}</pre>
                </div>
              </div>
            )}

            {isCompilationError && submission.errorMessage && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Compilation Error</h3>
                <div className={`${getStatusColor(submission.status)} p-3 rounded whitespace-pre-line font-mono text-sm`}>
                  Your code failed to compile. Review the compilation error message below and fix syntax errors or other compilation issues.
                </div>
                <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-100 overflow-x-auto">
                  <pre className="text-sm font-mono text-red-800">{submission.errorMessage}</pre>
                </div>
              </div>
            )}

            {problem && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
                <p className="text-sm whitespace-pre-line">{problem.description}</p>
              </div>
            )}
          </div>

          {/* Code Viewer */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Submitted Code</h2>
            </div>
            <div className="h-[600px]">
              <MonacoEditor
                language={submission.language === 'c++' ? 'cpp' : submission.language}
                theme="vs-light"
                value={submission.code}
                options={editorOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 