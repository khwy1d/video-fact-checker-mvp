import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Trash2, Eye, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function History() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: analyses, isLoading, error } = trpc.analysis.listAnalyses.useQuery();

  const filteredAnalyses = (analyses || []).filter(
    (a) =>
      (a.videoTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.videoUrl || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Analysis History</h1>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by video title or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </Card>

        {error && (
          <Card className="p-6 border-0 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-300">Failed to load history</p>
          </Card>
        )}

        {filteredAnalyses.length > 0 ? (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="p-6 border-0 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{analysis.videoTitle || 'Untitled'}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 truncate">{analysis.videoUrl}</p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {analysis.claimsCount} claims analyzed
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-red-600 hover:text-red-700"
                      onClick={() => toast.info('Delete functionality coming soon')}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-0 bg-white dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {analyses && analyses.length === 0 ? 'No analyses yet' : 'No analyses found'}
            </p>
            <Button onClick={() => navigate('/')} variant="default">
              Start New Analysis
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
