'use client';

interface AnalysisResult {
  strengths: string;
  weaknesses: string;
  missing_sections: string;
  resume_suggestions: string;
  github_tips: string;
}

interface ResultsPanelProps {
  results: AnalysisResult | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

  const sections = [
    { title: 'Strengths', content: results.strengths, color: 'green' },
    { title: 'Areas for Improvement', content: results.weaknesses, color: 'yellow' },
    { title: 'Missing Sections', content: results.missing_sections, color: 'blue' },
    { title: 'Resume Suggestions', content: results.resume_suggestions, color: 'purple' },
    { title: 'GitHub Tips', content: results.github_tips, color: 'indigo' },
  ];

  const colorClasses = {
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950',
    yellow: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950',
    indigo: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950',
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Analysis Results
      </h2>
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`p-6 rounded-lg border ${colorClasses[section.color as keyof typeof colorClasses]}`}
          >
            <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
              {section.title}
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
