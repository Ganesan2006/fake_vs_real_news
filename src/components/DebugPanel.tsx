import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bug, ChevronDown, ChevronUp, Copy, CheckCircle2, 
  XCircle, AlertCircle, Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

interface DebugPanelProps {
  logs: DebugLog[];
  onClear?: () => void;
}

export function DebugPanel({ logs, onClear }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLog, setSelectedLog] = useState<number | null>(null);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const copyAllLogs = () => {
    const logsText = logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`)
      .join('\n\n');
    copyToClipboard(logsText);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          className="shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Panel
          {logs.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {logs.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px]">
      <Card className="shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bug className="w-5 h-5" />
              Debug Panel
              <Badge variant="secondary">{logs.length} logs</Badge>
            </CardTitle>
            <div className="flex gap-2">
              {logs.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAllLogs}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                  >
                    Clear
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] px-4 pb-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bug className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No debug logs yet</p>
                <p className="text-xs mt-1">Logs will appear as you interact with the app</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      selectedLog === idx ? 'ring-2 ring-blue-500' : ''
                    } ${getLevelColor(log.level)}`}
                    onClick={() => setSelectedLog(selectedLog === idx ? null : idx)}
                  >
                    <div className="flex items-start gap-2">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs opacity-70">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                        {selectedLog === idx && log.data && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono overflow-auto">
                            <div className="flex items-center justify-between mb-1">
                              <span className="opacity-70">Data:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(JSON.stringify(log.data, null, 2));
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to use debug logging
export function useDebugLogger() {
  const [logs, setLogs] = useState<DebugLog[]>([]);

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    setLogs(prev => [...prev, log]);
    
    // Also log to console with appropriate method
    const consoleMethod = level === 'error' ? console.error : 
                         level === 'warning' ? console.warn : 
                         console.log;
    
    consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');
  };

  const info = (message: string, data?: any) => addLog('info', message, data);
  const success = (message: string, data?: any) => addLog('success', message, data);
  const warning = (message: string, data?: any) => addLog('warning', message, data);
  const error = (message: string, data?: any) => addLog('error', message, data);
  const clear = () => setLogs([]);

  return {
    logs,
    info,
    success,
    warning,
    error,
    clear
  };
}
