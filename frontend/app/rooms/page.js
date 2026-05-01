'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '' });
  const [roomError, setRoomError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    fetchRooms();
    
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [searchTerm, rooms]);

  useEffect(() => {
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

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/room', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setRooms(data);
      setFilteredRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDropdownClick = (e, roomId) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    let left = rect.right;
    
    if (left + 160 > screenWidth) {
      left = rect.left - 160;
    }
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      left: left
    });
    setDropdownOpen(roomId);
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name) {
      setRoomError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `http://localhost:3000/room/${editingRoomId}`
        : 'http://localhost:3000/room';
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setRoomError(data.error || 'Error saving room. Please try again.');
        return;
      }
      
      setRoomModalOpen(false);
      setRoomError('');
      setNewRoom({ name: '' });
      setIsEditMode(false);
      setEditingRoomId(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      setRoomError('Error saving room. Please try again.');
    }
  };

  const handleEditRoom = (room) => {
    setNewRoom({ name: room.name });
    setEditingRoomId(room.id);
    setIsEditMode(true);
    setRoomError('');
    setRoomModalOpen(true);
  };

  const handleDeleteConfirm = (room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const handleDeleteRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/room/${roomToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        setRoomError(data.error || 'Error deleting room');
        return;
      }
      
      setDeleteModalOpen(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      setRoomError('Error deleting room. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="wrapper">
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
            <a className="nav-link" onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </a>
          </li>
        </ul>
      </nav>

      <aside className={`main-sidebar sidebar-dark-primary elevation-4 ${sidebarCollapsed ? 'sidebar-collapse' : ''}`}>
        <a href="#" className="brand-link">
          <span className="brand-text font-weight-light">School Dashboard</span>
        </a>

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
                <Link href="/rooms" className="nav-link active">
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

      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>Rooms</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card card-primary card-outline">
                  <div className="card-header">
                    <h3 className="card-title">Room List</h3>
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
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setRoomModalOpen(true);
                          setRoomError('');
                          setNewRoom({ name: '' });
                          setIsEditMode(false);
                          setEditingRoomId(null);
                        }}
                      >
                        <i className="fas fa-plus"></i> Add Room
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
                      <table className="table table-striped table-hover">
                        <thead className="bg-primary text-white">
                          <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th style={{ width: '40%' }}>Name</th>
                            <th style={{ width: '40%' }}>Created At</th>
                            <th style={{ width: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRooms.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-4">
                                <i className="fas fa-search fa-2x text-gray-400 mb-2"></i>
                                <p className="text-gray-500">No rooms found</p>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((room, index) => (
                              <tr key={room.id}>
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{room.name}</td>
                                <td>{formatDate(room.createdAt)}</td>
                                <td>
                                  <div className="dropdown">
                                    <button 
                                      className="btn btn-sm btn-primary dropdown-toggle" 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDropdownClick(e, room.id); }}
                                    >
                                      Actions
                                    </button>
                                    {dropdownOpen === room.id && (
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
                                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEditRoom(room); }}>
                                          <i className="fas fa-edit mr-2"></i> Edit
                                        </a>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDeleteConfirm(room); }}>
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
                    )}
                  </div>
                  <div className="card-footer clearfix">
                    <ul className="pagination pagination-sm m-0 float-right">
                      {Array.from({ length: Math.ceil(filteredRooms.length / itemsPerPage) }, (_, i) => i + 1).map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); paginate(number); }}>
                            {number}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="main-footer">
        <strong>Copyright &copy; 2024 School Dashboard.</strong> All rights reserved.
      </footer>

      {/* Add/Edit Room Modal */}
      {roomModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? 'Edit Room' : 'Add New Room'}</h5>
                <button type="button" className="close" onClick={() => setRoomModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="roomName">Name <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="roomName"
                    value={newRoom.name}
                    onChange={(e) => {
                      setNewRoom({ ...newRoom, name: e.target.value });
                      setRoomError('');
                    }}
                    placeholder="Enter room name"
                    required
                  />
                </div>
                {roomError && (
                  <div className="alert alert-danger" role="alert">
                    {roomError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRoomModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateRoom}>
                  {isEditMode ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Room</h5>
                <button type="button" className="close" onClick={() => setDeleteModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete room <strong>{roomToDelete?.name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteRoom}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
