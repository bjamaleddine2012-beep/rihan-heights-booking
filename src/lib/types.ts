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
  status: "pending" | "approved" | "rejected";
  recurrence?: "none" | "weekly" | "biweekly" | "monthly";
  parentBookingId?: string;
  arrivalStatus?: "none" | "left-home" | "on-the-way" | "arrived";
  arrivalUpdatedAt?: string;
  locationLink?: string;
  latitude?: number;
  longitude?: number;
  locationSharingActive?: boolean;
  createdAt: string;
  statusUpdatedAt?: string;
}
