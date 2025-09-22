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
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Download, Plus, Sparkles, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  
  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    fetchAdmins();
    
    // Enhanced GSAP animations with staggered entrance
    const tl = gsap.timeline({ delay: 0.2 });
    
    if (headerRef.current) {
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: -30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }
    
    if (statsRef.current) {
      tl.fromTo(statsRef.current.children, 
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.4"
      );
    }
    
    if (containerRef.current) {
      tl.fromTo(containerRef.current.children, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, []);

  if (loading && admins.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-30 animate-pulse" />
            <motion.div 
              className="relative animate-spin rounded-full h-32 w-32 border-4 border-primary-200 border-t-primary-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-primary-600" size={32} />
            </motion.div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30">
        <div ref={containerRef} className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Stunning Header Section */}
          <motion.div 
            ref={headerRef}
            className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 rounded-3xl shadow-2xl border border-primary-200/20"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-32 -translate-x-32 animate-pulse"></div>
            
            {/* Header Content */}
            <div className="relative p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-white">
                        Admin Manager
                      </h1>
                      <p className="text-white/80 text-lg">
                        Manage administrators and managers
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 px-6 py-3 rounded-xl font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Admin/Manager
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

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
      </div>
    </AdminLayout>
  );
}
