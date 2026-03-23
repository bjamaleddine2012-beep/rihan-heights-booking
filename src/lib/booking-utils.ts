/**
 * Check if a booking has ended (past 10 PM on the booking date).
 * Uses the booking's date and optionally time fields.
 */
export function isBookingEnded(bookingDate: string, bookingTime?: string): boolean {
  if (!bookingDate) return false;

  // Build a Date object for 10:00 PM on the booking date
  const endTime = new Date(`${bookingDate}T22:00:00`);

  // If the booking has a specific time and it's before 10 PM,
  // we still consider it ended at 10 PM that day
  return new Date() > endTime;
}

/**
 * Get the effective display status of a booking.
 * Returns "ended" if the booking date is past 10 PM, otherwise the real status.
 */
export function getDisplayStatus(
  status: string,
  bookingDate: string,
  bookingTime?: string
): string {
  if (isBookingEnded(bookingDate, bookingTime)) {
    return "ended";
  }
  return status;
}
