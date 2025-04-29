import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Mark = {
  marks_id: number;
  student_id: number;
  course_id: number;
  course_name: string;
  internal1: number | null;
  internal2: number | null;
  internal3: number | null;
  semester_marks: number | null;
  cgpa: number | null;
  total?: number;
};

const StudentMarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student marks
  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['student-marks', user?.user_id],
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

        // Get marks
        const { data: marksData, error } = await supabase
          .from('marks')
          .select('*')
          .eq('student_id', studentData.student_id);

        if (error) throw error;

        // Format the marks data with course names
        const formattedMarks = [];
        
        for (const mark of marksData) {
          // Fetch course information for this mark
          const { data: courseData } = await supabase
            .from('courses')
            .select('course_name')
            .eq('course_id', mark.course_id)
            .single();
          
          formattedMarks.push({
            ...mark,
            course_name: courseData?.course_name || 'Unknown Course',
            // Calculate total if internals and semester marks are available
            total: calculateTotal(mark.internal1, mark.internal2, mark.internal3, mark.semester_marks)
          });
        }

        return formattedMarks;
      } catch (error) {
        console.error("Error fetching marks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch academic records",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user?.user_id,
  });

  // Calculate overall performance
  const calculateCGPA = () => {
    if (!marks || marks.length === 0) return 0;
    
    const validCGPAs = marks.filter(mark => mark.cgpa !== null).map(mark => mark.cgpa as number);
    if (validCGPAs.length === 0) return 0;
    
    const sum = validCGPAs.reduce((total, cgpa) => total + cgpa, 0);
    return (sum / validCGPAs.length).toFixed(2);
  };

  // Calculate average score for internals
  const calculateAverageInternals = () => {
    if (!marks || marks.length === 0) return { avg1: 0, avg2: 0, avg3: 0 };
    
    let sum1 = 0, count1 = 0;
    let sum2 = 0, count2 = 0;
    let sum3 = 0, count3 = 0;
    
    marks.forEach(mark => {
      if (mark.internal1 !== null) {
        sum1 += mark.internal1;
        count1++;
      }
      if (mark.internal2 !== null) {
        sum2 += mark.internal2;
        count2++;
      }
      if (mark.internal3 !== null) {
        sum3 += mark.internal3;
        count3++;
      }
    });
    
    return {
      avg1: count1 > 0 ? Math.round(sum1 / count1) : 0,
      avg2: count2 > 0 ? Math.round(sum2 / count2) : 0,
      avg3: count3 > 0 ? Math.round(sum3 / count3) : 0
    };
  };

  // Helper function to calculate total marks
  const calculateTotal = (
    internal1: number | null,
    internal2: number | null,
    internal3: number | null,
    semesterMarks: number | null
  ) => {
    // Assume internals are 20% each and semester is 40%
    const int1 = internal1 || 0;
    const int2 = internal2 || 0;
    const int3 = internal3 || 0;
    const sem = semesterMarks || 0;
    
    // Only calculate if at least one value is available
    if (int1 || int2 || int3 || sem) {
      let divider = 0;
      let sum = 0;
      
      if (int1 || int1 === 0) { sum += int1; divider += 1; }
      if (int2 || int2 === 0) { sum += int2; divider += 1; }
      if (int3 || int3 === 0) { sum += int3; divider += 1; }
      if (sem || sem === 0) { sum += sem; divider += 1; }
      
      return divider > 0 ? Math.round(sum / divider) : null;
    }
    
    return null;
  };

  // Prepare chart data
  const prepareChartData = () => {
    return marks.map(mark => ({
      name: mark.course_name,
      Internal1: mark.internal1 || 0,
      Internal2: mark.internal2 || 0,
      Internal3: mark.internal3 || 0,
      Semester: mark.semester_marks || 0
    }));
  };

  const getGradeColor = (value: number | null) => {
    if (value === null) return "text-gray-400";
    if (value >= 90) return "text-green-600";
    if (value >= 80) return "text-green-500";
    if (value >= 70) return "text-yellow-600";
    if (value >= 60) return "text-yellow-500";
    if (value >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getGradeLetter = (value: number | null) => {
    if (value === null) return "-";
    if (value >= 90) return "A+";
    if (value >= 80) return "A";
    if (value >= 70) return "B+";
    if (value >= 60) return "B";
    if (value >= 50) return "C";
    if (value >= 40) return "D";
    return "F";
  };

  const cgpa = calculateCGPA();
  const avgInternals = calculateAverageInternals();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Academic Performance</h1>
        <p className="text-gray-500">View your grades, marks, and academic progress.</p>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Marks</TabsTrigger>
            <TabsTrigger value="chart">Performance Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Academic Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-blue-700 mb-2">CGPA</h3>
                      <p className="text-3xl font-bold text-blue-800">{cgpa}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-green-700 mb-2">Internal 1</h3>
                      <p className="text-3xl font-bold text-green-800">{avgInternals.avg1}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-yellow-700 mb-2">Internal 2</h3>
                      <p className="text-3xl font-bold text-yellow-800">{avgInternals.avg2}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <h3 className="text-lg font-medium text-purple-700 mb-2">Internal 3</h3>
                      <p className="text-3xl font-bold text-purple-800">{avgInternals.avg3}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Subject Performance Overview</CardTitle>
                  <CardDescription>Quick overview of your performance across subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-10">Loading academic records...</div>
                  ) : marks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-center">Average</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                            <TableHead className="text-center">CGPA</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {marks.map((mark) => (
                            <TableRow key={mark.marks_id}>
                              <TableCell className="font-medium">{mark.course_name}</TableCell>
                              <TableCell className="text-center">{mark.total || '-'}</TableCell>
                              <TableCell className={`text-center font-bold ${getGradeColor(mark.total)}`}>
                                {mark.total ? getGradeLetter(mark.total) : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {mark.cgpa !== null ? mark.cgpa.toFixed(2) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No academic records found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Academic Records</CardTitle>
                <CardDescription>Breakdown of marks for each subject</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">Loading academic records...</div>
                ) : marks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Internal 1</TableHead>
                          <TableHead className="text-center">Internal 2</TableHead>
                          <TableHead className="text-center">Internal 3</TableHead>
                          <TableHead className="text-center">Semester</TableHead>
                          <TableHead className="text-center">CGPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {marks.map((mark) => (
                          <TableRow key={mark.marks_id}>
                            <TableCell className="font-medium">{mark.course_name}</TableCell>
                            <TableCell className={`text-center ${getGradeColor(mark.internal1)}`}>
                              {mark.internal1 !== null ? mark.internal1 : '-'}
                            </TableCell>
                            <TableCell className={`text-center ${getGradeColor(mark.internal2)}`}>
                              {mark.internal2 !== null ? mark.internal2 : '-'}
                            </TableCell>
                            <TableCell className={`text-center ${getGradeColor(mark.internal3)}`}>
                              {mark.internal3 !== null ? mark.internal3 : '-'}
                            </TableCell>
                            <TableCell className={`text-center ${getGradeColor(mark.semester_marks)}`}>
                              {mark.semester_marks !== null ? mark.semester_marks : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {mark.cgpa !== null ? mark.cgpa.toFixed(2) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No academic records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Performance Visualization</CardTitle>
                <CardDescription>Visual representation of your academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">Loading chart data...</div>
                ) : marks.length > 0 ? (
                  <div className="h-[400px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareChartData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Internal1" fill="#4ade80" name="Internal 1" />
                        <Bar dataKey="Internal2" fill="#fbbf24" name="Internal 2" />
                        <Bar dataKey="Internal3" fill="#a78bfa" name="Internal 3" />
                        <Bar dataKey="Semester" fill="#3b82f6" name="Semester" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No data available for visualization
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentMarks;
