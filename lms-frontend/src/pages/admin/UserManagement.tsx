import { useState } from 'react'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '../../hooks/useUsers'
import type { User, Role } from '../../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function roleBadge(role: Role) {
  const map: Record<Role, 'info' | 'success' | 'default'> = {
    ADMIN: 'danger' as 'info',
    LECTURER: 'info',
    STUDENT: 'default',
  }
  return <Badge variant={map[role]}>{role}</Badge>
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'STUDENT', label: 'Student' },
]

// ─── Create / Edit form ───────────────────────────────────────────────────────

interface UserFormProps {
  initial?: User
  onSave: (data: { name: string; email: string; password: string; role: Role }) => void
  loading: boolean
  error: string
}

function UserForm({ initial, onSave, loading, error }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(initial?.role ?? 'STUDENT')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ name, email, password, role })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label={initial ? 'New password (leave blank to keep)' : 'Password'}
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!initial}
            placeholder={initial ? '••••••••' : ''}
          />
        </div>
        <Button 
          type="button" 
          variant="secondary" 
          className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          onClick={() => setPassword(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))}
          title="Auto-generate password"
        >
          Generate
        </Button>
      </div>
      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        options={ROLE_OPTIONS}
      />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/30 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create user'}
        </Button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function UserManagement() {
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [page, setPage] = useState(1)
  const LIMIT = 15

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [mutationError, setMutationError] = useState('')
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string, role: string } | null>(null)

  const { data, isLoading, isError } = useUsers({
    role: roleFilter || undefined,
    page,
    limit: LIMIT,
  })

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const toast = useToast()

  function extractError(err: unknown): string {
    return (
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Something went wrong'
    )
  }

  async function handleCreate(form: { name: string; email: string; password: string; role: Role }) {
    setMutationError('')
    try {
      await createUser.mutateAsync(form)
      setShowCreate(false)
      setCreatedCredentials({ email: form.email, password: form.password, role: form.role })
      toast('User created successfully', 'success')
    } catch (err) {
      setMutationError(extractError(err))
      toast('Failed to create user', 'error')
    }
  }

  async function handleEdit(form: { name: string; email: string; password: string; role: Role }) {
    if (!editTarget) return
    setMutationError('')
    try {
      const payload = { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
      await updateUser.mutateAsync({ id: editTarget.id, payload })
      setEditTarget(null)
      toast('User updated', 'success')
    } catch (err) {
      setMutationError(extractError(err))
      toast('Failed to update user', 'error')
    }
  }

  async function handleToggleActive(user: User) {
    if (user.isActive) {
      if (!confirm(`Deactivate ${user.name}? They will no longer be able to log in.`)) return
      try {
        await deactivateUser.mutateAsync(user.id)
        toast(`${user.name} deactivated`, 'success')
      } catch {
        toast('Failed to deactivate user', 'error')
      }
    } else {
      try {
        await updateUser.mutateAsync({ id: user.id, payload: { isActive: true } })
        toast(`${user.name} activated`, 'success')
      } catch {
        toast('Failed to activate user', 'error')
      }
    }
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <DashboardShell title="User Management">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">System Users</h2>
            <p className="text-xs text-gray-500 dark:text-slate-450">{data ? `${data.total} registered users` : 'Loading accounts…'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              options={[{ value: '', label: 'All roles' }, ...ROLE_OPTIONS]}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(1) }}
              className="w-36"
            />
            <Button onClick={() => { setShowCreate(true); setMutationError('') }}>
              + Add user
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-350">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-350">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-350">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-350">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-350">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-slate-800/50">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-7 w-16 ml-auto rounded-lg" /></td>
                  </tr>
                ))}
                {isError && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-rose-500 font-semibold">
                      Failed to load users.
                    </td>
                  </tr>
                )}
                {data?.users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300 font-medium">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="dark:text-slate-350 dark:hover:bg-slate-800"
                          onClick={() => { setEditTarget(user); setMutationError('') }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={user.isActive ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-emerald-950/20'}
                          onClick={() => void handleToggleActive(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <p className="text-xs text-gray-500 dark:text-slate-450 font-semibold">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Create */}
        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create New User Account"
        >
          <UserForm
            onSave={handleCreate}
            loading={createUser.isPending}
            error={mutationError}
          />
        </Modal>

        {/* Modal: Edit */}
        <Modal
          open={editTarget !== null}
          onClose={() => setEditTarget(null)}
          title={`Edit User: ${editTarget?.name}`}
        >
          {editTarget && (
            <UserForm
              initial={editTarget}
              onSave={handleEdit}
              loading={updateUser.isPending}
              error={mutationError}
            />
          )}
        </Modal>

        {/* Modal: Created Credentials Display */}
        <Modal
          open={createdCredentials !== null}
          onClose={() => setCreatedCredentials(null)}
          title="Account Credentials Created"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide these temporary credentials to the user so they can sign in.
            </p>
            <div className="bg-gray-50 dark:bg-slate-850 rounded-lg p-3.5 border border-gray-150 dark:border-slate-750 font-mono text-xs space-y-1 text-gray-800 dark:text-slate-200 select-all">
              <p><span className="font-bold text-gray-400 dark:text-slate-500">Email:</span> {createdCredentials?.email}</p>
              <p><span className="font-bold text-gray-400 dark:text-slate-500">Password:</span> {createdCredentials?.password}</p>
              <p><span className="font-bold text-gray-400 dark:text-slate-500">Role:</span> {createdCredentials?.role}</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setCreatedCredentials(null)}>Done</Button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardShell>
  )
}
