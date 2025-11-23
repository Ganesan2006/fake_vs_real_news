import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Server,
  Brain,
  Youtube,
  Code,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface DiagnosticPanelProps {
  accessToken: string;
  onClose: () => void;
}

interface TestResult {
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: string;
}

interface DiagnosticResults {
  backendHealth: TestResult | null;
  contentGeneration: TestResult | null;
  youtubeVideos: TestResult | null;
  cacheTest: TestResult | null;
}

export function DiagnosticPanel({ accessToken, onClose }: DiagnosticPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResults>({
    backendHealth: null,
    contentGeneration: null,
    youtubeVideos: null,
    cacheTest: null
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Diagnostic] ${message}`);
  };

  const updateResult = (key: keyof DiagnosticResults, result: TestResult) => {
    setResults(prev => ({ ...prev, [key]: result }));
  };

  const testBackendHealth = async (): Promise<boolean> => {
    addLog('Testing backend health...');
    try {
      const projectId = 'wfibplpezqwcaomwmpxp'; // From your setup
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-2ba89cfc/health`;
      
      const response = await fetch(healthUrl);
      const data = await response.json();
      
      if (response.ok) {
        updateResult('backendHealth', {
          status: 'success',
          message: 'Backend is healthy and responding',
          details: data,
          timestamp: new Date().toISOString()
        });
        addLog('✓ Backend health check passed');
        return true;
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      updateResult('backendHealth', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Backend is not accessible',
        details: error,
        timestamp: new Date().toISOString()
      });
      addLog('✗ Backend health check failed: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  };

  const testContentGeneration = async (): Promise<any> => {
    addLog('Testing AI content generation...');
    try {
      const testRequest = {
        moduleId: 'test-module-diagnostic',
        moduleTitle: 'Diagnostic Test Module',
        topic: 'React Hooks',
        difficulty: 'beginner',
        targetGoal: 'Full-Stack Developer'
      };
      
      addLog(`Request: ${JSON.stringify(testRequest, null, 2)}`);
      
      const data = await api.generateTopicContent(testRequest, accessToken);
      
      setRawResponse(data);
      addLog(`Response received: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
      
      if (data.content) {
        const content = data.content;
        const issues = [];
        
        // Validate content structure
        if (!content.explanation) issues.push('Missing explanation');
        if (!content.keyPoints || content.keyPoints.length === 0) issues.push('Missing key points');
        if (!content.youtubeVideos || content.youtubeVideos.length === 0) issues.push('Missing YouTube videos');
        
        if (issues.length > 0) {
          updateResult('contentGeneration', {
            status: 'warning',
            message: `Content generated with issues: ${issues.join(', ')}`,
            details: { content, issues },
            timestamp: new Date().toISOString()
          });
          addLog('⚠ Content generation completed with warnings');
        } else {
          updateResult('contentGeneration', {
            status: 'success',
            message: 'Content generated successfully with all fields',
            details: {
              explanationLength: content.explanation?.length || 0,
              keyPointsCount: content.keyPoints?.length || 0,
              applicationsCount: content.applications?.length || 0,
              youtubeVideosCount: content.youtubeVideos?.length || 0
            },
            timestamp: new Date().toISOString()
          });
          addLog('✓ Content generation successful');
        }
        
        return content;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No content in response');
      }
    } catch (error) {
      updateResult('contentGeneration', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Content generation failed',
        details: error,
        timestamp: new Date().toISOString()
      });
      addLog('✗ Content generation failed: ' + (error instanceof Error ? error.message : String(error)));
      return null;
    }
  };

  const testYouTubeVideos = (content: any): void => {
    addLog('Analyzing YouTube video recommendations...');
    
    if (!content || !content.youtubeVideos) {
      updateResult('youtubeVideos', {
        status: 'error',
        message: 'No YouTube videos found in content',
        timestamp: new Date().toISOString()
      });
      addLog('✗ No YouTube videos in content');
      return;
    }
    
    const videos = content.youtubeVideos;
    addLog(`Found ${videos.length} video recommendations`);
    
    const analysis = {
      totalVideos: videos.length,
      hasSearchUrls: videos.every((v: any) => v.searchUrl),
      hasEmbedQueries: videos.every((v: any) => v.embedQuery),
      hasTitles: videos.every((v: any) => v.title),
      sampleVideo: videos[0],
      allVideos: videos
    };
    
    addLog('Video structure analysis:');
    addLog(`  - Total videos: ${analysis.totalVideos}`);
    addLog(`  - Has search URLs: ${analysis.hasSearchUrls}`);
    addLog(`  - Has embed queries: ${analysis.hasEmbedQueries}`);
    addLog(`  - Has titles: ${analysis.hasTitles}`);
    
    // Check if titles are just search queries (the problem)
    const titlesAreQueries = videos.every((v: any) => 
      v.title === v.embedQuery || v.title.toLowerCase().includes('tutorial') || v.title.toLowerCase().includes('explained')
    );
    
    if (titlesAreQueries) {
      updateResult('youtubeVideos', {
        status: 'warning',
        message: 'Videos are using search queries as titles (not actual video titles)',
        details: analysis,
        timestamp: new Date().toISOString()
      });
      addLog('⚠ Issue detected: Video titles are search queries, not actual video titles');
      addLog('  This is why users see "React Hooks tutorial" instead of real video names');
    } else {
      updateResult('youtubeVideos', {
        status: 'success',
        message: 'YouTube video recommendations are properly formatted',
        details: analysis,
        timestamp: new Date().toISOString()
      });
      addLog('✓ YouTube videos are properly formatted');
    }
  };

  const testCaching = async (): Promise<void> => {
    addLog('Testing cache system...');
    try {
      const testTopic = 'React Hooks';
      const testModuleId = 'test-module-diagnostic';
      
      // Try to get cached content
      const cached = await api.getTopicContent(testModuleId, testTopic, accessToken);
      
      if (cached.content) {
        updateResult('cacheTest', {
          status: 'success',
          message: 'Cache system working - content was cached from previous test',
          details: {
            contentKey: `topic-content:${testModuleId}:${testTopic}`,
            generatedAt: cached.content.generatedAt
          },
          timestamp: new Date().toISOString()
        });
        addLog('✓ Cache system is working');
      } else {
        updateResult('cacheTest', {
          status: 'warning',
          message: 'No cached content found (this is normal for first run)',
          timestamp: new Date().toISOString()
        });
        addLog('⚠ No cached content (expected for first run)');
      }
    } catch (error) {
      updateResult('cacheTest', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Cache test failed',
        details: error,
        timestamp: new Date().toISOString()
      });
      addLog('✗ Cache test failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setRawResponse(null);
    
    // Reset results
    setResults({
      backendHealth: { status: 'pending', message: 'Running...', timestamp: new Date().toISOString() },
      contentGeneration: { status: 'pending', message: 'Waiting...', timestamp: new Date().toISOString() },
      youtubeVideos: { status: 'pending', message: 'Waiting...', timestamp: new Date().toISOString() },
      cacheTest: { status: 'pending', message: 'Waiting...', timestamp: new Date().toISOString() }
    });
    
    addLog('=== STARTING DIAGNOSTIC TESTS ===');
    
    try {
      // Test 1: Backend Health
      const healthOk = await testBackendHealth();
      
      if (!healthOk) {
        addLog('Backend health check failed. Stopping tests.');
        toast.error('Backend is not accessible. Please check deployment.');
        setIsRunning(false);
        return;
      }
      
      // Test 2: Content Generation
      const content = await testContentGeneration();
      
      // Test 3: YouTube Videos Analysis
      if (content) {
        testYouTubeVideos(content);
      }
      
      // Test 4: Caching
      await testCaching();
      
      addLog('=== ALL TESTS COMPLETED ===');
      toast.success('Diagnostic tests completed');
      
    } catch (error) {
      addLog('=== TESTS FAILED ===');
      addLog('Error: ' + (error instanceof Error ? error.message : String(error)));
      toast.error('Diagnostic tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'pending': return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<TestResult['status'], string> = {
      success: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const renderTestResult = (title: string, icon: React.ReactNode, result: TestResult | null) => {
    if (!result) return null;
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            {getStatusBadge(result.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <p className="text-sm">{result.message}</p>
              {result.details && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Tested at: {new Date(result.timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>System Diagnostics</CardTitle>
                <CardDescription>
                  Test AI content generation and video recommendations
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="results" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
              <TabsTrigger value="raw">Raw Response</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="flex-1 overflow-auto px-6 pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Run comprehensive tests to verify the system is working correctly
                  </p>
                  <Button 
                    onClick={runAllTests} 
                    disabled={isRunning}
                    size="sm"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Run All Tests
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {renderTestResult(
                    'Backend Health',
                    <Server className="w-5 h-5 text-blue-600" />,
                    results.backendHealth
                  )}
                  
                  {renderTestResult(
                    'AI Content Generation',
                    <Brain className="w-5 h-5 text-purple-600" />,
                    results.contentGeneration
                  )}
                  
                  {renderTestResult(
                    'YouTube Video Recommendations',
                    <Youtube className="w-5 h-5 text-red-600" />,
                    results.youtubeVideos
                  )}
                  
                  {renderTestResult(
                    'Cache System',
                    <Code className="w-5 h-5 text-green-600" />,
                    results.cacheTest
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="flex-1 overflow-hidden px-6 pb-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Execution Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {logs.length === 0 ? (
                      <p className="text-sm text-gray-500">No logs yet. Run tests to see logs.</p>
                    ) : (
                      <div className="space-y-1 font-mono text-xs">
                        {logs.map((log, idx) => (
                          <div 
                            key={idx} 
                            className={`p-1 rounded ${
                              log.includes('✓') ? 'text-green-600' :
                              log.includes('✗') ? 'text-red-600' :
                              log.includes('⚠') ? 'text-yellow-600' :
                              'text-gray-700'
                            }`}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="raw" className="flex-1 overflow-hidden px-6 pb-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Raw API Response
                  </CardTitle>
                  <CardDescription>
                    The complete response from the AI content generation API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {rawResponse ? (
                      <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                        {JSON.stringify(rawResponse, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No response yet. Run tests to see the raw API response.
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
