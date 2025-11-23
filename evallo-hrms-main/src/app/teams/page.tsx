"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, X, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  memberCount: number;
  members: Employee[];
}

export default function TeamsPage() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchTeams();
      fetchEmployees();
    }
  }, [token]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Failed to load employees');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateOpen(false);
        setFormData({ name: '', description: '' });
        fetchTeams();
      }
    } catch (err) {
      setError('Failed to create team');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedEmployee) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: parseInt(selectedEmployee) }),
      });

      if (response.ok) {
        setIsAssignOpen(false);
        setSelectedEmployee('');
        fetchTeams();
      }
    } catch (err) {
      setError('Failed to assign employee');
    }
  };

  const handleUnassign = async (teamId: number, employeeId: number) => {
    if (!confirm('Are you sure you want to remove this employee from the team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/assign?employeeId=${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTeams();
      }
    } catch (err) {
      setError('Failed to unassign employee');
    }
  };

  const openAssignDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsAssignOpen(true);
  };

  const getAvailableEmployees = () => {
    if (!selectedTeam) return employees;
    const assignedIds = selectedTeam.members.map(m => m.id);
    return employees.filter(e => !assignedIds.includes(e.id));
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
              <Link href="/logs">
                <Button variant="outline">Logs</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Teams</h2>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team to your organization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">Create Team</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-gray-500">
                No teams found. Create your first team!
              </CardContent>
            </Card>
          ) : (
            teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{team.name}</span>
                    <Badge variant="secondary">{team.memberCount} members</Badge>
                  </CardTitle>
                  {team.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {team.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Team Members</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignDialog(team)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {team.members.length === 0 ? (
                        <p className="text-sm text-gray-500">No members assigned</p>
                      ) : (
                        team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.position}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnassign(team.id, member.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Employee to {selectedTeam?.name}</DialogTitle>
              <DialogDescription>
                Select an employee to add to this team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableEmployees().map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={!selectedEmployee}>
                Assign Employee
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
