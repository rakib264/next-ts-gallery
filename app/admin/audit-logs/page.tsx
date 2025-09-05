'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastWithTypes } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    Download,
    Edit,
    Eye,
    Plus,
    Shield,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AuditLog {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  resource: string;
  resourceId: string;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
    user: '',
    dateRange: '7d'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);
  const { showDeleteConfirmation, DeleteConfirmationComponent } = useDeleteConfirmationDialog();
  const { success, error: showError } = useToastWithTypes();

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setFilters(prev => ({ ...prev, user: query }));
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedLogs.length === 0) return;
    
    showDeleteConfirmation({
      title: 'Delete Audit Logs',
      description: `Are you sure you want to delete ${selectedLogs.length} audit log(s)? This action cannot be undone and will permanently remove these records from the system.`,
      entityName: 'audit log',
      entityCount: selectedLogs.length,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/admin/audit-logs', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              logIds: selectedLogs.map(log => log._id)
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setSelectedLogs([]);
            fetchAuditLogs(); // Refresh the list
            success(
              'Audit logs deleted successfully',
              `${data.deletedCount} audit log(s) have been permanently removed.`,
              5000
            );
          } else {
            console.error('Failed to delete audit logs:', data.error);
            showError(
              'Failed to delete audit logs',
              data.error || 'An unexpected error occurred while deleting the audit logs.',
              7000
            );
            throw new Error(data.error || 'Failed to delete audit logs');
          }
        } catch (error) {
          console.error('Error deleting audit logs:', error);
          showError(
            'Delete operation failed',
            'An error occurred while deleting the audit logs. Please try again.',
            7000
          );
          throw error;
        }
      }
    });
  };

  const handleViewLog = (log: AuditLog) => {
    setViewingLog(log);
  };

  const handleExportSelected = () => {
    if (selectedLogs.length === 0) return;
    
    try {
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Changes'],
        ...selectedLogs.map(log => [
          new Date(log.createdAt).toLocaleString(),
          log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User',
          log.action,
          log.resource,
          log.resourceId,
          log.ipAddress || '-',
          log.changes?.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join('; ') || 'No changes'
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      success(
        'Export completed successfully',
        `${selectedLogs.length} audit log(s) have been exported to CSV.`,
        4000
      );
    } catch (error) {
      console.error('Export error:', error);
      showError(
        'Export failed',
        'An error occurred while exporting the audit logs. Please try again.',
        5000
      );
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <Plus size={14} className="text-green-600" />;
      case 'update': return <Edit size={14} className="text-blue-600" />;
      case 'delete': return <Trash2 size={14} className="text-red-600" />;
      case 'view': return <Eye size={14} className="text-gray-600" />;
      case 'bulk_delete': return <Trash2 size={14} className="text-red-700" />;
      default: return <AlertTriangle size={14} className="text-yellow-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      case 'bulk_delete': return 'bg-red-200 text-red-900';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRiskLevel = (action: string, resource: string) => {
    if (action === 'DELETE' || action === 'BULK_DELETE') return 'high';
    if (action === 'UPDATE' && ['User', 'Order', 'Product'].includes(resource)) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="text-sm font-medium">
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (value: any) => (
        value ? (
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${value.firstName} ${value.lastName}`} />
              <AvatarFallback className="text-xs">
                {value.firstName?.charAt(0) || '?'}{value.lastName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {value.firstName} {value.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{value.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">??</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-500">Unknown User</p>
              <p className="text-xs text-gray-400">-</p>
            </div>
          </div>
        )
      )
    },
    {
      key: 'action',
      label: 'Action',
      filterable: true,
      render: (value: string, row: AuditLog) => (
        <div className="flex items-center space-x-2">
          <Badge className={`${getActionColor(value)} flex items-center space-x-1`}>
            {getActionIcon(value)}
            <span className="capitalize">{value}</span>
          </Badge>
          <Badge className={getRiskColor(getRiskLevel(value, row.resource))}>
            {getRiskLevel(value, row.resource)}
          </Badge>
        </div>
      )
    },
    {
      key: 'resource',
      label: 'Resource',
      filterable: true,
      render: (value: string, row: AuditLog) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500 font-mono">{row.resourceId}</p>
        </div>
      )
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (value: any[]) => (
        value && value.length > 0 ? (
          <div className="space-y-1">
            {value.slice(0, 2).map((change, index) => (
              <div key={index} className="text-xs">
                <span className="font-medium">{change.field}:</span>
                <span className="text-red-600 line-through ml-1">
                  {String(change.oldValue).substring(0, 20)}
                </span>
                <span className="text-green-600 ml-1">
                  {String(change.newValue).substring(0, 20)}
                </span>
              </div>
            ))}
            {value.length > 2 && (
              <p className="text-xs text-gray-500">+{value.length - 2} more</p>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No changes</span>
        )
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value: string) => (
        value ? (
          <span className="font-mono text-sm">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },

  ];

  const filterOptions = [
    {
      key: 'action',
      label: 'Action',
      options: [
        { label: 'Create', value: 'CREATE' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' },
        { label: 'View', value: 'VIEW' },
        { label: 'Bulk Delete', value: 'BULK_DELETE' }
      ]
    },
    {
      key: 'resource',
      label: 'Resource',
      options: [
        { label: 'Product', value: 'Product' },
        { label: 'Order', value: 'Order' },
        { label: 'User', value: 'User' },
        { label: 'Category', value: 'Category' },
        { label: 'Coupon', value: 'Coupon' },
        { label: 'Courier', value: 'Courier' }
      ]
    }
  ];

  // Calculate stats
  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date();
      const logDate = new Date(log.createdAt);
      return logDate.toDateString() === today.toDateString();
    }).length,
    highRisk: logs.filter(log => getRiskLevel(log.action, log.resource) === 'high').length,
    uniqueUsers: new Set(logs.filter(log => log.user).map(log => log.user._id)).size
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">
              Track all administrative actions and system changes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Actions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Actions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="text-green-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk Actions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.highRisk}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.uniqueUsers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <User className="text-purple-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Trail</CardTitle>
              {selectedLogs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedLogs.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                    className="flex items-center space-x-1"
                  >
                    <Download size={14} />
                    <span>Export Selected</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 size={14} />
                    <span>Delete Selected</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={logs}
              columns={columns}
              filters={filterOptions}
              exportable
              searchable
              selectable
              pagination
              pageSize={10}
              onSelectionChange={setSelectedLogs}
              onView={handleViewLog}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationComponent />

        {/* View Log Dialog */}
        {viewingLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Audit Log Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingLog(null)}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-sm">{new Date(viewingLog.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action</label>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getActionColor(viewingLog.action)} flex items-center space-x-1`}>
                        {getActionIcon(viewingLog.action)}
                        <span className="capitalize">{viewingLog.action}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resource</label>
                    <p className="text-sm">{viewingLog.resource}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resource ID</label>
                    <p className="text-sm font-mono">{viewingLog.resourceId}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  {viewingLog.user ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${viewingLog.user.firstName} ${viewingLog.user.lastName}`} />
                        <AvatarFallback className="text-xs">
                          {viewingLog.user.firstName?.charAt(0) || '?'}{viewingLog.user.lastName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {viewingLog.user.firstName} {viewingLog.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{viewingLog.user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{viewingLog.user.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Unknown User</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                  <p className="text-sm font-mono">{viewingLog.ipAddress || 'Not available'}</p>
                </div>

                {viewingLog.changes && viewingLog.changes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Changes</label>
                    <div className="mt-2 space-y-2">
                      {viewingLog.changes.map((change, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">{change.field}</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-red-600">
                              <span className="font-medium">From:</span> {String(change.oldValue)}
                            </p>
                            <p className="text-xs text-green-600">
                              <span className="font-medium">To:</span> {String(change.newValue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingLog.metadata && Object.keys(viewingLog.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Metadata</label>
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg mt-1 overflow-x-auto">
                      {JSON.stringify(viewingLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setViewingLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}