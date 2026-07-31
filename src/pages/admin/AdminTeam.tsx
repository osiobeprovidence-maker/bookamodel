import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal';
import { useToast } from '../../components/ui/Toast';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Moderator' | 'Support Agent';
  lastActive: string;
};

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-amber-100 text-amber-700',
  Admin: 'bg-blue-100 text-blue-700',
  Moderator: 'bg-purple-100 text-purple-700',
  'Support Agent': 'bg-green-100 text-green-700',
};

const allRoles = ['Super Admin', 'Admin', 'Moderator', 'Support Agent'];

export default function AdminTeam() {
  const { showToast } = useToast();
  const data = useQuery(api.admin.listAdmins);
  const setUserRole = useMutation(api.users.setUserRole);
  const [localMembers, setLocalMembers] = useState<TeamMember[] | null>(null);
  useEffect(() => {
    if (data && localMembers === null) setLocalMembers(data as unknown as TeamMember[]);
  }, [data, localMembers]);
  const members = localMembers ?? [];
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const currentUser = 'current-admin-id';

  const handleInvite = (data: { name: string; email: string; role: TeamMember['role'] }) => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      lastActive: 'Just now',
    };
    setLocalMembers((prev) => (prev ? [...prev, newMember] : [newMember]));
    setShowInviteModal(false);
    showToast('Admin invited successfully', 'success');
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    setLocalMembers((prev) => (prev ? prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)) : prev));
    setUserRole({ userId: memberId as any, role: 'admin' });
    showToast('Role updated', 'success');
  };

  const handleRemove = () => {
    if (editingMember) {
      setLocalMembers((prev) => (prev ? prev.filter((m) => m.id !== editingMember) : prev));
      setShowConfirm(false);
      setEditingMember(null);
      showToast('Admin removed', 'success');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Invite Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[member.role]}`}>
                {member.role}
              </span>
              <span className="text-xs text-gray-400">{member.lastActive}</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                className="flex-1 border rounded-lg px-2 py-1.5 text-xs"
              >
                {allRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {member.id !== currentUser && (
                <button
                  onClick={() => {
                    setEditingMember(member.id);
                    setShowConfirm(true);
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Invite Admin</h3>
            <InviteForm
              onSave={handleInvite}
              onCancel={() => setShowInviteModal(false)}
            />
          </div>
        </div>
      )}

      {showConfirm && (
        <AdminConfirmModal
          isOpen={showConfirm}
          title="Remove Admin"
          message="Are you sure you want to remove this admin? This action cannot be undone."
          onConfirm={handleRemove}
          onClose={() => {
            setShowConfirm(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

function InviteForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { name: string; email: string; role: any }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded-lg px-3 py-2">
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({ name, email, role: role as any })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}
