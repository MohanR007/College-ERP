
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

type Course = {
  course_id: number;
  course_name: string;
  section_id: number;
  section_name?: string;
};

type Student = {
  student_id: number;
  name: string;
};

type Mark = {
  marks_id?: number;
  student_id: number;
  course_id: number;
  internal1: number | null;
  internal2: number | null;
  internal3: number | null;
  semester_marks: number | null;
  cgpa: number | null;
};

const TeacherMarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [studentMarks, setStudentMarks] = useState<Record<number, Mark>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch faculty courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('faculty_id')
          .eq('user_id', user.user_id)
          .single();
          
        if (facultyError || !facultyData) {
          console.error('Error fetching faculty data:', facultyError);
          return;
        }

        const { data, error } = await supabase
          .from('courses')
          .select('course_id, course_name, section_id, sections(name)')
          .eq('faculty_id', facultyData.faculty_id);
          
        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }

        const formattedCourses = data.map(course => ({
          course_id: course.course_id,
          course_name: course.course_name,
          section_id: course.section_id,
          section_name: course.sections?.name
        }));
        
        setCourses(formattedCourses);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCourses();
  }, [user]);

  // Fetch students when course is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      
      setIsLoading(true);
      
      try {
        // Get section_id from selected course
        const course = courses.find(c => c.course_id === selectedCourse);
        if (!course || !course.section_id) return;
        
        // Fetch students in the selected section
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('student_id, name')
          .eq('section_id', course.section_id);
          
        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          return;
        }
        
        setStudents(studentsData || []);
        
        // Fetch existing marks for these students in this course
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .eq('course_id', selectedCourse);
          
        if (marksError) {
          console.error('Error fetching marks:', marksError);
          return;
        }
        
        // Create a map of student_id to marks
        const marksMap: Record<number, Mark> = {};
        
        if (marksData) {
          marksData.forEach((mark: Mark) => {
            marksMap[mark.student_id] = mark;
          });
        }
        
        // Initialize marks for students without existing records
        studentsData?.forEach((student) => {
          if (!marksMap[student.student_id]) {
            marksMap[student.student_id] = {
              student_id: student.student_id,
              course_id: selectedCourse,
              internal1: null,
              internal2: null,
              internal3: null,
              semester_marks: null,
              cgpa: null
            };
          }
        });
        
        setStudentMarks(marksMap);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, courses]);

  // Handle mark changes
  const handleMarkChange = (studentId: number, field: keyof Mark, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue
      }
    }));
  };

  // Save marks
  const saveMarks = async (studentId: number) => {
    if (!selectedCourse) return;
    
    const markData = studentMarks[studentId];
    if (!markData) return;
    
    try {
      // Check if this student already has marks for this course
      if (markData.marks_id) {
        // Update existing record
        const { error } = await supabase
          .from('marks')
          .update({
            internal1: markData.internal1,
            internal2: markData.internal2,
            internal3: markData.internal3,
            semester_marks: markData.semester_marks,
            cgpa: markData.cgpa
          })
          .eq('marks_id', markData.marks_id);
          
        if (error) {
          console.error('Error updating marks:', error);
          toast({
            title: "Error",
            description: "Failed to update marks",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('marks')
          .insert({
            student_id: studentId,
            course_id: selectedCourse,
            internal1: markData.internal1,
            internal2: markData.internal2,
            internal3: markData.internal3,
            semester_marks: markData.semester_marks,
            cgpa: markData.cgpa
          })
          .select();
          
        if (error) {
          console.error('Error inserting marks:', error);
          toast({
            title: "Error",
            description: "Failed to save marks",
            variant: "destructive"
          });
          return;
        }
        
        // Update the local state with the new marks_id
        if (data && data[0]) {
          setStudentMarks(prev => ({
            ...prev,
            [studentId]: {
              ...prev[studentId],
              marks_id: data[0].marks_id
            }
          }));
        }
      }
      
      toast({
        title: "Success",
        description: "Marks saved successfully",
      });
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  // Save all marks
  const saveAllMarks = async () => {
    if (!selectedCourse || students.length === 0) return;
    
    setIsLoading(true);
    
    try {
      for (const student of students) {
        await saveMarks(student.student_id);
      }
      
      toast({
        title: "Success",
        description: "All marks saved successfully",
      });
    } catch (error) {
      console.error('Error saving all marks:', error);
      toast({
        title: "Error",
        description: "Failed to save all marks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Marks Management</h1>
        <p className="text-gray-500">Record and manage student academic performance.</p>

        <Card>
          <CardHeader>
            <CardTitle>Course Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="course-select">Select Course</Label>
              <Select 
                onValueChange={(value) => setSelectedCourse(parseInt(value))}
                value={selectedCourse?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem 
                      key={course.course_id} 
                      value={course.course_id.toString()}
                    >
                      {course.course_name} - Section: {course.section_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Student Marks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <p>Loading...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center p-6">
                  <p>No students found in this section.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Internal 1</TableHead>
                          <TableHead>Internal 2</TableHead>
                          <TableHead>Internal 3</TableHead>
                          <TableHead>Semester Marks</TableHead>
                          <TableHead>CGPA</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={studentMarks[student.student_id]?.internal1 ?? ''}
                                onChange={(e) => handleMarkChange(student.student_id, 'internal1', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={studentMarks[student.student_id]?.internal2 ?? ''}
                                onChange={(e) => handleMarkChange(student.student_id, 'internal2', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={studentMarks[student.student_id]?.internal3 ?? ''}
                                onChange={(e) => handleMarkChange(student.student_id, 'internal3', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={studentMarks[student.student_id]?.semester_marks ?? ''}
                                onChange={(e) => handleMarkChange(student.student_id, 'semester_marks', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.01"
                                value={studentMarks[student.student_id]?.cgpa ?? ''}
                                onChange={(e) => handleMarkChange(student.student_id, 'cgpa', e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                onClick={() => saveMarks(student.student_id)}
                                variant="outline"
                                size="sm"
                              >
                                Save
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={saveAllMarks}
                      disabled={isLoading}
                    >
                      Save All Marks
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherMarks;
