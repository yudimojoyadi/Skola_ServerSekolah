'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    fetchStudents();
    
    // Check for saved dark mode preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
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

  useEffect(() => {
    // Filter students based on search term
    const filtered = students.filter(student =>
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, students]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleDropdown = (studentId, event) => {
    if (dropdownOpen === studentId) {
      setDropdownOpen(null);
    } else {
      const rect = event.target.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      setDropdownOpen(studentId);
    }
  };

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

      {/* Main Sidebar Container */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        {/* Brand Logo */}
        <a href="/dashboard" className="brand-link">
          <span className="brand-text font-weight-light">School Dashboard</span>
        </a>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Sidebar Menu */}
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
              <li className="nav-item">
                <Link href="/dashboard" className="nav-link">
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>Dashboard</p>
                </Link>
              </li>
              <li className="nav-item menu-open">
                <Link href="/students" className="nav-link active">
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
                <Link href="/settings" className="nav-link">
                  <i className="nav-icon fas fa-cog"></i>
                  <p>Settings</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Content Header */}
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Students</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><Link href="/dashboard">Home</Link></li>
                  <li className="breadcrumb-item active">Students</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card card-primary card-outline">
                  <div className="card-header">
                    <h3 className="card-title">Student List</h3>
                    <div className="card-tools">
                      <div className="input-group input-group-sm" style={{ width: '250px' }}>
                        <input
                          type="text"
                          className="form-control float-right"
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
                    {loading ? (
                      <div className="p-3 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th style={{ width: '50px' }}>#</th>
                              <th>Name</th>
                              <th>Class</th>
                              <th>QR Code</th>
                              <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4">
                                  <i className="fas fa-search fa-2x text-gray-400 mb-2"></i>
                                  <p className="text-gray-500">No students found</p>
                                </td>
                              </tr>
                            ) : (
                              currentItems.map((student, index) => (
                                <tr key={student.id}>
                                  <td>{indexOfFirstItem + index + 1}</td>
                                  <td>
                                    <span className="badge badge-info">{student.nama}</span>
                                  </td>
                                  <td>
                                    <span className="badge badge-success">{student.kelas}</span>
                                  </td>
                                  <td>
                                    <code className="bg-light px-2 py-1 rounded">{student.qrCode}</code>
                                  </td>
                                  <td>
                                    <div className="dropdown">
                                      <button 
                                        className="btn btn-sm btn-primary dropdown-toggle" 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleDropdown(student.id, e); }}
                                      >
                                        Actions
                                      </button>
                                      {dropdownOpen === student.id && (
                                        <div 
                                          className="dropdown-menu show" 
                                          style={{ 
                                            position: 'fixed',
                                            top: `${dropdownPosition.top}px`,
                                            left: `${dropdownPosition.left}px`,
                                            zIndex: 9999,
                                            minWidth: '160px'
                                          }}
                                        >
                                          <a className="dropdown-item" href="#">
                                            <i className="fas fa-eye mr-2"></i> View
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="fas fa-edit mr-2"></i> Edit
                                          </a>
                                          <div className="dropdown-divider"></div>
                                          <a className="dropdown-item text-danger" href="#">
                                            <i className="fas fa-trash mr-2"></i> Delete
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="card-footer clearfix">
                    <ul className="pagination pagination-sm m-0 float-right">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); paginate(currentPage - 1); }}>
                          &laquo;
                        </a>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>
                            {i + 1}
                          </a>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); paginate(currentPage + 1); }}>
                          &raquo;
                        </a>
                      </li>
                    </ul>
                    <span className="text-muted">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="float-right d-none d-sm-block">
          <b>Version</b> 1.0.0
        </div>
        <strong>Copyright &copy; 2024 School Dashboard.</strong> All rights reserved.
      </footer>
    </div>
  );
}
