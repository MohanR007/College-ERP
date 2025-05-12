
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard', user?.user_id],
    queryFn: async () => {
      // Get student data
      const { data: studentData } = await supabase
        .from('students')
        .select('student_id, section_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!studentData) {
        throw new Error('Student not found');
      }

      // Get courses for this student's section
      const { data: courses } = await supabase
        .from('courses')
        .select('course_id')
        .eq('section_id', studentData.section_id);
      
      const courseIds = (courses || []).map(c => c.course_id);
      
      // Get assignments due
      const { data: pendingAssignments } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', courseIds)
        .gt('due_date', new Date().toISOString().split('T')[0]);
      
      // Get today's classes
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];
      
      const { data: todaysClasses } = await supabase
        .from('timetable')
        .select('*')
        .eq('section_id', studentData.section_id)
        .eq('day_of_week', today);
      
      // Get attendance percentage
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentData.student_id);
      
      let attendancePercentage = 0;
      if (attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(a => a.status === 'Present').length;
        attendancePercentage = Math.round((present / attendanceData.length) * 100);
      }
      
      // Get recent notifications
      const { data: recentNotifications } = await supabase
        .from('assignments')
        .select('title, created_at, courses(course_name)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(3);
      
      return {
        assignmentsDue: pendingAssignments?.length || 0,
        attendancePercentage: attendancePercentage || 0,
        todaysClasses: todaysClasses?.length || 0,
        recentNotifications: recentNotifications || []
      };
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 border-4 border-t-edu-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500">
          {/* Display user's name instead of email */}
          Welcome back, {user?.name || user?.email}. Here's an overview of your academic status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignments Due</CardTitle>
              <CardDescription>Upcoming assignment deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">{dashboardData?.assignmentsDue}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Your current attendance percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">{dashboardData?.attendancePercentage}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your scheduled classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">{dashboardData?.todaysClasses}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest updates from your professors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentNotifications && dashboardData.recentNotifications.length > 0 ? (
                dashboardData.recentNotifications.map((notification, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        New assignment posted: {notification.title} in {notification.courses?.course_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent notifications found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
