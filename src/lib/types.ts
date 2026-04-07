export interface Booking {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  date: string;
  time: string;
  guests: number;
  message: string;
  service: string;
  duration?: string;
  status: "pending" | "approved" | "rejected";
  arrivalStatus?: "none" | "on-the-way" | "arrived";
  arrivalUpdatedAt?: string;
  locationLink?: string;
  adminNotes?: string;
  rescheduledFrom?: { date: string; time: string };
  createdAt: string;
  statusUpdatedAt?: string;
}
