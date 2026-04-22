export interface Metric {
  label: string;
  value: string;
  trend: number;
  icon: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Mechanic';
  status: 'Active' | 'Inactive';
  avatar: string;
}

export interface Mechanic extends User {
  specialty: string;
  rating: number;
  jobsCompleted: number;
}

export interface Booking {
  id: string;
  customerName: string;
  vehicle: string;
  serviceType: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: string;
  method: string;
  date: string;
  status: 'Paid' | 'Failed' | 'Refunded';
}

export interface Feedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved';
}

export type ViewState = 
  | 'dashboard' 
  | 'mechanics' 
  | 'users' 
  | 'feedbacks' 
  | 'complaints' 
  | 'bookings' 
  | 'payments';
