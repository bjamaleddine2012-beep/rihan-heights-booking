export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
