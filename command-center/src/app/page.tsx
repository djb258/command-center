/**
 * 🔒 COMMAND CENTER DASHBOARD - BARTON DOCTRINE COMPLIANT
 * 
 * Main dashboard with commands, tasks, and projects management
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Command, 
  Task, 
  Project, 
  Plus, 
  Settings, 
  BarChart3, 
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

interface CommandItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

interface TaskItem {
  id: string;
  command_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  command_name?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'commands' | 'tasks' | 'projects'>('commands');
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data with Barton Doctrine validation
      const [commandsRes, tasksRes, projectsRes] = await Promise.all([
        fetch('/api/commands'),
        fetch('/api/tasks'),
        fetch('/api/projects')
      ]);

      if (commandsRes.ok) {
        const commandsData = await commandsRes.json();
        setCommands(commandsData.data || []);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'archived':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
      case 'on_hold':
        return <Clock className="w-4 h-4" />;
      case 'pending':
      case 'planning':
        return <AlertCircle className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Command className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Command Center</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <BarChart3 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Command className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commands</p>
                <p className="text-2xl font-bold text-gray-900">{commands.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Task className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Project className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(tasks.map(t => t.assigned_to).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('commands')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'commands'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Commands ({commands.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projects ({projects.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Commands Tab */}
            {activeTab === 'commands' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Commands</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Command
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {commands.map((command) => (
                    <div key={command.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{command.name}</h3>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(command.status)}`}>
                            {getStatusIcon(command.status)}
                            <span className="ml-1">{command.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(command.priority)}`}>
                            {command.priority}
                          </span>
                        </div>
                      </div>
                      
                      {command.description && (
                        <p className="text-gray-600 mb-4">{command.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{command.category}</span>
                        <span>{new Date(command.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                            <div className="flex space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusIcon(task.status)}
                                <span className="ml-1">{task.status}</span>
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {task.command_name && (
                              <span>Command: {task.command_name}</span>
                            )}
                            {task.assigned_to && (
                              <span>Assigned: {task.assigned_to}</span>
                            )}
                            {task.due_date && (
                              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Projects</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 mb-4">{project.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {project.start_date && (
                            <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                          )}
                          {project.end_date && (
                            <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Management</h3>
            <p className="text-gray-600 mb-4">Create, track, and manage your projects with full CRUD operations.</p>
            <Link href="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              Manage Projects →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Task Management</h3>
            <p className="text-gray-600 mb-4">Organize tasks, set priorities, and track progress efficiently.</p>
            <Link href="/tasks" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              Manage Tasks →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Command Center</h3>
            <p className="text-gray-600 mb-4">Execute commands and manage system operations centrally.</p>
            <Link href="/commands" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              View Commands →
            </Link>
          </div>
        </div>

        {/* New Feature Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg border border-purple-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 New Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Barton Doctrine Compliance</h3>
              <p className="text-gray-600 mb-3">Built-in validation and enforcement of coding standards and best practices.</p>
              <div className="flex items-center text-sm text-purple-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active & Enforced
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Real-time Validation</h3>
              <p className="text-gray-600 mb-3">Automatic validation of all operations with detailed error reporting.</p>
              <div className="flex items-center text-sm text-purple-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Live Monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium text-blue-800">New Project</div>
            </button>
            <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-medium text-green-800">Add Task</div>
            </button>
            <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium text-purple-800">Run Command</div>
            </button>
            <button className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-orange-800">View Reports</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
