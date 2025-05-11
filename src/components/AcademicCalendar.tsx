
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: number;
  title: string;
  date: Date | string;
  type: "holiday" | "exam" | "event";
  description?: string;
}

const AcademicCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>(
    []
  );

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["academic-calendar-events"],
    queryFn: async () => {
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
      const eventsOnThisDate = events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setEventsForSelectedDate(eventsOnThisDate);
    } else {
      setEventsForSelectedDate([]);
    }
  }, [selectedDate, events]);

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case "holiday":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "exam":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "event":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Function to determine if a date has events
  const getDayClass = (day: Date): string => {
    if (!events || events.length === 0) return "";

    const hasEvent = events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });

    return hasEvent ? "bg-blue-100 text-blue-900 font-medium" : "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Academic Calendar</CardTitle>
          <CardDescription>
            Browse important academic dates and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
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
                if (!events || events.length === 0) return false;
                return events.some((event) => {
                  const eventDate = new Date(event.date);
                  return (
                    eventDate.getDate() === date.getDate() &&
                    eventDate.getMonth() === date.getMonth() &&
                    eventDate.getFullYear() === date.getFullYear()
                  );
                });
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
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
          <CardDescription>
            {eventsForSelectedDate.length === 0
              ? "No events scheduled"
              : `${eventsForSelectedDate.length} event${
                  eventsForSelectedDate.length !== 1 ? "s" : ""
                } scheduled`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="h-6 w-6 border-2 border-t-edu-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg bg-gray-50 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge className={getEventBadgeClass(event.type)}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for this date.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicCalendar;
