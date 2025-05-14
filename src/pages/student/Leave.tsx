
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { LeaveApplicationForm } from "@/components/LeaveApplicationForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FilePen, FileText } from "lucide-react";

const StudentLeave = () => {
  const { user } = useAuth();
  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: leaveApplications, refetch } = useQuery({
    queryKey: ['leave-applications', user?.user_id],
    queryFn: async () => {
      const { data: studentData } = await supabase
        .from('students')
        .select('student_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!studentData) return [];

      const { data } = await supabase
        .from('leaveapplications')
        .select(`
          *,
          faculty:reviewed_by(name)
        `)
        .eq('student_id', studentData.student_id)
        .order('from_date', { ascending: false });

      return data || [];
    },
    enabled: !!user
  });

  const handleSuccess = () => {
    refetch();
    setIsDialogOpen(false);
    setEditingLeave(null);
  };

  const handleEdit = (leave: any) => {
    setEditingLeave(leave);
    setIsDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leave Application</h1>
            <p className="text-gray-500">Apply for and track your leave requests.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Leave Application</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLeave ? "Edit Leave Application" : "New Leave Application"}
                </DialogTitle>
              </DialogHeader>
              <LeaveApplicationForm
                onSuccess={handleSuccess}
                initialData={editingLeave}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveApplications && leaveApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApplications.map((leave: any) => (
                    <TableRow key={leave.leave_id}>
                      <TableCell>
                        {new Date(leave.from_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(leave.to_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {leave.reason}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell>{leave.faculty?.name || '-'}</TableCell>
                      <TableCell>
                        {leave.proof_url ? (
                          <a 
                            href={leave.proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {leave.status === 'Pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(leave)}
                          >
                            <FilePen className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500">No leave applications found.</p>
                <p className="text-sm text-gray-400">
                  Create a new leave application to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentLeave;
