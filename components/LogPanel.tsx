
import React, { useState, useEffect, useRef } from 'react';

// Global log storage
interface LogEntry {
    timestamp: string;
    level: 'info' | 'success' | 'warning' | 'error';
    source: string;
    message: string;
    data?: any;
}

const logs: LogEntry[] = [];
const listeners: Set<() => void> = new Set();

// Logger utility
export const AppLogger = {
    _addLog(level: LogEntry['level'], source: string, message: string, data?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            level,
            source,
            message,
            data
        };
        logs.push(entry);
        if (logs.length > 200) logs.shift(); // Keep max 200 logs
        listeners.forEach(fn => fn());
    },

    info: (source: string, message: string, data?: any) => AppLogger._addLog('info', source, message, data),
    success: (source: string, message: string, data?: any) => AppLogger._addLog('success', source, message, data),
    warning: (source: string, message: string, data?: any) => AppLogger._addLog('warning', source, message, data),
    error: (source: string, message: string, data?: any) => AppLogger._addLog('error', source, message, data),

    getLogs: () => [...logs],
    clear: () => { logs.length = 0; listeners.forEach(fn => fn()); },
    subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); }
};

// Log Panel Component
export const LogPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [, forceUpdate] = useState(0);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return AppLogger.subscribe(() => forceUpdate(n => n + 1));
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs.length]);

    if (!isOpen) return null;

    const currentLogs = AppLogger.getLogs();

    const levelColors = {
        info: 'text-blue-400',
        success: 'text-green-400',
        warning: 'text-yellow-400',
        error: 'text-red-400'
    };

    const levelIcons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 shadow-2xl border-t border-gray-700" style={{ height: '300px' }}>
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">📋 App Logs</span>
                    <span className="text-gray-400 text-sm">({currentLogs.length} entries)</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => AppLogger.clear()}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => {
                            const content = currentLogs.map(l =>
                                `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}${l.data ? '\n  Data: ' + JSON.stringify(l.data) : ''}`
                            ).join('\n');
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `magictales-logs-${Date.now()}.txt`;
                            a.click();
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                    >
                        Download
                    </button>
                    <button onClick={onClose} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm">
                        Close
                    </button>
                </div>
            </div>
            <div className="overflow-y-auto p-2 font-mono text-xs" style={{ height: 'calc(100% - 50px)' }}>
                {currentLogs.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No logs yet. Generate a story to see logs.</div>
                ) : (
                    currentLogs.map((log, i) => (
                        <div key={i} className={`py-1 border-b border-gray-800 ${levelColors[log.level]}`}>
                            <span className="text-gray-500">[{log.timestamp}]</span>
                            <span className="ml-2">{levelIcons[log.level]}</span>
                            <span className="ml-2 text-purple-400">[{log.source}]</span>
                            <span className="ml-2">{log.message}</span>
                            {log.data && (
                                <span className="ml-2 text-gray-500">{typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}</span>
                            )}
                        </div>
                    ))
                )}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};

// Log Toggle Button Component
export const LogToggleButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-4 right-4 z-40 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 flex items-center gap-2"
    >
        📋 Logs
    </button>
);
