import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, History, Play } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [videoUrl, setVideoUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  const startAnalysisMutation = trpc.analysis.startAnalysis.useMutation({
    onSuccess: (data) => {
      toast.success("Analysis started! Redirecting...");
      setTimeout(() => {
        navigate(`/analysis/${data.analysisId}`);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start analysis");
    },
  });

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      const isYouTubeOrTikTok =
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("tiktok.com");
      setIsValidUrl(isYouTubeOrTikTok);
      return isYouTubeOrTikTok;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (url) validateUrl(url);
  };

  const handleAnalyze = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!isValidUrl) {
      toast.error("Please enter a valid YouTube or TikTok URL");
      return;
    }

    startAnalysisMutation.mutate({ videoUrl });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Video Fact-Checker</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <Button
                  onClick={() => navigate("/history")}
                  variant="outline"
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                  variant="ghost"
                >
                  {user?.name || "Account"}
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Button onClick={() => (window.location.href = getLoginUrl())}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Verify Video Claims Instantly
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Paste a YouTube or TikTok link and let our AI analyze the claims made in the video. Get instant verdicts backed by credible sources.
          </p>

          {/* Input Section */}
          <Card className="p-6 border-0 bg-white dark:bg-slate-800 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Paste YouTube or TikTok URL..."
                  value={videoUrl}
                  onChange={handleUrlChange}
                  disabled={!isAuthenticated || startAnalysisMutation.isPending}
                  className="h-12 pr-10"
                />
                {videoUrl && (
                  <div className="absolute right-3 top-3">
                    {isValidUrl ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!isAuthenticated || !isValidUrl || startAnalysisMutation.isPending}
                className="h-12 gap-2 px-6"
              >
                {startAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            {!isAuthenticated && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                Sign in to start analyzing videos
              </p>
            )}
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 border-0 bg-white dark:bg-slate-800">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Video Analysis
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Automatically extract claims from YouTube and TikTok videos using advanced AI.
            </p>
          </Card>

          <Card className="p-6 border-0 bg-white dark:bg-slate-800">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Fact Verification
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Cross-reference claims against reliable sources and get instant verdicts.
            </p>
          </Card>

          <Card className="p-6 border-0 bg-white dark:bg-slate-800">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Detailed Reports
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Get comprehensive reports with sources, explanations, and confidence scores.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            How It Works
          </h3>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Paste Video Link",
                description: "Share a YouTube or TikTok URL",
              },
              {
                step: 2,
                title: "AI Analysis",
                description: "Our AI extracts and analyzes claims from the video",
              },
              {
                step: 3,
                title: "Fact Checking",
                description: "Claims are verified against credible sources",
              },
              {
                step: 4,
                title: "Get Report",
                description: "Receive a detailed report with verdicts and sources",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 dark:bg-blue-500">
                    <span className="text-white font-semibold">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16">
        <div className="container py-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2026 Video Fact-Checker. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
