export interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
