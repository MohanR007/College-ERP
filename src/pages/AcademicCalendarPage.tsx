
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { AcademicCalendar } from "@/components/AcademicCalendar";

const AcademicCalendarPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Academic Calendar</h1>
          <p className="text-gray-500">View upcoming academic events and important dates</p>
        </div>
        
        <AcademicCalendar />
      </div>
    </DashboardLayout>
  );
};

export default AcademicCalendarPage;
