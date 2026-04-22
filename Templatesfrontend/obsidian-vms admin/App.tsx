import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, MoreHorizontal, FileText, 
  CheckCircle, Clock, XCircle, Search, Filter, Bell, Wrench
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GlassCard } from './components/GlassCard';
import { ViewState, User, Booking, Mechanic, Payment, Feedback, Complaint } from './types';

// --- MOCK DATA ---
const REVENUE_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5500 },
  { name: 'Apr', value: 4800 },
  { name: 'May', value: 7000 },
  { name: 'Jun', value: 6500 },
  { name: 'Jul', value: 8500 },
];

const VEHICLE_STATUS_DATA = [
  { name: 'In Service', value: 12 },
  { name: 'Completed', value: 25 },
  { name: 'Pending', value: 8 },
  { name: 'Delivered', value: 45 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

const RECENT_FILES = [
  { name: 'Monthly_Report_May.pdf', size: '2.4 MB', type: 'PDF' },
  { name: 'Mechanic_Payroll.xlsx', size: '1.1 MB', type: 'XLS' },
  { name: 'Q2_Revenue_Analysis.pdf', size: '4.8 MB', type: 'PDF' },
  { name: 'Customer_Feedback_Log.csv', size: '800 KB', type: 'CSV' },
  { name: 'Inventory_Audit_2024.docx', size: '1.5 MB', type: 'DOC' },
];

// --- COMPONENTS FOR VIEWS ---

const StatBadge: React.FC<{ trend: number }> = ({ trend }) => (
  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
    {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
    {Math.abs(trend)}%
  </div>
);

const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <header className="flex justify-between items-center mb-8">
    <div>
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-neutral-400 mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-4">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 w-64 transition-all"
        />
        <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
      </div>
      <button className="p-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all relative">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      </button>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/10 overflow-hidden">
        <img src="https://picsum.photos/100/100" alt="Admin" className="w-full h-full object-cover opacity-90" />
      </div>
    </div>
  </header>
);

const TableHeader: React.FC<{ columns: string[] }> = ({ columns }) => (
  <thead className="text-xs uppercase text-neutral-500 font-semibold border-b border-white/5">
    <tr>
      {columns.map((col, i) => (
        <th key={i} className="px-6 py-4 text-left tracking-wider">{col}</th>
      ))}
      <th className="px-6 py-4 text-right">Action</th>
    </tr>
  </thead>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'mechanics':
        return <MechanicListView />;
      case 'bookings':
        return <BookingListView />;
      case 'users':
        return <UserListView />;
      case 'payments':
        return <PaymentsView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'feedbacks':
        return <FeedbacksView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-neutral-200 font-sans selection:bg-indigo-500/30">
      <Sidebar currentView={activeView} onChangeView={setActiveView} />
      <main className="flex-1 ml-72 p-8 overflow-y-auto h-screen relative">
        {/* Ambient background glows */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView() {
  return (
    <div className="space-y-6">
      <Header title="Main Dashboard" subtitle="Real-time overview of your vehicle management system." />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue this month', value: '$24,050.47', trend: 12.5, icon: TrendingUp },
          { label: 'Total Bookings', value: '142', trend: 4.3, icon: CheckCircle },
          { label: 'Active Mechanics', value: '18', trend: 0, icon: Wrench },
          { label: 'Pending Reports', value: '7', trend: -2.1, icon: FileText },
        ].map((stat, i) => (
          <GlassCard key={i} className="flex flex-col justify-between h-32 hover:scale-[1.02] cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-white/5 text-indigo-400">
                <stat.icon size={20} />
              </div>
              <StatBadge trend={stat.trend} />
            </div>
            <div>
              <div className="text-neutral-400 text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid: Charts & Folder/File Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Main Revenue Chart */}
        <GlassCard className="lg:col-span-2 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
              <p className="text-sm text-neutral-500">Year to Date performance</p>
            </div>
            <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-neutral-300 border border-white/10 transition-colors">
              Download Report
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right Col: Secondary Chart + "Folder" aesthetic */}
        <div className="space-y-6">
          <GlassCard className="h-[280px]">
            <h3 className="text-lg font-bold text-white mb-4">Vehicle Status</h3>
            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VEHICLE_STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {VEHICLE_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#000', borderRadius: '8px', border: '1px solid #333' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">90</span>
                <span className="text-xs text-neutral-500 uppercase">Total</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Service
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Done
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Section: File Manager / Reports ("Files downwards") */}
      <GlassCard title="Recent Files" className="overflow-visible">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">System Reports & Files</h3>
          <Filter size={18} className="text-neutral-500 hover:text-white cursor-pointer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {RECENT_FILES.map((file, i) => (
            <div key={i} className="group p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg
                ${file.type === 'PDF' ? 'bg-red-500/20 text-red-400' : 
                  file.type === 'XLS' ? 'bg-emerald-500/20 text-emerald-400' :
                  file.type === 'CSV' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-indigo-500/20 text-indigo-400'
                }
              `}>
                {file.type}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200 truncate w-full group-hover:text-indigo-300 transition-colors">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function MechanicListView() {
  const mechanics: Mechanic[] = [
    { id: '1', name: 'Alex Corvis', email: 'alex@obsidian.vms', role: 'Mechanic', status: 'Active', specialty: 'Engine Diagnostics', rating: 4.8, jobsCompleted: 124, avatar: 'https://picsum.photos/id/64/100/100' },
    { id: '2', name: 'Sarah Connor', email: 'sarah@obsidian.vms', role: 'Mechanic', status: 'Active', specialty: 'Transmission', rating: 4.9, jobsCompleted: 98, avatar: 'https://picsum.photos/id/65/100/100' },
    { id: '3', name: 'Mike Ross', email: 'mike@obsidian.vms', role: 'Mechanic', status: 'Inactive', specialty: 'Body Work', rating: 4.5, jobsCompleted: 45, avatar: 'https://picsum.photos/id/91/100/100' },
  ];

  return (
    <div className="space-y-6">
      <Header title="Mechanic List" subtitle="Manage your technical staff." />
      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <TableHeader columns={['Mechanic', 'Specialty', 'Rating', 'Jobs', 'Status']} />
          <tbody className="divide-y divide-white/5">
            {mechanics.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={m.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-neutral-500 text-xs">{m.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-300">{m.specialty}</td>
                <td className="px-6 py-4 text-amber-400 font-bold flex items-center gap-1">★ {m.rating}</td>
                <td className="px-6 py-4 text-neutral-300">{m.jobsCompleted}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-500'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-full text-neutral-500 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

function BookingListView() {
  const bookings: Booking[] = [
    { id: 'BK-001', customerName: 'John Doe', vehicle: 'Tesla Model S', serviceType: 'Full Service', date: '2023-10-25', status: 'In Progress', amount: '$450' },
    { id: 'BK-002', customerName: 'Jane Smith', vehicle: 'BMW X5', serviceType: 'Oil Change', date: '2023-10-24', status: 'Completed', amount: '$120' },
    { id: 'BK-003', customerName: 'Robert Johnson', vehicle: 'Ford Mustang', serviceType: 'Tire Replacement', date: '2023-10-26', status: 'Pending', amount: '$800' },
  ];

  return (
    <div className="space-y-6">
      <Header title="All Bookings" subtitle="Track service appointments." />
      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <TableHeader columns={['ID', 'Customer', 'Vehicle', 'Service', 'Date', 'Amount', 'Status']} />
          <tbody className="divide-y divide-white/5">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-neutral-500">{b.id}</td>
                <td className="px-6 py-4 font-medium text-white">{b.customerName}</td>
                <td className="px-6 py-4 text-neutral-300">{b.vehicle}</td>
                <td className="px-6 py-4 text-neutral-300">{b.serviceType}</td>
                <td className="px-6 py-4 text-neutral-400">{b.date}</td>
                <td className="px-6 py-4 font-bold text-white">{b.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      b.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }
                  `}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-400 hover:text-white">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

function UserListView() {
  const users: User[] = [
      { id: 'U-1', name: 'Alice Walker', email: 'alice@gmail.com', role: 'User', status: 'Active', avatar: 'https://picsum.photos/id/101/100/100' },
      { id: 'U-2', name: 'Bob Martin', email: 'bob.m@yahoo.com', role: 'User', status: 'Inactive', avatar: 'https://picsum.photos/id/102/100/100' },
  ]
  return (
     <div className="space-y-6">
      <Header title="User List" subtitle="Registered customer accounts." />
      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <TableHeader columns={['User', 'Role', 'Status', 'Last Login']} />
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
               <tr key={u.id} className="hover:bg-white/5 transition-colors group">
               <td className="px-6 py-4 flex items-center gap-3">
                 <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                 <div>
                   <div className="font-semibold text-white">{u.name}</div>
                   <div className="text-neutral-500 text-xs">{u.email}</div>
                 </div>
               </td>
               <td className="px-6 py-4 text-neutral-300">{u.role}</td>
               <td className="px-6 py-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-900/20 text-red-500'}`}>
                   {u.status}
                 </span>
               </td>
               <td className="px-6 py-4 text-neutral-500">2 hours ago</td>
               <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-full text-neutral-500 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
               </td>
             </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}

function FeedbacksView() {
    return (
        <div className="space-y-6">
            <Header title="Customer Feedbacks" subtitle="Recent reviews and ratings." />
            <div className="grid gap-4">
                {[1,2,3].map(i => (
                    <GlassCard key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <img src={`https://picsum.photos/id/${200+i}/50/50`} className="w-8 h-8 rounded-full" alt="" />
                                <span className="text-white font-medium">Customer #{i}</span>
                            </div>
                            <div className="text-amber-400 text-sm">★★★★★</div>
                        </div>
                        <p className="text-neutral-400 text-sm mt-2">
                            "Excellent service! The mechanics were very professional and fixed my engine issue quickly. The deep black dashboard they used to show me the report was cool too!"
                        </p>
                        <div className="text-xs text-neutral-600 mt-2">Posted 2 days ago</div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

function ComplaintsView() {
    return (
        <div className="space-y-6">
            <Header title="View Complaints" subtitle="Support tickets and issues." />
            <GlassCard noPadding>
                <div className="p-6 text-center text-neutral-500 italic">No open complaints found. Good job!</div>
            </GlassCard>
        </div>
    )
}

function PaymentsView() {
    return (
        <div className="space-y-6">
            <Header title="All Payments" subtitle="Transaction history." />
             <GlassCard noPadding className="overflow-hidden">
                <table className="w-full text-sm text-left">
                <TableHeader columns={['Transaction ID', 'Amount', 'Method', 'Date', 'Status']} />
                <tbody className="divide-y divide-white/5">
                    {[1,2,3,4].map((i) => (
                        <tr key={i} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-mono text-neutral-400">TXN-8842-{i}</td>
                            <td className="px-6 py-4 text-white font-bold">$125.00</td>
                            <td className="px-6 py-4 text-neutral-300">Credit Card</td>
                            <td className="px-6 py-4 text-neutral-500">Oct 24, 2023</td>
                            <td className="px-6 py-4"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs">Paid</span></td>
                            <td className="px-6 py-4 text-right text-neutral-500">...</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </GlassCard>
        </div>
    )
}