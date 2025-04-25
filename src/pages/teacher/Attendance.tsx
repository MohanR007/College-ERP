
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Student = {
  student_id: number;
  name: string;
  attendance_id?: number;
  status?: string;
};

type Course = {
  course_id: number;
  course_name: string;
  section_id: number;
  section_name: string;
};

const TeacherAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [studentAttendance, setStudentAttendance] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch faculty courses
  const { data: facultyCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['faculty-courses', user?.user_id],
    queryFn: async () => {
      // Get faculty ID first
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('faculty_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!facultyData) {
        throw new Error("Faculty not found");
      }

      // Get courses with section information
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          course_id,
          course_name,
          section_id,
          sections (
            name
          )
        `)
        .eq('faculty_id', facultyData.faculty_id);

      if (error) throw error;
      
      return coursesData.map((course) => ({
        course_id: course.course_id,
        course_name: course.course_name,
        section_id: course.section_id,
        section_name: course.sections?.name || 'Unknown',
      }));
    },
    enabled: !!user?.user_id,
  });

  // Fetch students when course is selected
  const fetchStudents = async () => {
    if (!selectedCourse || !selectedDate) return;

    setIsLoading(true);
    try {
      // Get students for this course's section
      const { data: courseData } = await supabase
        .from('courses')
        .select('section_id')
        .eq('course_id', selectedCourse)
        .single();

      if (!courseData?.section_id) {
        throw new Error("Section not found for this course");
      }

      // Get students in this section
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id, name')
        .eq('section_id', courseData.section_id);

      if (studentsError) throw studentsError;

      // Check if attendance records exist for this date and course
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('course_id', selectedCourse)
        .eq('date', formattedDate);

      if (attendanceError) throw attendanceError;

      // Merge student data with any existing attendance records
      const students = studentsData.map(student => {
        const existingAttendance = attendanceData?.find(
          record => record.student_id === student.student_id
        );
        
        return {
          student_id: student.student_id,
          name: student.name || `Student ID: ${student.student_id}`,
          attendance_id: existingAttendance?.attendance_id,
          status: existingAttendance?.status || 'Present',
        };
      });

      setStudentAttendance(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch students when course changes
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudents();
    } else {
      setStudentAttendance([]);
    }
  }, [selectedCourse, selectedDate]);

  const updateAttendanceStatus = (studentId: number, status: string) => {
    setStudentAttendance(prev =>
      prev.map(student =>
        student.student_id === studentId
          ? { ...student, status }
          : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !selectedDate || studentAttendance.length === 0) return;

    setIsSubmitting(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    try {
      // Process each student's attendance
      for (const student of studentAttendance) {
        if (student.attendance_id) {
          // Update existing record
          await supabase
            .from('attendance')
            .update({
              status: student.status
            })
            .eq('attendance_id', student.attendance_id);
        } else {
          // Create new record
          await supabase
            .from('attendance')
            .insert({
              student_id: student.student_id,
              course_id: selectedCourse,
              date: formattedDate,
              status: student.status
            });
        }
      }

      toast({
        title: "Success",
        description: "Attendance has been saved successfully",
      });
      
      // Refresh attendance data to get the newly created IDs
      fetchStudents();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
        <p className="text-gray-500">Mark and manage student attendance for your classes.</p>

        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <CardTitle>Select Course & Date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select
                  value={selectedCourse?.toString() || ""}
                  onValueChange={(value) => setSelectedCourse(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyCourses.map((course) => (
                      <SelectItem 
                        key={course.course_id} 
                        value={course.course_id.toString()}
                      >
                        {course.course_name} - Section {course.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full md:w-2/3">
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-8">
                  <p>Loading student data...</p>
                </div>
              ) : !selectedCourse || !selectedDate ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900">No Data Selected</h3>
                  <p className="mt-1 text-gray-500">
                    Please select a course and date to mark attendance.
                  </p>
                </div>
              ) : studentAttendance.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
                  <p className="mt-1 text-gray-500">
                    No students are assigned to this course section.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-block px-2 py-1 rounded-full text-xs font-medium",
                                student.status === "Present" && "bg-green-100 text-green-800",
                                student.status === "Absent" && "bg-red-100 text-red-800",
                                student.status === "Late" && "bg-yellow-100 text-yellow-800",
                                student.status === "Excused" && "bg-blue-100 text-blue-800"
                              )}
                            >
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={student.status === "Present" ? "default" : "outline"}
                                onClick={() => updateAttendanceStatus(student.student_id, "Present")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "Absent" ? "default" : "outline"}
                                onClick={() => updateAttendanceStatus(student.student_id, "Absent")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={handleSaveAttendance} 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
