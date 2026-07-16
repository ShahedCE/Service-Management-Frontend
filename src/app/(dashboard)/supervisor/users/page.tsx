"use client";

import { useState } from "react";
import { Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { UsersService, User } from "@/services/users.service";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AddUserModal } from "@/components/users/AddUserModal";
import { EditUserModal } from "@/components/users/EditUserModal";
import { DeleteUserModal } from "@/components/users/DeleteUserModal";

export default function OperatorManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: response, isLoading: loading } = useSWR(
    ["/users", currentPage, searchQuery, statusFilter],
    () => UsersService.getUsers({
      page: currentPage,
      limit: itemsPerPage,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    })
  );

  const currentUsers = response?.data || [];
  const meta = response?.meta || { totalItems: 0, totalPages: 1 };
  const totalItems = meta.totalItems;
  const totalPages = meta.totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (currentUsers.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Operator Management</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Oversee system operators and manage administrative permissions.
          </p>
        </div>
        <AddUserModal />
      </div>

      {/* Main Content Area */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-border/50 bg-slate-50/50 dark:bg-card">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or role..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset to first page on search
              }}
              className="pl-9 h-11 rounded-xl bg-background border-border/50 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl h-11 bg-background border-border/50">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-900/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">OPERATOR</th>
                <th className="px-6 py-4">EMAIL ADDRESS</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    Loading operators...
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No operators found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">ID: OP-{user.id.substring(0, 4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400"}`} />
                        <span className={`font-medium ${user.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEdit(user)}
                          className="h-8 w-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDelete(user)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-card">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to <span className="font-semibold text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-semibold text-foreground">{totalItems}</span> operators
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronLeft size={16} />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-lg ${page === currentPage ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-lg border-border/50"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EditUserModal 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen} 
        user={selectedUser} 
      />
      <DeleteUserModal 
        isOpen={isDeleteOpen} 
        setIsOpen={setIsDeleteOpen} 
        user={selectedUser} 
        onSuccess={handleDeleteSuccess} 
      />
    </div>
  );
}
