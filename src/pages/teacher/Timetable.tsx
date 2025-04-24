
import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TeacherTimetable = () => {
  const { user } = useAuth();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Teaching Schedule</h1>

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
                                  <div className="text-sm text-gray-500">
                                    Section: {slot.sections?.name}
                                  </div>
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
      </div>
    </DashboardLayout>
  );
};

export default TeacherTimetable;
