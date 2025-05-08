
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileTextIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const StudentAssignments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('student_id, section_id')
          .eq('user_id', user.user_id)
          .single();

        if (studentError) throw studentError;

        if (studentData) {
          // Get course IDs for student's section
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('course_id')
            .eq('section_id', studentData.section_id);

          if (coursesError) throw coursesError;

          if (coursesData && coursesData.length > 0) {
            // Get assignments for these courses
            const courseIds = coursesData.map(course => course.course_id);
            
            const { data: assignmentsData, error: assignmentsError } = await supabase
              .from('assignments')
              .select(`
                *,
                courses(course_name, faculty_id, faculty(name))
              `)
              .in('course_id', courseIds)
              .order('due_date', { ascending: true });

            if (assignmentsError) throw assignmentsError;

            setAssignments(assignmentsData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user, toast]);

  const handleAssignmentClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsDialogOpen(true);
  };

  // Group assignments by due date status
  const currentDate = new Date();
  const upcomingAssignments = assignments.filter(
    (assignment) => new Date(assignment.due_date) >= currentDate
  );
  
  const pastAssignments = assignments.filter(
    (assignment) => new Date(assignment.due_date) < currentDate
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
        <p className="text-gray-500">View and submit your assignments.</p>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Assignments that are due soon</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAssignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAssignments.map((assignment) => (
                        <TableRow 
                          key={assignment.assignment_id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileTextIcon className="h-4 w-4 text-primary" />
                            {assignment.title}
                          </TableCell>
                          <TableCell>{assignment.courses?.course_name}</TableCell>
                          <TableCell>{assignment.courses?.faculty?.name}</TableCell>
                          <TableCell>
                            {format(new Date(assignment.due_date), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">No upcoming assignments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Assignments</CardTitle>
                <CardDescription>Previously due assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {pastAssignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastAssignments.map((assignment) => (
                        <TableRow 
                          key={assignment.assignment_id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          <TableCell className="font-medium flex items-center gap-2">
                            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                            {assignment.title}
                          </TableCell>
                          <TableCell>{assignment.courses?.course_name}</TableCell>
                          <TableCell>
                            {format(new Date(assignment.due_date), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">No past assignments</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {assignments.length === 0 && !loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-10">
                  <FileTextIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No assignments found</h3>
                  <p className="mt-1 text-gray-500">
                    You don't have any assignments assigned to you yet.
                  </p>
                </CardContent>
              </Card>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{selectedAssignment?.title}</DialogTitle>
                  <DialogDescription>
                    {selectedAssignment?.courses?.course_name} • Due: {selectedAssignment?.due_date && format(new Date(selectedAssignment.due_date), "MMM d, yyyy")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedAssignment?.description || "No description provided."}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Teacher</h3>
                    <p className="text-sm text-gray-700">{selectedAssignment?.courses?.faculty?.name || "Not specified"}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
