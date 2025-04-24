
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentAssignments = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
        <p className="text-gray-500">View and submit your assignments.</p>

        <Card>
          <CardHeader>
            <CardTitle>Assignment List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Assignment Portal</h3>
              <p className="mt-1 text-gray-500">
                This section will display your pending and submitted assignments, along with deadlines and grades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
