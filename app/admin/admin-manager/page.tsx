'use client';

import { AdminCreateModal } from '@/components/admin/AdminCreateModal';
import { AdminDetailsModal } from '@/components/admin/AdminDetailsModal';
import { AdminEditModal } from '@/components/admin/AdminEditModal';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminManagerTable } from '@/components/admin/AdminManagerTable';
import ActionConfirmationDialog from '@/components/ui/action-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { AdminUser, useAdminManager } from '@/hooks/use-admin-manager';
import { Download, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

export default function AdminManagerPage() {
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionDialogConfig, setActionDialogConfig] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    action: () => Promise<void>;
    tone: 'primary' | 'success' | 'warning' | 'info';
  } | null>(null);
  
  const { showDeleteConfirmation, DeleteConfirmationComponent } = useDeleteConfirmationDialog();
  
  const {
    loading,
    admins,
    pagination,
    filters,
    pendingFilters,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    bulkAction,
    exportAdmins,
    updateFilters,
    applyFilters,
    resetFilters,
    changePage,
    changeItemsPerPage,
  } = useAdminManager();

  // Handle filter changes
  const handleSearchChange = (query: string) => {
    updateFilters({ search: query });
  };

  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    updateFilters({ status });
  };

  const handleRoleFilterChange = (role: 'all' | 'admin' | 'manager') => {
    updateFilters({ role });
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  const handleViewAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDetailsModal(true);
  };

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;
    
    showDeleteConfirmation({
      title: 'Delete Admin',
      description: `Are you sure you want to delete ${admin.name}? This action cannot be undone.`,
      entityName: 'admin',
      entityCount: 1,
      onConfirm: async () => {
        await deleteAdmin(adminId);
      }
    });
  };

  const handleBulkDelete = async () => {
    showDeleteConfirmation({
      title: 'Delete Selected Admins',
      description: `Are you sure you want to delete ${selectedAdmins.length} admin${selectedAdmins.length > 1 ? 's' : ''}? This action cannot be undone.`,
      entityName: 'admin',
      entityCount: selectedAdmins.length,
      onConfirm: async () => {
        await bulkAction('delete', selectedAdmins);
        setSelectedAdmins([]);
      }
    });
  };

  const handleBulkActivate = async () => {
    setActionDialogConfig({
      title: 'Activate Selected Admins',
      description: `Are you sure you want to activate ${selectedAdmins.length} admin${selectedAdmins.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Activate',
      tone: 'success',
      action: async () => {
        await bulkAction('activate', selectedAdmins);
        setSelectedAdmins([]);
      }
    });
    setShowActionDialog(true);
  };

  const handleBulkDeactivate = async () => {
    setActionDialogConfig({
      title: 'Deactivate Selected Admins',
      description: `Are you sure you want to deactivate ${selectedAdmins.length} admin${selectedAdmins.length > 1 ? 's' : ''}?`,
      confirmLabel: 'Deactivate',
      tone: 'warning',
      action: async () => {
        await bulkAction('deactivate', selectedAdmins);
        setSelectedAdmins([]);
      }
    });
    setShowActionDialog(true);
  };

  const handleExportSelected = async () => {
    await exportAdmins(selectedAdmins);
  };

  const handleCreateAdmin = async (newAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'manager';
    password: string;
    isActive: boolean;
  }) => {
    const result = await createAdmin(newAdmin);
    
    if (result) {
      setShowCreateModal(false);
    }
  };

  const handleUpdateAdmin = async (updatedAdmin: AdminUser) => {
    const result = await updateAdmin(updatedAdmin.id, updatedAdmin);
    if (result) {
      setShowEditModal(false);
      setSelectedAdmin(null);
    }
  };

  if (loading && admins.length === 0) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Manager</h1>
            <p className="text-gray-600 mt-1">Manage administrators and managers</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Admin/Manager
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedAdmins.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedAdmins.length} admin{selectedAdmins.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  className="text-orange-700 border-orange-300 hover:bg-orange-50"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <AdminManagerTable
          admins={admins}
          selectedAdmins={selectedAdmins}
          onSelectionChange={setSelectedAdmins}
          onViewAdmin={handleViewAdmin}
          onEditAdmin={handleEditAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          searchQuery={filters.search}
          onSearchChange={handleSearchChange}
          statusFilter={pendingFilters.status}
          onStatusFilterChange={handleStatusFilterChange}
          roleFilter={pendingFilters.role}
          onRoleFilterChange={handleRoleFilterChange}
          loading={loading}
          pagination={pagination}
          onPageChange={changePage}
          onItemsPerPageChange={changeItemsPerPage}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Modals */}
        <AdminCreateModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreateAdmin={handleCreateAdmin}
        />

        <AdminDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          admin={selectedAdmin}
        />

        <AdminEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          admin={selectedAdmin}
          onUpdateAdmin={handleUpdateAdmin}
        />

        {/* Confirmation Dialogs */}
        <DeleteConfirmationComponent />
        
        {actionDialogConfig && (
          <ActionConfirmationDialog
            open={showActionDialog}
            onOpenChange={setShowActionDialog}
            onConfirm={async () => {
              await actionDialogConfig.action();
              setShowActionDialog(false);
              setActionDialogConfig(null);
            }}
            title={actionDialogConfig.title}
            description={actionDialogConfig.description}
            confirmLabel={actionDialogConfig.confirmLabel}
            tone={actionDialogConfig.tone}
          />
        )}
      </div>
    </AdminLayout>
  );
}
