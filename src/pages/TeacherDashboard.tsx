
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const TeacherDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['teacher-dashboard', user?.user_id],
    queryFn: async () => {
      // Get faculty ID
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('faculty_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!facultyData?.faculty_id) {
        throw new Error('Faculty not found');
      }

      // Get courses taught by this faculty
      const { data: courses } = await supabase
        .from('courses')
        .select('course_id')
        .eq('faculty_id', facultyData.faculty_id);
      
      // Get today's classes
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];
      
      const { data: todaysClasses } = await supabase
        .from('timetable')
        .select('*')
        .eq('courses.faculty_id', facultyData.faculty_id)
        .eq('day_of_week', today);
      
      // Get pending assignments
      const { data: pendingAssignments } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', (courses || []).map(c => c.course_id))
        .gt('due_date', new Date().toISOString().split('T')[0]);
      
      // Get leave requests
      const { data: leaveRequests } = await supabase
        .from('leaveapplications')
        .select('*')
        .eq('status', 'Pending');
      
      // Get recent activities
      const { data: recentActivities } = await supabase
        .from('assignments')
        .select('title, created_at, course_id, courses(course_name)')
        .in('course_id', (courses || []).map(c => c.course_id))
        .order('created_at', { ascending: false })
        .limit(3);
      
      return {
        pendingAssignments: pendingAssignments?.length || 0,
        todaysClasses: todaysClasses?.length || 0,
        leaveRequests: leaveRequests?.length || 0,
        recentActivities: recentActivities || []
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
        <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">
          {/* Display user's name instead of email */}
          Welcome back, {user?.name || user?.email}. Here's an overview of your activities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Assignments that need grading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">{dashboardData?.pendingAssignments}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Pending student leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">{dashboardData?.leaveRequests}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Posted assignment: {activity.title} for {activity.courses?.course_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent activities found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
