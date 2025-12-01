"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/api";
import { User } from "@/lib/types";
import Toast from "@/components/shared/Toast";
// Note: You might need to add getAllUsers to userApi in lib/api.ts if not exists
// For now assuming it exists or I will update it later

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Assuming an endpoint exists, if not I need to add it
      // For now, using a placeholder or if API doesn't support it, I'll handle gracefully
      // const response = await userApi.getAll();
      // setUsers(response.data.data.users || []);

      // Since userApi.getAll might not exist yet based on previous file reads,
      // I will leave this empty or mockup for now until backend supports it.
      // Real implementation would need a backend endpoint for listing users.
      setUsers([]);
      setLoading(false);
    } catch (error) {
      // setToast({ message: 'Gagal memuat pengguna', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="font-bold text-yellow-900 mb-1">
              Fitur dalam pengembangan
            </h4>
            <p className="text-yellow-700 text-sm">
              Halaman manajemen pengguna memerlukan endpoint backend tambahan
              untuk menampilkan daftar semua pengguna. Saat ini fitur ini belum
              tersedia sepenuhnya.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-50 pointer-events-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bergabung
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Data tidak tersedia
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
