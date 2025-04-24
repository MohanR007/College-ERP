
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentTimetable = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Student Timetable</h1>
        <p className="text-gray-500">View your class schedule and important dates.</p>

        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Class Schedule</h3>
              <p className="mt-1 text-gray-500">
                This section will display your weekly class schedule and important academic events.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;
