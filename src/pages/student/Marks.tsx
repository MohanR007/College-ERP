
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentMarks = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Academic Performance</h1>
        <p className="text-gray-500">View your grades, marks, and academic progress.</p>

        <Card>
          <CardHeader>
            <CardTitle>Grade Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Academic Records</h3>
              <p className="mt-1 text-gray-500">
                This section will display your grades across different subjects, exams, and assignments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentMarks;
