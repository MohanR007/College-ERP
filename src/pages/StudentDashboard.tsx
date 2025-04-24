
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.email}. Here's an overview of your academic status.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignments Due</CardTitle>
              <CardDescription>Upcoming assignment deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Your current attendance percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">92%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your scheduled classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">3</p>
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
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">New assignment posted in CS301</p>
                  <p className="text-sm text-gray-500">Today, 9:30 AM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Quiz grades uploaded for MT101</p>
                  <p className="text-sm text-gray-500">Yesterday, 3:15 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Class rescheduled: CS250 moved to Room 302</p>
                  <p className="text-sm text-gray-500">May 22, 5:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
