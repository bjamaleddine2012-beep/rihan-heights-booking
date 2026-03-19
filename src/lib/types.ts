export interface Booking {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  statusUpdatedAt?: string;
}
