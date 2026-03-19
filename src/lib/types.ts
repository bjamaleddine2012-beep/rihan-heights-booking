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
  arrivalStatus?: "none" | "left-home" | "on-the-way" | "arrived";
  arrivalUpdatedAt?: string;
  locationLink?: string;
  createdAt: string;
  statusUpdatedAt?: string;
}
