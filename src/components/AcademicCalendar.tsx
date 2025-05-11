
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type EventType = "holiday" | "exam" | "event";

interface Event {
  id: number;
  title: string;
  date: Date;
  type: EventType;
  description?: string;
}

const AcademicCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  // Fetch calendar events from supabase
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["academic-calendar-events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("academiccalendar")
          .select("*");

        if (error) {
          console.error("Error fetching events:", error);
          throw error;
        }

        // Convert to Event objects with proper dates and types
        return (data || []).map((event) => ({
          id: event.event_id,
          title: event.title || "Untitled Event",
          date: new Date(event.start_date || new Date()),
          type: determineEventType(event.title || ""),
          description: event.description,
        }));
      } catch (error) {
        console.error("Error in queryFn:", error);
        return [];
      }
    },
  });

  // Helper to determine event type based on title
  const determineEventType = (title: string): "holiday" | "exam" | "event" => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("holiday") || lowerTitle.includes("vacation")) {
      return "holiday";
    } else if (lowerTitle.includes("exam") || lowerTitle.includes("test")) {
      return "exam";
    }
    return "event";
  };

  useEffect(() => {
    if (selectedDate && events.length > 0) {
      // Filter events for the selected date
      const eventsForDate = events.filter(
        (event) =>
          event.date.getDate() === selectedDate.getDate() &&
          event.date.getMonth() === selectedDate.getMonth() &&
          event.date.getFullYear() === selectedDate.getFullYear()
      );
      setSelectedDateEvents(eventsForDate);
    } else {
      setSelectedDateEvents([]);
    }
  }, [selectedDate, events]);

  // Get badge color based on event type
  const getBadgeColor = (type: EventType) => {
    switch (type) {
      case "holiday":
        return "bg-red-500 hover:bg-red-600";
      case "exam":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "event":
      default:
        return "bg-edu-primary hover:bg-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 border-4 border-t-edu-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading calendar events. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiersClassNames={{
              selected: "bg-edu-primary text-white",
              today: "bg-accent text-accent-foreground",
            }}
            modifiers={{
              hasEvent: (date) => {
                return events.some(
                  (event) =>
                    event.date.getDate() === date.getDate() &&
                    event.date.getMonth() === date.getMonth() &&
                    event.date.getFullYear() === date.getFullYear()
                );
              },
            }}
            classNames={{
              day: "rounded-md hover:bg-gray-100",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Events for{" "}
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge className={getBadgeColor(event.type)}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 text-sm">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-6">
                <p>No events scheduled for this date</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicCalendar;
