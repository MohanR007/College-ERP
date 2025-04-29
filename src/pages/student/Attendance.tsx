
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Course = {
  course_id: number;
  course_name: string;
};

type AttendanceRecord = {
  date: string;
  status: string;
  course_name: string;
  course_id: number;
};

type AttendanceSummary = {
  course_id: number;
  course_name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
};

const StudentAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [overallAttendance, setOverallAttendance] = useState<{present: number, absent: number, total: number, percentage: number}>({
    present: 0,
    absent: 0,
    total: 0,
    percentage: 0
  });

  // Fetch student courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['student-courses', user?.user_id],
    queryFn: async () => {
      try {
        // Get student ID
        const { data: studentData } = await supabase
          .from('students')
          .select('student_id, section_id')
          .eq('user_id', user?.user_id)
          .single();

        if (!studentData) {
          throw new Error("Student not found");
        }

        // Get courses for this student's section
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('course_id, course_name')
          .eq('section_id', studentData.section_id);

        if (coursesError) throw coursesError;
        return coursesData || [];
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch courses data",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user?.user_id,
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-attendance', user?.user_id, selectedCourse],
    queryFn: async () => {
      try {
        // Get student ID
        const { data: studentData } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user?.user_id)
          .single();

        if (!studentData) {
          throw new Error("Student not found");
        }

        // Construct the query based on whether a course is selected
        let query = supabase
          .from('attendance')
          .select(`
            date,
            status,
            courses (
              course_id,
              course_name
            )
          `)
          .eq('student_id', studentData.student_id);

        if (selectedCourse) {
          query = query.eq('course_id', selectedCourse);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;

        // Format the attendance records
        const formattedRecords = data.map(record => ({
          date: record.date,
          status: record.status || 'Unknown',
          course_id: record.courses?.course_id,
          course_name: record.courses?.course_name || 'Unknown Course'
        }));

        return formattedRecords;
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user?.user_id,
  });

  // Calculate attendance summary
  useEffect(() => {
    if (!attendanceRecords.length) return;

    // Group by course
    const courseAttendance: Record<number, {present: number, absent: number, total: number}> = {};
    let totalPresent = 0;
    let totalAbsent = 0;
    
    attendanceRecords.forEach(record => {
      if (!record.course_id) return;
      
      if (!courseAttendance[record.course_id]) {
        courseAttendance[record.course_id] = {
          present: 0,
          absent: 0,
          total: 0
        };
      }
      
      if (record.status === 'Present') {
        courseAttendance[record.course_id].present += 1;
        totalPresent += 1;
      } else if (record.status === 'Absent') {
        courseAttendance[record.course_id].absent += 1;
        totalAbsent += 1;
      }
      
      courseAttendance[record.course_id].total += 1;
    });
    
    // Format the summary
    const summary = Object.keys(courseAttendance).map(courseId => {
      const courseName = attendanceRecords.find(r => r.course_id === parseInt(courseId))?.course_name || 'Unknown';
      const stats = courseAttendance[parseInt(courseId)];
      const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      
      return {
        course_id: parseInt(courseId),
        course_name: courseName,
        present: stats.present,
        absent: stats.absent,
        total: stats.total,
        percentage
      };
    });
    
    setAttendanceSummary(summary);
    
    // Overall attendance
    const totalClasses = totalPresent + totalAbsent;
    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    
    setOverallAttendance({
      present: totalPresent,
      absent: totalAbsent,
      total: totalClasses,
      percentage: overallPercentage
    });
  }, [attendanceRecords]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Present</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Absent</Badge>;
      case 'Late':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Late</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Attendance</h1>
        <p className="text-gray-500">View your attendance records and analytics.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Overall Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Attendance Rate:</span>
                  <span className="font-bold">{overallAttendance.percentage}%</span>
                </div>
                <Progress 
                  value={overallAttendance.percentage} 
                  className={getProgressColor(overallAttendance.percentage)} 
                />
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">Total Classes</p>
                    <p className="text-xl font-bold">{overallAttendance.total}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-600">Present</p>
                    <p className="text-xl font-bold text-green-700">{overallAttendance.present}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">Absent</p>
                    <p className="text-xl font-bold text-red-700">{overallAttendance.absent}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Course-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceSummary.map((course) => (
                  <div key={course.course_id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{course.course_name}</span>
                      <span className="font-bold">{course.percentage}%</span>
                    </div>
                    <Progress 
                      value={course.percentage} 
                      className={getProgressColor(course.percentage)} 
                    />
                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>Present: {course.present}</span>
                      <span>Absent: {course.absent}</span>
                      <span>Total: {course.total}</span>
                    </div>
                  </div>
                ))}
                {attendanceSummary.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No attendance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Course
                </label>
                <Select 
                  value={selectedCourse?.toString() || ""} 
                  onValueChange={(value) => setSelectedCourse(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem 
                        key={course.course_id} 
                        value={course.course_id.toString()}
                      >
                        {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingAttendance ? (
                <div className="text-center py-10">Loading attendance records...</div>
              ) : attendanceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record, index) => (
                        <TableRow key={`${record.course_id}-${record.date}-${index}`}>
                          <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{record.course_name}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No attendance records found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
