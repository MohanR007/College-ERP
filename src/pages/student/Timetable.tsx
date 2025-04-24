
import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const StudentTimetable = () => {
  const { user } = useAuth();
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['student-timetable', user?.user_id],
    queryFn: async () => {
      // First get the student's section
      const { data: studentData } = await supabase
        .from('students')
        .select('section_id')
        .eq('user_id', user?.user_id)
        .single();

      if (!studentData?.section_id) {
        throw new Error('Section not found');
      }

      // Then get the timetable for that section
      const { data: timetable } = await supabase
        .from('timetable')
        .select(`
          period,
          day_of_week,
          time_slot,
          courses (
            course_name,
            faculty_id,
            faculty (
              name
            )
          )
        `)
        .eq('section_id', studentData.section_id)
        .order('period');

      return timetable;
    },
    enabled: !!user
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Timetable</h1>

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
                      const slot = timetableData?.find(
                        t => t.period === period && t.day_of_week === day
                      );
                      return (
                        <TableCell key={day} className="min-w-[150px]">
                          {slot ? (
                            <div className="space-y-1">
                              <div className="font-medium">{slot.courses?.course_name}</div>
                              <div className="text-sm text-gray-500">
                                {slot.courses?.faculty?.name}
                              </div>
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

export default StudentTimetable;
