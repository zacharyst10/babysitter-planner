import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Family Babysitting Planner
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A simple tool for coordinating grandparent babysitting schedules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle>For Grandparents</CardTitle>
            <CardDescription>Manage your babysitting schedule</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>Set your availability calendar</li>
              <li>Review and approve babysitting requests</li>
              <li>Manage your confirmed bookings</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/admin">Grandparent Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle>For Parents</CardTitle>
            <CardDescription>
              Request babysitting from grandparents
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
              <li>View when grandparents are available</li>
              <li>Request babysitting for specific dates and times</li>
              <li>Keep track of your upcoming babysitting sessions</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/availability">View Availability</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Need to request a babysitting session right away?
        </p>
        <Button variant="outline" asChild>
          <Link href="/request">Request Babysitting</Link>
        </Button>
      </div>
    </div>
  );
}
