import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, FilePen, File } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { LeaveApplicationForm } from "@/components/LeaveApplicationForm";

const TeacherLeave = () => {
  const { user } = useAuth();
  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alertDialogData, setAlertDialogData] = useState<{ 
    isOpen: boolean; 
    title: string; 
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: facultyData } = useQuery({
    queryKey: ['faculty-data', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return null;
      
      const { data } = await supabase
        .from('faculty')
        .select('faculty_id')
        .eq('user_id', user.user_id)
        .single();
      
      return data;
    },
    enabled: !!user
  });

  const { data: leaveApplications, refetch } = useQuery({
    queryKey: ['teacher-leave-applications', facultyData?.faculty_id],
    queryFn: async () => {
      if (!facultyData?.faculty_id) return [];

      // Get the courses taught by this faculty
      const { data: courseData } = await supabase
        .from('courses')
        .select('section_id')
        .eq('faculty_id', facultyData.faculty_id);
      
      if (!courseData || courseData.length === 0) return [];

      // Get the sections this faculty teaches
      const sectionIds = [...new Set(courseData.map(course => course.section_id))];
      
      // Get students from these sections
      const { data: studentsData } = await supabase
        .from('students')
        .select('student_id')
        .in('section_id', sectionIds);
      
      if (!studentsData || studentsData.length === 0) return [];

      // Get leave applications from these students
      const { data: leaveData } = await supabase
        .from('leaveapplications')
        .select(`
          *,
          student:student_id(
            student_id,
            name,
            section:section_id(name)
          )
        `)
        .in('student_id', studentsData.map(s => s.student_id))
        .order('from_date', { ascending: false });
      
      return leaveData || [];
    },
    enabled: !!facultyData?.faculty_id
  });

  const handleStatusChange = async (leaveId: number, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    const actionText = newStatus === 'Approved' ? 'approve' : 
                      newStatus === 'Rejected' ? 'reject' : 'reset';
    
    setAlertDialogData({
      isOpen: true,
      title: `${newStatus === 'Pending' ? 'Reset' : newStatus} Leave Application`,
      description: `Are you sure you want to ${actionText} this leave application?`,
      action: async () => {
        setIsProcessing(true);
        try {
          const { error } = await supabase
            .from('leaveapplications')
            .update({ 
              status: newStatus,
              reviewed_by: facultyData?.faculty_id 
            })
            .eq('leave_id', leaveId);
          
          if (error) throw error;
          
          toast({
            title: `Leave application ${newStatus.toLowerCase()}`,
            description: `The leave application has been ${newStatus === 'Pending' ? 'reset' : newStatus.toLowerCase()} successfully.`
          });
          refetch();
        } catch (error) {
          console.error(`Error ${actionText}ing leave:`, error);
          toast({
            title: "Error",
            description: `Failed to ${actionText} the leave application.`,
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
          setAlertDialogData(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleEditLeave = (leave: any) => {
    setEditingLeave(leave);
    setIsDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsDialogOpen(false);
    setEditingLeave(null);
    refetch();
    toast({
      title: "Leave application updated",
      description: "The leave application has been updated successfully."
    });
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
        <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
        <p className="text-gray-500">Review and approve student leave applications.</p>

        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveApplications && leaveApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApplications.map((leave: any) => (
                    <TableRow key={leave.leave_id}>
                      <TableCell>{leave.student?.name || 'Unknown'}</TableCell>
                      <TableCell>{leave.student?.section?.name || 'Unknown'}</TableCell>
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
                        {leave.proof_url ? (
                          <a 
                            href={leave.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            <File className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {leave.status === 'Pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(leave.leave_id, 'Approved')}
                                disabled={isProcessing}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(leave.leave_id, 'Rejected')}
                                disabled={isProcessing}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {leave.status === 'Approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(leave.leave_id, 'Rejected')}
                              disabled={isProcessing}
                              title="Reject approved leave"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                          {leave.status === 'Rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(leave.leave_id, 'Approved')}
                              disabled={isProcessing}
                              title="Approve rejected leave"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {leave.status !== 'Pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(leave.leave_id, 'Pending')}
                              disabled={isProcessing}
                              title="Reset to pending"
                            >
                              <FilePen className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">No Leave Applications</h3>
                <p className="mt-1 text-gray-500">
                  There are no leave applications from students in your sections.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={alertDialogData.isOpen} onOpenChange={(isOpen) => 
        setAlertDialogData(prev => ({ ...prev, isOpen }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogData.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogData.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                alertDialogData.action();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TeacherLeave;
