
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeacherMarks = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Marks Management</h1>
        <p className="text-gray-500">Record and manage student academic performance.</p>

        <Card>
          <CardHeader>
            <CardTitle>Student Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Marks Management</h3>
              <p className="mt-1 text-gray-500">
                This section will allow teachers to input and manage student marks and grades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMarks;
