import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 10, search: q } });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remover o usuário "${name}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover usuário.');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}`, { active: !user.active });
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao atualizar usuário.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logo}>US</div>
          <span style={styles.headerTitle}>Painel Admin</span>
        </div>
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Sair</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>Usuários</h2>
            <p style={styles.pageSub}>{pagination.total} usuário(s) cadastrado(s)</p>
          </div>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>Buscar</button>
          </form>
        </div>

        <div style={styles.tableWrap}>
          {loading ? (
            <div style={styles.loadingMsg}>Carregando...</div>
          ) : users.length === 0 ? (
            <div style={styles.loadingMsg}>Nenhum usuário encontrado.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Nome', 'E-mail', 'Função', 'Status', 'Cadastro', 'Ações'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.miniAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                        <span style={styles.userName}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.roleBadge, background: u.role === 'ADMIN' ? '#dbeafe' : '#f0fdf4', color: u.role === 'ADMIN' ? '#1d4ed8' : '#16a34a' }}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => toggleActive(u)} style={{ ...styles.statusBtn, background: u.active ? '#dcfce7' : '#fee2e2', color: u.active ? '#16a34a' : '#dc2626' }}>
                        {u.active ? '● Ativo' : '● Inativo'}
                      </button>
                    </td>
                    <td style={{ ...styles.td, color: '#94a3b8', fontSize: '13px' }}>
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deleting === u.id}
                        style={styles.deleteBtn}
                      >
                        {deleting === u.id ? '...' : 'Remover'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchUsers(p)}
                style={{ ...styles.pageBtn, background: p === pagination.page ? '#2563eb' : '#fff', color: p === pagination.page ? '#fff' : '#374151' }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header: {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '0 32px', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', fontWeight: '700', fontSize: '15px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontWeight: '600', color: '#0f172a', fontSize: '16px' },
  navLink: { color: '#2563eb', fontWeight: '500', textDecoration: 'none', fontSize: '14px' },
  logoutBtn: {
    padding: '7px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
    background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '14px',
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
  pageSub: { fontSize: '14px', color: '#64748b', margin: 0 },
  searchForm: { display: 'flex', gap: '8px' },
  searchInput: {
    padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', outline: 'none', minWidth: '280px', background: '#fff',
  },
  searchBtn: {
    padding: '10px 20px', borderRadius: '10px', background: '#2563eb',
    color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px',
  },
  tableWrap: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  loadingMsg: { padding: '40px', textAlign: 'center', color: '#94a3b8' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#0f172a', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  miniAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff', fontWeight: '700', fontSize: '13px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { fontWeight: '500' },
  roleBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  statusBtn: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  deleteBtn: {
    padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #fecaca',
    background: 'transparent', color: '#dc2626', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  pagination: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' },
  pageBtn: { width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid #e2e8f0', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
};
