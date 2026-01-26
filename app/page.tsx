'use client';

import { useState } from 'react';
import UploadBox from '../components/UploadBox';
import ResultsPanel from '../components/ResultsPanel';

interface AnalysisResult {
  strengths: string;
  weaknesses: string;
  missing_sections: string;
  resume_suggestions: string;
  github_tips: string;
}

export default function Home() {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File, githubUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('githubUrl', githubUrl);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing your resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            AI Resume & GitHub Analyzer
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Get personalized feedback on your resume and GitHub profile
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-1/2">
            <UploadBox onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>

          <div className="w-full lg:w-1/2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
            <ResultsPanel results={results} />
          </div>
        </div>
      </main>
    </div>
  );
}
