
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const TeacherTimetable = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [activeDay, setActiveDay] = useState("Monday");

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['teacher-timetable', user?.user_id],
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

      // Get all courses taught by this faculty
      const { data: timetable } = await supabase
        .from('timetable')
        .select(`
          period,
          day_of_week,
          time_slot,
          courses (
            course_name
          ),
          sections (
            name
          )
        `)
        .eq('courses.faculty_id', facultyData.faculty_id)
        .order('period');

      return timetable;
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

  // Mobile view - displays one day at a time
  const renderMobileView = () => {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <Tabs defaultValue={activeDay} onValueChange={setActiveDay} className="w-full mt-2">
            <TabsList className="w-full overflow-x-auto flex flex-nowrap">
              {days.map((day) => (
                <TabsTrigger key={day} value={day} className="flex-shrink-0">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
              const slots = timetableData?.filter(
                t => t.period === period && t.day_of_week === activeDay
              );
              
              if (!slots || slots.length === 0) return null;
              
              return (
                <Card key={period} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Period {period}</h3>
                      <span className="text-sm text-gray-500">{slots[0]?.time_slot || '-'}</span>
                    </div>
                    <div className="space-y-2">
                      {slots.map((slot, idx) => (
                        <div key={idx} className="border-l-4 border-edu-primary pl-2">
                          <div className="font-medium">{slot.courses?.course_name}</div>
                          {slot.sections?.name && (
                            <div className="text-sm text-gray-500">
                              Section {slot.sections.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!timetableData?.some(t => t.day_of_week === activeDay) && (
              <div className="text-center py-8 text-gray-500">No classes scheduled for {activeDay}</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop view - full table layout
  const renderDesktopView = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Time</TableHead>
                {days.map((day) => (
                  <TableHead key={day}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                <TableRow key={period}>
                  <TableCell className="font-medium">{period}</TableCell>
                  <TableCell>
                    {timetableData?.find(t => t.period === period)?.time_slot || '-'}
                  </TableCell>
                  {days.map((day) => {
                    const slots = timetableData?.filter(
                      t => t.period === period && t.day_of_week === day
                    );
                    return (
                      <TableCell key={day} className="min-w-[150px]">
                        {slots && slots.length > 0 ? (
                          <div className="space-y-2">
                            {slots.map((slot, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="font-medium">{slot.courses?.course_name}</div>
                                {slot.sections?.name && (
                                  <div className="text-sm text-gray-500">
                                    Section {slot.sections.name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Teaching Schedule</h1>
        
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTimetable;
