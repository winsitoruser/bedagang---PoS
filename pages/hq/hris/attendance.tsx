import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { 
  Calendar, Clock, UserCheck, UserX, Users, TrendingUp,
  Building2, Filter, Download, Search, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Coffee
} from 'lucide-react';

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  branchName: string;
  position: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
  workFromHome: number;
  totalDays: number;
  attendanceRate: number;
}

interface BranchSummary {
  branchId: string;
  branchName: string;
  totalEmployees: number;
  avgAttendance: number;
  onTimeRate: number;
  lateRate: number;
  absentRate: number;
}

const mockAttendance: AttendanceRecord[] = [
  { employeeId: '1', employeeName: 'Ahmad Wijaya', branchName: 'Cabang Pusat Jakarta', position: 'Branch Manager', present: 20, late: 1, absent: 0, leave: 1, workFromHome: 0, totalDays: 22, attendanceRate: 95.5 },
  { employeeId: '2', employeeName: 'Siti Rahayu', branchName: 'Cabang Bandung', position: 'Branch Manager', present: 19, late: 2, absent: 0, leave: 1, workFromHome: 0, totalDays: 22, attendanceRate: 90.9 },
  { employeeId: '3', employeeName: 'Budi Santoso', branchName: 'Cabang Surabaya', position: 'Branch Manager', present: 18, late: 3, absent: 1, leave: 0, workFromHome: 0, totalDays: 22, attendanceRate: 81.8 },
  { employeeId: '4', employeeName: 'Dewi Lestari', branchName: 'Cabang Pusat Jakarta', position: 'Supervisor', present: 21, late: 0, absent: 0, leave: 1, workFromHome: 0, totalDays: 22, attendanceRate: 95.5 },
  { employeeId: '5', employeeName: 'Eko Prasetyo', branchName: 'Cabang Pusat Jakarta', position: 'Kasir Senior', present: 22, late: 0, absent: 0, leave: 0, workFromHome: 0, totalDays: 22, attendanceRate: 100 },
  { employeeId: '6', employeeName: 'Fitri Handayani', branchName: 'Cabang Bandung', position: 'Kasir', present: 20, late: 1, absent: 1, leave: 0, workFromHome: 0, totalDays: 22, attendanceRate: 90.9 },
  { employeeId: '7', employeeName: 'Gunawan', branchName: 'Gudang Pusat', position: 'Staff Gudang', present: 19, late: 2, absent: 1, leave: 0, workFromHome: 0, totalDays: 22, attendanceRate: 86.4 },
  { employeeId: '8', employeeName: 'Hendra Kusuma', branchName: 'Cabang Surabaya', position: 'Kasir', present: 15, late: 3, absent: 2, leave: 2, workFromHome: 0, totalDays: 22, attendanceRate: 68.2 },
];

const mockBranchSummary: BranchSummary[] = [
  { branchId: '1', branchName: 'Cabang Pusat Jakarta', totalEmployees: 25, avgAttendance: 96.5, onTimeRate: 94.2, lateRate: 4.5, absentRate: 1.3 },
  { branchId: '2', branchName: 'Cabang Bandung', totalEmployees: 18, avgAttendance: 93.2, onTimeRate: 91.5, lateRate: 6.2, absentRate: 2.3 },
  { branchId: '3', branchName: 'Cabang Surabaya', totalEmployees: 15, avgAttendance: 88.5, onTimeRate: 85.3, lateRate: 8.5, absentRate: 6.2 },
  { branchId: '4', branchName: 'Cabang Medan', totalEmployees: 12, avgAttendance: 91.8, onTimeRate: 89.5, lateRate: 7.2, absentRate: 3.3 },
  { branchId: '5', branchName: 'Cabang Yogyakarta', totalEmployees: 10, avgAttendance: 94.5, onTimeRate: 92.8, lateRate: 5.5, absentRate: 1.7 },
];

export default function AttendancePage() {
  const [mounted, setMounted] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [branchSummary, setBranchSummary] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/hris/attendance?period=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || mockAttendance);
        setBranchSummary(data.branchSummary || mockBranchSummary);
      } else {
        setAttendance(mockAttendance);
        setBranchSummary(mockBranchSummary);
      }
    } catch (error) {
      setAttendance(mockAttendance);
      setBranchSummary(mockBranchSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [selectedMonth]);

  if (!mounted) return null;

  const totalEmployees = attendance.length;
  const avgAttendance = attendance.reduce((sum, a) => sum + a.attendanceRate, 0) / totalEmployees || 0;
  const perfectAttendance = attendance.filter(a => a.attendanceRate === 100).length;
  const lowAttendance = attendance.filter(a => a.attendanceRate < 80).length;

  const filteredAttendance = attendance.filter(a => {
    const matchSearch = a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       a.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBranch = branchFilter === 'all' || a.branchName === branchFilter;
    return matchSearch && matchBranch;
  });

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 bg-green-100';
    if (rate >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const branches = [...new Set(attendance.map(a => a.branchName))];

  return (
    <HQLayout title="Kehadiran Karyawan" subtitle="Monitoring absensi dan kehadiran seluruh karyawan">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>
                <p className="text-xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata Kehadiran</p>
                <p className="text-xl font-bold">{avgAttendance.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Perfect Attendance</p>
                <p className="text-xl font-bold">{perfectAttendance}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Attendance</p>
                <p className="text-xl font-bold">{lowAttendance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Ringkasan per Cabang</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {branchSummary.map((branch) => (
              <div key={branch.branchId} className="border rounded-lg p-4 hover:shadow-md transition-all">
                <h4 className="font-medium text-gray-900 text-sm">{branch.branchName}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Karyawan:</span>
                    <span className="font-medium">{branch.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kehadiran:</span>
                    <span className={`font-medium ${branch.avgAttendance >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {branch.avgAttendance}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tepat Waktu:</span>
                    <span className="font-medium">{branch.onTimeRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Terlambat:</span>
                    <span className="font-medium text-yellow-600">{branch.lateRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2 items-center">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                />
              </div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Semua Cabang</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tidak Hadir</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cuti</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tingkat Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAttendance.map((record) => (
                  <tr key={record.employeeId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{record.employeeName}</p>
                        <p className="text-sm text-gray-500">{record.position}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.branchName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        {record.present}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        {record.late}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-red-600">
                        <UserX className="w-4 h-4" />
                        {record.absent}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-blue-600">
                        <Coffee className="w-4 h-4" />
                        {record.leave}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{record.totalDays}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(record.attendanceRate)}`}>
                        {record.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
