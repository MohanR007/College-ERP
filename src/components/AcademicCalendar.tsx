
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarEvent {
  event_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export function AcademicCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  
  const { data: events = [] } = useQuery({
    queryKey: ['academic-calendar'],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const { data, error } = await supabase
        .from('academiccalendar')
        .select('*');
      
      if (error) {
        console.error("Error fetching academic calendar:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Function to highlight dates with events
  const getEventHighlight = (day: Date) => {
    const formattedDate = day.toISOString().split('T')[0];
    
    const hasEvent = events.some(event => {
      const startDate = new Date(event.start_date).toISOString().split('T')[0];
      const endDate = new Date(event.end_date).toISOString().split('T')[0];
      return formattedDate >= startDate && formattedDate <= endDate;
    });
    
    return hasEvent ? 'bg-blue-100 text-blue-900 font-medium' : '';
  };

  // Get events for the selected date
  const getEventsForSelectedDate = () => {
    if (!date) return [];
    
    const formattedDate = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const startDate = new Date(event.start_date).toISOString().split('T')[0];
      const endDate = new Date(event.end_date).toISOString().split('T')[0];
      return formattedDate >= startDate && formattedDate <= endDate;
    });
  };

  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Academic Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md"
                modifiersClassNames={{
                  selected: 'bg-edu-primary text-white',
                }}
                modifiersStyles={{
                  selected: { fontWeight: 'bold' },
                }}
                styles={{
                  day: (day) => ({
                    className: getEventHighlight(day.date),
                  }),
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-3">
                Events on {date?.toLocaleDateString()}
              </h3>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <Card key={event.event_id} className="overflow-hidden">
                      <div 
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors`}
                        onClick={() => setSelectedEvent(selectedEvent?.event_id === event.event_id ? null : event)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="text-xs text-gray-500">
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {selectedEvent?.event_id === event.event_id && (
                          <div className="mt-2 text-sm text-gray-600">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-md">
                  <p className="text-gray-500">No events scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
