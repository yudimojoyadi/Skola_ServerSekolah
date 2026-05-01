'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScanLogsPage() {
  const router = useRouter();
  const [scanLogs, setScanLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    }
    return false;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchScanLogs();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    const body = document.body;
    if (sidebarCollapsed) {
      body.classList.remove('sidebar-collapse');
    } else {
      body.classList.add('sidebar-collapse');
    }
  };

  const fetchScanLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/scan-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setScanLogs(data);
    } catch (error) {
      console.error('Error fetching scan logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = scanLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(scanLogs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const filteredScanLogs = scanLogs.filter((scanLog) =>
    scanLog.student?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanLog.student?.kelas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanLog.qrCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanLog.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scanLog.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCurrentItems = filteredScanLogs.slice(indexOfFirstItem, indexOfLastItem);
  const filteredTotalPages = Math.ceil(filteredScanLogs.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return '<span class="badge badge-success">Success</span>';
    } else if (status === 'failed') {
      return '<span class="badge badge-danger">Failed</span>';
    } else {
      return `<span class="badge badge-secondary">${status}</span>`;
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'scanner') {
      return '<span class="badge badge-info">Scanner</span>';
    } else if (source === 'gps') {
      return '<span class="badge badge-warning">GPS</span>';
    } else {
      return `<span class="badge badge-secondary">${source}</span>`;
    }
  };

  if (loading) {
    return (
      <div className="wrapper">
        {/* Navbar */}
        <nav className="main-header navbar navbar-expand navbar-white navbar-light">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
                <i className="fas fa-bars"></i>
              </a>
            </li>
          </ul>

          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); toggleDarkMode(); }}>
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </a>
            </li>
            <li className="nav-item">
              <Link href="/login" className="nav-link">
                <i className="fas fa-sign-out-alt"></i> Logout
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Sidebar */}
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
          <div className="brand-link">
            <span className="brand-text font-weight-light">School System</span>
          </div>

          <div className="sidebar">
            <nav className="mt-2">
              <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
                <li className="nav-item">
                  <Link href="/dashboard" className="nav-link">
                    <i className="nav-icon fas fa-tachometer-alt"></i>
                    <p>Dashboard</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/students" className="nav-link">
                    <i className="nav-icon fas fa-users"></i>
                    <p>Students</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/nodes" className="nav-link">
                    <i className="nav-icon fas fa-server"></i>
                    <p>Nodes</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/rooms" className="nav-link">
                    <i className="nav-icon fas fa-door-open"></i>
                    <p>Rooms</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/group-speakers" className="nav-link">
                    <i className="nav-icon fas fa-users-cog"></i>
                    <p>Group Speakers</p>
                  </Link>
                </li>
                <li className="nav-header">Administrator</li>
                <li className="nav-item">
                  <Link href="/settings" className="nav-link">
                    <i className="nav-icon fas fa-cog"></i>
                    <p>Settings</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/scan-logs" className="nav-link active">
                    <i className="nav-icon fas fa-qrcode"></i>
                    <p>Scan Logs</p>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          <div className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1>Scan Logs</h1>
                </div>
              </div>
            </div>
          </div>

          <section className="content">
            <div className="container-fluid">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title">Scan Log List</h3>
                </div>
                <div className="card-body">
                  <p>Loading...</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="main-footer">
          <div className="float-right d-none d-sm-block">
            School System
          </div>
          <strong>Copyright &copy; 2024.</strong> All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="wrapper">
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
              <i className="fas fa-bars"></i>
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); toggleDarkMode(); }}>
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </a>
          </li>
          <li className="nav-item">
            <Link href="/login" className="nav-link">
              <i className="fas fa-sign-out-alt"></i> Logout
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <div className="brand-link">
          <span className="brand-text font-weight-light">School System</span>
        </div>

        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
              <li className="nav-item">
                <Link href="/dashboard" className="nav-link">
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/students" className="nav-link">
                  <i className="nav-icon fas fa-users"></i>
                  <p>Students</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/nodes" className="nav-link">
                  <i className="nav-icon fas fa-server"></i>
                  <p>Nodes</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/rooms" className="nav-link">
                  <i className="nav-icon fas fa-door-open"></i>
                  <p>Rooms</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/group-speakers" className="nav-link">
                  <i className="nav-icon fas fa-users-cog"></i>
                  <p>Group Speakers</p>
                </Link>
              </li>
              <li className="nav-header">Administrator</li>
              <li className="nav-item">
                <Link href="/settings" className="nav-link">
                  <i className="nav-icon fas fa-cog"></i>
                  <p>Settings</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/scan-logs" className="nav-link active">
                  <i className="nav-icon fas fa-qrcode"></i>
                  <p>Scan Logs</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Scan Logs</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><Link href="/dashboard">Home</Link></li>
                  <li className="breadcrumb-item active">Scan Logs</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            <div className="card card-primary card-outline">
              <div className="card-header">
                <h3 className="card-title">Scan Log List</h3>
                <div className="card-tools" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button type="submit" className="btn btn-default">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="bg-primary text-white">
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '15%' }}>Student Name</th>
                        <th style={{ width: '10%' }}>Class</th>
                        <th style={{ width: '15%' }}>QR Code</th>
                        <th style={{ width: '10%' }}>Node</th>
                        <th style={{ width: '10%' }}>Status</th>
                        <th style={{ width: '10%' }}>Source</th>
                        <th style={{ width: '15%' }}>Date Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScanLogs.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center">
                            <p className="text-gray-500">No scan logs found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredCurrentItems.map((scanLog, index) => (
                          <tr key={scanLog.id}>
                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td>{scanLog.student?.nama || 'N/A'}</td>
                            <td>{scanLog.student?.kelas || 'N/A'}</td>
                            <td>{scanLog.qrCode || 'N/A'}</td>
                            <td>{scanLog.node?.name || 'N/A'}</td>
                            <td dangerouslySetInnerHTML={{ __html: getStatusBadge(scanLog.status) }}></td>
                            <td dangerouslySetInnerHTML={{ __html: getSourceBadge(scanLog.source) }}></td>
                            <td>{formatDate(scanLog.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredScanLogs.length)} of {filteredScanLogs.length} entries
                  </span>
                  <nav>
                    <ul className="pagination pagination-sm m-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>&laquo;</button>
                      </li>
                      {[...Array(filteredTotalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === filteredTotalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>&raquo;</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="main-footer">
        <div className="float-right d-none d-sm-block">
          School System
        </div>
        <strong>Copyright &copy; 2024.</strong> All rights reserved.
      </footer>
    </div>
  );
}
