"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Log {
  id: number;
  userId: number | null;
  action: string;
  entityType: string;
  entityId: number | null;
  details: any;
  timestamp: string;
  organizationId: number;
  userEmail: string;
}

export default function LogsPage() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      case 'LOGIN':
        return 'outline';
      case 'ASSIGN':
      case 'UNASSIGN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.organizationName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">HRMS Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/employees">
                <Button variant="outline">Employees</Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline">Teams</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Audit Logs</CardTitle>
            </div>
            <Badge variant="secondary">{logs.length} entries</Badge>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm">{log.userEmail}</TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.entityType}</TableCell>
                        <TableCell className="text-sm">{log.entityId || '-'}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
