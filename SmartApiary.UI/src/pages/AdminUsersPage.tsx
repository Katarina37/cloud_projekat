import { useEffect, useState } from 'react';
import { Plus, Trash2, UserX, Users } from 'lucide-react';
import {
  deactivateAdminUser,
  deleteAdminUser,
  getAdminUsers,
  getApiErrorMessage,
  type AdminUserDto,
} from '../api/apiClient';
import { getCurrentUserId } from '../auth/authStorage';
import AdminUserFormModal from '../components/AdminUserFormModal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const userId = getCurrentUserId();
  const currentUserId = userId ? userId.toLowerCase() : null;

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    try {
      const users = await getAdminUsers();
      setUsers(users);
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greska pri ucitavanju korisnika.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = async () => {
    const refreshed = await fetchUsers();

    if (refreshed) {
      setSuccessMessage('Korisnik je kreiran. Aktivacioni link je poslat emailom preko SendGrid-a.');
    }
  };

  const handleDeactivate = async (user: AdminUserDto) => {
    const confirmed = window.confirm(`Deaktivirati korisnika ${user.firstName} ${user.lastName}?`);

    if (!confirmed) {
      return;
    }

    setDeactivatingUserId(user.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deactivateAdminUser(user.id);
      const refreshed = await fetchUsers();

      if (refreshed) {
        setSuccessMessage('Korisnik je deaktiviran.');
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Deaktivacija korisnika nije uspela.'));
    } finally {
      setDeactivatingUserId(null);
    }
  };

  const handleDelete = async (user: AdminUserDto) => {
    const confirmed = window.confirm(`Obrisati korisnika ${user.firstName} ${user.lastName}?`);

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteAdminUser(user.id);
      const refreshed = await fetchUsers();

      if (refreshed) {
        setSuccessMessage('Korisnik je obrisan.');
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Brisanje korisnika nije uspelo.'));
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Korisnici"
        subtitle="Administracija naloga i aktivacionih tokova"
        action={
          <button
            className="primary-button apiary-add-button"
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Novi korisnik
          </button>
        }
      />

      {loading ? <section className="section-card">Ucitavanje korisnika...</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && users.length === 0 ? (
        <section className="empty-state">
          <Users size={32} />
          <strong>Nema korisnika</strong>
        </section>
      ) : null}

      {!loading && !error && users.length > 0 ? (
        <section className="section-card table-card">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Korisnik</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Uloga</th>
                  <th>Status</th>
                  <th>Kreiran</th>
                  <th className="table-actions-cell">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentUser = user.id.toLowerCase() === currentUserId;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="table-title">
                          <strong>
                            {user.firstName} {user.lastName}
                          </strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{user.role}</td>
                      <td>
                        <StatusBadge tone={user.isActive ? 'good' : 'muted'}>
                          {user.isActive ? 'Aktivan' : 'Neaktivan'}
                        </StatusBadge>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="table-actions-cell">
                        <div className="row-actions">
                          <button
                            aria-label={deactivatingUserId === user.id ? 'Deaktivacija korisnika' : 'Deaktiviraj korisnika'}
                            className="danger-action-button icon-action-button"
                            disabled={
                              isCurrentUser
                              || !user.isActive
                              || deactivatingUserId === user.id
                              || deletingUserId === user.id
                            }
                            onClick={() => handleDeactivate(user)}
                            title={isCurrentUser ? 'Ne mozete deaktivirati sopstveni nalog.' : 'Deaktiviraj korisnika'}
                            type="button"
                          >
                            <UserX size={16} />
                          </button>
                          <button
                            aria-label={deletingUserId === user.id ? 'Brisanje korisnika' : 'Obriši korisnika'}
                            className="danger-action-button icon-action-button"
                            disabled={isCurrentUser || deletingUserId === user.id || deactivatingUserId === user.id}
                            onClick={() => handleDelete(user)}
                            title={isCurrentUser ? 'Ne mozete obrisati sopstveni nalog.' : 'Obriši korisnika'}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <AdminUserFormModal onClose={() => setIsCreateModalOpen(false)} onSaved={handleUserCreated} />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
