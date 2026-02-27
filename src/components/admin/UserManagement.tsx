import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';
import type { Profile, UserRole } from '../../lib/database.types';
import { Check, X, Loader2 } from 'lucide-react';

const ROLES: UserRole[] = ['pending', 'staff', 'researcher', 'executive', 'external', 'admin'];

const ROLE_LABELS: Record<UserRole, string> = {
  pending: 'รอการอนุมัติ',
  staff: 'เจ้าหน้าที่',
  researcher: 'นักวิจัย',
  executive: 'ผู้บริหาร',
  external: 'บุคคลภายนอก',
  admin: 'ผู้ดูแลระบบ',
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    setSaving(id);
    await supabase.from('profiles').update(updates).eq('id', id);
    await fetchUsers();
    setSaving(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#2d5a27]" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ชื่อ', 'อีเมล', 'ตำแหน่ง', 'บทบาท', 'อนุมัติ', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.fullname}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.position ?? '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={saving === u.id}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      // Assigning any non-pending role implicitly approves the account;
                      // reverting to pending revokes approval.
                      const updates: Partial<Profile> = { role: newRole };
                      updates.approved = newRole !== 'pending';
                      updateUser(u.id, updates);
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateUser(u.id, { approved: !u.approved })}
                    disabled={saving === u.id}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      u.approved
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {saving === u.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : u.approved ? (
                      <><Check size={12} /> อนุมัติแล้ว</>
                    ) : (
                      <><X size={12} /> รออนุมัติ</>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('th-TH')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
