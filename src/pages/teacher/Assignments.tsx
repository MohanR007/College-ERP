
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Form validation schema
const assignmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  due_date: z.date({ required_error: "Due date is required" }),
  course_id: z.number({ required_error: "Course is required" })
});

const TeacherAssignments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);
  
  const form = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: undefined,
      course_id: undefined
    }
  });

  // Fetch teacher's faculty ID and courses
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      
      try {
        // Get faculty ID for current user
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('faculty_id')
          .eq('user_id', user.id)
          .single();
        
        if (facultyError) throw facultyError;
        
        if (facultyData) {
          // Get courses taught by this faculty
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('course_id, course_name, section_id, sections(name)')
            .eq('faculty_id', facultyData.faculty_id);
          
          if (coursesError) throw coursesError;
          
          setTeacherCourses(coursesData || []);
          
          // Fetch assignments for these courses
          fetchAssignments(coursesData.map(course => course.course_id));
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to load teacher data",
          variant: "destructive"
        });
      }
    };
    
    fetchTeacherData();
  }, [user, toast]);
  
  // Fetch assignments for teacher's courses
  const fetchAssignments = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(course_name, sections(name))')
        .in('course_id', courseIds)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      });
    }
  };

  // Handle form submission for creating/updating assignment
  const onSubmit = async (values) => {
    try {
      // Get faculty ID for current user
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('faculty_id')
        .eq('user_id', user.id)
        .single();
        
      if (facultyError) throw facultyError;
      
      // Format date to YYYY-MM-DD
      const formattedDate = format(values.due_date, "yyyy-MM-dd");
      
      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update({
            title: values.title,
            description: values.description,
            due_date: formattedDate,
            course_id: values.course_id
          })
          .eq('assignment_id', editingAssignment.assignment_id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: values.title,
            description: values.description,
            due_date: formattedDate,
            course_id: values.course_id,
            created_by: facultyData.faculty_id
          });
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }
      
      // Refresh assignments list
      fetchAssignments(teacherCourses.map(course => course.course_id));
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingAssignment(null);
      form.reset();
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: "Failed to save assignment",
        variant: "destructive"
      });
    }
  };

  // Open dialog to edit assignment
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    form.setValue("title", assignment.title);
    form.setValue("description", assignment.description);
    form.setValue("course_id", assignment.course_id);
    form.setValue("due_date", new Date(assignment.due_date));
    setIsDialogOpen(true);
  };

  // Open dialog to add new assignment
  const handleAddAssignment = () => {
    setEditingAssignment(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Assignment Management</h1>
            <p className="text-gray-500">Create, assign, and grade student assignments.</p>
          </div>
          <Button onClick={handleAddAssignment}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Assignment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.assignment_id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{assignment.courses?.course_name}</TableCell>
                        <TableCell>{assignment.courses?.sections?.name}</TableCell>
                        <TableCell>
                          {format(new Date(assignment.due_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
                <p className="mt-1 text-gray-500">
                  Create assignments for your courses by clicking the "Add Assignment" button.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    >
                      <option value="" disabled>Select a course</option>
                      {teacherCourses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.course_name} - Section {course.sections?.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about the assignment" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {editingAssignment ? "Update Assignment" : "Create Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TeacherAssignments;
