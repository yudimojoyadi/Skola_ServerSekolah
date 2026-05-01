'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
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
  const [itemsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState('');
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [audioText, setAudioText] = useState('');
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [newStudent, setNewStudent] = useState({ nama: '', kelas: '', roomId: '' });
  const [studentError, setStudentError] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, []);

  useEffect(() => {
    // Apply dark mode class to body immediately on mount
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

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching rooms with token:', token);
      const res = await fetch('http://localhost:3000/room', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Rooms response status:', res.status);
      const data = await res.json();
      console.log('Rooms data:', data);
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
      const dropdownWidth = 160;
      const screenWidth = window.innerWidth;
      
      // Calculate position, adjust if dropdown would go off right edge
      let left = rect.left + window.scrollX;
      if (left + dropdownWidth > screenWidth) {
        left = screenWidth - dropdownWidth - 20; // 20px padding from right edge
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: left
      });
      setDropdownOpen(studentId);
    }
  };

  const openQrModal = (qrCode) => {
    setSelectedQrCode(qrCode);
    setQrModalOpen(true);
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setSelectedQrCode('');
  };

  const handleGenerateAudio = (student) => {
    setSelectedStudent(student);
    setAudioText('');
    setAudioModalOpen(true);
  };

  const handleAddStudent = () => {
    setIsEditMode(false);
    setNewStudent({ nama: '', kelas: '', roomId: '' });
    setStudentError('');
    console.log('Opening add student modal, rooms:', rooms);
    setStudentModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setIsEditMode(true);
    setEditingStudentId(student.id);
    setNewStudent({
      nama: student.nama,
      kelas: student.kelas,
      roomId: student.roomId || ''
    });
    setStudentError('');
    setStudentModalOpen(true);
    setDropdownOpen(null);
  };

  const handleDeleteStudent = (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.nama}?`)) {
      handleDeleteConfirm(student);
    }
  };

  const handleDeleteConfirm = async (student) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/students/${student.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setDropdownOpen(null);
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.nama || !newStudent.kelas || !newStudent.roomId) {
      setStudentError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `http://localhost:3000/students/${editingStudentId}`
        : 'http://localhost:3000/students';
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setStudentError(data.error || 'Error saving student. Please try again.');
        return;
      }
      
      setStudentModalOpen(false);
      setStudentError('');
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      setStudentError('Error saving student. Please try again.');
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
                <Link href="/scan-logs" className="nav-link">
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
                    <div className="card-tools" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleAddStudent}
                      >
                        <i className="fas fa-plus mr-1"></i> Add Student
                      </button>
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
                              <th>Audio</th>
                              <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-4">
                                  <i className="fas fa-search fa-2x text-gray-400 mb-2"></i>
                                  <p className="text-gray-500">No students found</p>
                                </td>
                              </tr>
                            ) : (
                              currentItems.map((student, index) => (
                                <tr key={student.id}>
                                  <td>{indexOfFirstItem + index + 1}</td>
                                  <td>{student.nama}</td>
                                  <td>{student.kelas}</td>
                                  <td>
                                    <a 
                                      href="#" 
                                      onClick={(e) => { e.preventDefault(); openQrModal(student.qrCode); }}
                                      style={{ color: '#007bff', textDecoration: 'none' }}
                                    >
                                      Show
                                    </a>
                                  </td>
                                  <td>
                                    {student.audioFiles && student.audioFiles.length > 0 ? (
                                      <button 
                                        className="btn btn-sm btn-success"
                                        onClick={() => {
                                          const audioUrl = student.audioFiles[0].url;
                                          const audio = new Audio(audioUrl);
                                          audio.play();
                                        }}
                                      >
                                        <i className="fas fa-play"></i> Play
                                      </button>
                                    ) : (
                                      <button 
                                        className="btn btn-sm btn-secondary"
                                        disabled
                                      >
                                        <i className="fas fa-volume-mute"></i> No Audio
                                      </button>
                                    )}
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
                                          <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEditStudent(student); }}>
                                            <i className="fas fa-edit mr-2"></i> Edit
                                          </a>
                                          <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleGenerateAudio(student); }}>
                                            <i className="fas fa-microphone mr-2"></i> Generate Audio
                                          </a>
                                          <div className="dropdown-divider"></div>
                                          <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDeleteStudent(student); }}>
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

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">QR Code</h5>
                <button type="button" className="close" onClick={closeQrModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body text-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQrCode)}`}
                  alt="QR Code"
                  style={{ maxWidth: '100%' }}
                />
                <p className="mt-3 mb-0">
                  <strong>{selectedQrCode}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedQrCode)}`;
                    link.download = `${selectedQrCode}-qrcode.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <i className="fas fa-download mr-1"></i> Download
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeQrModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Generation Modal */}
      {audioModalOpen && selectedStudent && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate Audio for {selectedStudent.nama}</h5>
                <button type="button" className="close" onClick={() => setAudioModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="audioText">Text to Speech:</label>
                  <textarea 
                    className="form-control" 
                    id="audioText" 
                    rows="4"
                    value={audioText}
                    onChange={(e) => setAudioText(e.target.value)}
                    placeholder="Enter text to convert to audio..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAudioModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!audioText.trim()) return;
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('http://localhost:3000/audio/generate', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          studentId: selectedStudent.id,
                          textSource: audioText
                        })
                      });
                      const data = await res.json();
                      setAudioModalOpen(false);
                      setAudioText('');
                      setDropdownOpen(null);
                      fetchStudents();
                    } catch (error) {
                      console.error('Error generating audio:', error);
                    }
                  }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Add/Edit Modal */}
      {studentModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? 'Edit Student' : 'Add New Student'}</h5>
                <button type="button" className="close" onClick={() => setStudentModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="studentName">Name <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="studentName"
                    value={newStudent.nama}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, nama: e.target.value });
                      setStudentError('');
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="studentClass">Class <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="studentClass"
                    value={newStudent.kelas}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, kelas: e.target.value });
                      setStudentError('');
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="studentRoom">Room <span className="text-danger">*</span>:</label>
                  <select
                    className="form-control"
                    id="studentRoom"
                    value={newStudent.roomId}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, roomId: e.target.value });
                      setStudentError('');
                    }}
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms && rooms.length > 0 ? (
                      rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No rooms available</option>
                    )}
                  </select>
                  {(!rooms || rooms.length === 0) && (
                    <small className="text-muted">No rooms available. Please add rooms first.</small>
                  )}
                </div>
                {studentError && (
                  <div className="alert alert-danger" role="alert">
                    {studentError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStudentModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateStudent}>
                  {isEditMode ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
