"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Users, UsersRound, FileText, LogOut, Building2 } from 'lucide-react';

export default function Home() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    employees: 0,
    teams: 0,
    logs: 0,
  });

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const [employeesRes, teamsRes, logsRes] = await Promise.all([
        fetch('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/teams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [employeesData, teamsData, logsData] = await Promise.all([
        employeesRes.json(),
        teamsRes.json(),
        logsRes.json(),
      ]);

      setStats({
        employees: employeesData.employees?.length || 0,
        teams: teamsData.teams?.length || 0,
        logs: logsData.logs?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  if (isLoading) {
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
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.organizationName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to HRMS Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your employees, teams, and view audit logs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.employees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active employees in organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.teams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active teams in organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.logs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total activity records
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/employees">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage employee records</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create, update, and delete employee information. View all employees in your organization.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/teams">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <UsersRound className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Teams</CardTitle>
                    <CardDescription>Manage team structure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create teams, assign employees, and manage team compositions across your organization.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/logs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>View activity history</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track all system activities including employee creation, updates, and team assignments.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">1.</span>
                <span><strong>Add Employees:</strong> Navigate to the Employees section to create employee records with name, email, and position.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">2.</span>
                <span><strong>Create Teams:</strong> Go to Teams to organize employees into functional groups.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">3.</span>
                <span><strong>Assign Members:</strong> Use the team assignment feature to add employees to teams.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[20px]">4.</span>
                <span><strong>Track Activity:</strong> View the Audit Logs to monitor all changes and activities.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}