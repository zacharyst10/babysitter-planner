import { Resend } from "resend";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { parents, babysitters, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define types for props
type BookingType = typeof bookings.$inferSelect;
type ParentType = typeof parents.$inferSelect;
type BabysitterType = typeof babysitters.$inferSelect;

// Email Template Component
const BookingConfirmationEmail = ({
  booking,
  parent,
  babysitter,
}: {
  booking: BookingType;
  parent: ParentType;
  babysitter: BabysitterType;
}) => {
  const formattedDate = format(new Date(booking.date), "MMMM dd, yyyy");
  const startTime = format(
    new Date(`2000-01-01T${booking.startTime}`),
    "h:mm a"
  );
  const endTime = format(new Date(`2000-01-01T${booking.endTime}`), "h:mm a");

  return (
    <Html>
      <Head />
      <Preview>Your babysitting booking is confirmed</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Booking Confirmed!</Heading>
          <Text style={styles.text}>Hello {parent.name},</Text>
          <Text style={styles.text}>
            Your babysitting appointment with {babysitter.name} has been
            confirmed for:
          </Text>

          <Section style={styles.details}>
            <Text style={styles.detailItem}>
              <strong>Date:</strong> {formattedDate}
            </Text>
            <Text style={styles.detailItem}>
              <strong>Time:</strong> {startTime} - {endTime}
            </Text>
            <Text style={styles.detailItem}>
              <strong>Babysitter:</strong> {babysitter.name}
            </Text>
            {booking.notes && (
              <Text style={styles.detailItem}>
                <strong>Notes:</strong> {booking.notes}
              </Text>
            )}
          </Section>

          <Text style={styles.text}>
            If you need to make any changes to your booking, please contact us
            or visit your dashboard.
          </Text>

          <Button
            href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
            style={styles.button}
          >
            View Booking
          </Button>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Questions? Reply to this email or contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "600px",
  },
  heading: {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
  },
  text: {
    color: "#333",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  },
  details: {
    backgroundColor: "#ffffff",
    borderRadius: "5px",
    padding: "20px",
    margin: "20px 0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  detailItem: {
    margin: "10px 0",
  },
  button: {
    backgroundColor: "#5850EC",
    borderRadius: "5px",
    color: "#fff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "20px 0",
    padding: "12px 20px",
    textDecoration: "none",
    textAlign: "center" as const,
  },
  hr: {
    borderColor: "#ddd",
    margin: "20px 0",
  },
  footer: {
    color: "#8898aa",
    fontSize: "14px",
    margin: "20px 0",
  },
};

// Function to send email
export async function sendBookingConfirmationEmail(booking: BookingType) {
  try {
    // Get parent and babysitter data
    const [parent] = await db
      .select()
      .from(parents)
      .where(eq(parents.id, booking.parentId));
    const [babysitter] = await db
      .select()
      .from(babysitters)
      .where(eq(babysitters.id, booking.babysitterId));

    if (!parent || !babysitter) {
      throw new Error("Parent or babysitter not found");
    }

    await resend.emails.send({
      from: "bookings@babysitting-planner.com",
      to: parent.email,
      subject: "Your Babysitting Booking is Confirmed",
      react: BookingConfirmationEmail({ booking, parent, babysitter }),
    });

    // Optional: Also send to babysitter
    await resend.emails.send({
      from: "bookings@babysitting-planner.com",
      to: babysitter.email,
      subject: "New Babysitting Booking Confirmed",
      react: BookingConfirmationEmail({ booking, parent, babysitter }),
    });

    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return false;
  }
}
