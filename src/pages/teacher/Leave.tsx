
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeacherLeave = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
        <p className="text-gray-500">Review and approve student leave applications.</p>

        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
              <p className="mt-1 text-gray-500">
                This section will allow teachers to review and process student leave requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherLeave;
