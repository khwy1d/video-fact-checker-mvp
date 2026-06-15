import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Source {
  url: string;
  title: string;
  snippet: string;
}

interface Claim {
  id: number;
  claimText: string;
  verdict: 'صحيح' | 'غير مدعوم' | 'مضلل';
  confidence: number;
  explanation: string;
  sources: Source[];
}

export default function Analysis() {
  const [, params] = useRoute('/analysis/:id');
  const [, navigate] = useLocation();
  const analysisId = params?.id ? parseInt(params.id) : null;

  const { data: analysis, isLoading, error } = trpc.analysis.getAnalysis.useQuery(
    { analysisId: analysisId || 0 },
    { enabled: !!analysisId }
  );

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'صحيح':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300';
      case 'غير مدعوم':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300';
      case 'مضلل':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-300';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'صحيح':
        return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'غير مدعوم':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'مضلل':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container py-8">
          <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Card className="p-8 border-0 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Error</h2>
                <p className="text-red-800 dark:text-red-400">{error?.message || 'Failed to load analysis'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container py-8">
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 mb-8 border-0 bg-white dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{analysis.videoTitle}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 truncate">{analysis.videoUrl}</p>

          {analysis.status === 'processing' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Spinner className="w-4 h-4" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Analysis in progress...</span>
            </div>
          )}

          {analysis.status === 'completed' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-emerald-800 dark:text-emerald-300">Analysis complete - {analysis.claims.length} claims found</span>
            </div>
          )}

          {analysis.status === 'failed' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-300">Analysis failed</span>
            </div>
          )}
        </Card>

        {analysis.claims && analysis.claims.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Claims Analysis</h2>
            {analysis.claims.map((claim: Claim) => (
              <Card key={claim.id} className="p-6 border-0 bg-white dark:bg-slate-800">
                <div className="flex items-start justify-between mb-4 gap-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">{claim.claimText}</h3>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap ${getVerdictColor(claim.verdict)}`}>
                    {getVerdictIcon(claim.verdict)}
                    <span className="font-semibold text-sm">{claim.verdict}</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">{claim.explanation}</p>

                <div className="flex items-center gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>Confidence:</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                      style={{ width: `${claim.confidence}%` }}
                    />
                  </div>
                  <span className="font-semibold">{claim.confidence}%</span>
                </div>

                {claim.sources && claim.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Sources</h4>
                    <ul className="space-y-2">
                      {claim.sources.map((source: Source, idx: number) => (
                        <li key={idx} className="text-sm">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 text-blue-600 dark:text-blue-400 hover:underline group"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1">
                              <div className="font-medium">{source.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{source.snippet}</div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {(!analysis.claims || analysis.claims.length === 0) && analysis.status === 'completed' && (
          <Card className="p-8 text-center border-0 bg-white dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">No claims found in this video.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
