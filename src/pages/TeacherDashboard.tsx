
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.email}. Here's an overview of your activities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Assignments that need grading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your scheduled classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">4</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Pending student leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-edu-primary">3</p>
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
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Updated attendance for CS101</p>
                  <p className="text-sm text-gray-500">Today, 10:30 AM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Posted assignment: Database Design Project</p>
                  <p className="text-sm text-gray-500">Yesterday, 2:45 PM</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Added marks for Programming Quiz</p>
                  <p className="text-sm text-gray-500">May 23, 4:20 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
