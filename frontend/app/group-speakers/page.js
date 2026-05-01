'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GroupSpeakers() {
  const [groupSpeakers, setGroupSpeakers] = useState([]);
  const [filteredGroupSpeakers, setFilteredGroupSpeakers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [groupSpeakerModalOpen, setGroupSpeakerModalOpen] = useState(false);
  const [newGroupSpeaker, setNewGroupSpeaker] = useState({ name: '', nodeId: '', roomId: '' });
  const [groupSpeakerError, setGroupSpeakerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroupSpeakerId, setEditingGroupSpeakerId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupSpeakerToDelete, setGroupSpeakerToDelete] = useState(null);

  useEffect(() => {
    fetchGroupSpeakers();
    fetchRooms();
    fetchNodes();
    
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
    const filtered = groupSpeakers.filter(gs =>
      gs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gs.node?.name && gs.node.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gs.room?.name && gs.room.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredGroupSpeakers(filtered);
    setCurrentPage(1);
  }, [searchTerm, groupSpeakers]);

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

  const fetchGroupSpeakers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/group-speaker', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setGroupSpeakers(data);
      setFilteredGroupSpeakers(data);
    } catch (error) {
      console.error('Error fetching group speakers:', error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchNodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/node', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNodes(data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGroupSpeakers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDropdownClick = (e, groupSpeakerId) => {
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
    setDropdownOpen(groupSpeakerId);
  };

  const handleCreateGroupSpeaker = async () => {
    if (!newGroupSpeaker.name || !newGroupSpeaker.nodeId || !newGroupSpeaker.roomId) {
      setGroupSpeakerError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `http://localhost:3000/group-speaker/${editingGroupSpeakerId}`
        : 'http://localhost:3000/group-speaker';
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroupSpeaker)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setGroupSpeakerError(data.error || 'Error saving group speaker. Please try again.');
        return;
      }
      
      setGroupSpeakerModalOpen(false);
      setGroupSpeakerError('');
      setNewGroupSpeaker({ name: '', nodeId: '', roomId: '' });
      setIsEditMode(false);
      setEditingGroupSpeakerId(null);
      fetchGroupSpeakers();
    } catch (error) {
      console.error('Error saving group speaker:', error);
      setGroupSpeakerError('Error saving group speaker. Please try again.');
    }
  };

  const handleEditGroupSpeaker = (groupSpeaker) => {
    setNewGroupSpeaker({
      name: groupSpeaker.name,
      nodeId: groupSpeaker.nodeId,
      roomId: groupSpeaker.roomId
    });
    setEditingGroupSpeakerId(groupSpeaker.id);
    setIsEditMode(true);
    setGroupSpeakerError('');
    setGroupSpeakerModalOpen(true);
  };

  const handleDeleteConfirm = (groupSpeaker) => {
    setGroupSpeakerToDelete(groupSpeaker);
    setDeleteModalOpen(true);
  };

  const handleDeleteGroupSpeaker = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/group-speaker/${groupSpeakerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        setGroupSpeakerError(data.error || 'Error deleting group speaker');
        return;
      }
      
      setDeleteModalOpen(false);
      setGroupSpeakerToDelete(null);
      fetchGroupSpeakers();
    } catch (error) {
      console.error('Error deleting group speaker:', error);
      setGroupSpeakerError('Error deleting group speaker. Please try again.');
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
                <Link href="/rooms" className="nav-link">
                  <i className="nav-icon fas fa-door-open"></i>
                  <p>Rooms</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/group-speakers" className="nav-link active">
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
                <h1>Group Speakers</h1>
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
                    <h3 className="card-title">Group Speaker List</h3>
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
                          setGroupSpeakerModalOpen(true);
                          setGroupSpeakerError('');
                          setNewGroupSpeaker({ name: '', nodeId: '', roomId: '' });
                          setIsEditMode(false);
                          setEditingGroupSpeakerId(null);
                        }}
                      >
                        <i className="fas fa-plus"></i> Add Group Speaker
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
                            <th style={{ width: '20%' }}>Name</th>
                            <th style={{ width: '20%' }}>Node</th>
                            <th style={{ width: '20%' }}>Room</th>
                            <th style={{ width: '20%' }}>Created At</th>
                            <th style={{ width: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGroupSpeakers.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                <i className="fas fa-search fa-2x text-gray-400 mb-2"></i>
                                <p className="text-gray-500">No group speakers found</p>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((groupSpeaker, index) => (
                              <tr key={groupSpeaker.id}>
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{groupSpeaker.name}</td>
                                <td>{groupSpeaker.node?.name || 'N/A'}</td>
                                <td>{groupSpeaker.room?.name || 'N/A'}</td>
                                <td>{formatDate(groupSpeaker.createdAt)}</td>
                                <td>
                                  <div className="dropdown">
                                    <button 
                                      className="btn btn-sm btn-primary dropdown-toggle" 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDropdownClick(e, groupSpeaker.id); }}
                                    >
                                      Actions
                                    </button>
                                    {dropdownOpen === groupSpeaker.id && (
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
                                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEditGroupSpeaker(groupSpeaker); }}>
                                          <i className="fas fa-edit mr-2"></i> Edit
                                        </a>
                                        <div className="dropdown-divider"></div>
                                        <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDeleteConfirm(groupSpeaker); }}>
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
                      {Array.from({ length: Math.ceil(filteredGroupSpeakers.length / itemsPerPage) }, (_, i) => i + 1).map((number) => (
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

      {/* Add/Edit Group Speaker Modal */}
      {groupSpeakerModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? 'Edit Group Speaker' : 'Add New Group Speaker'}</h5>
                <button type="button" className="close" onClick={() => setGroupSpeakerModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="groupSpeakerName">Name <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="groupSpeakerName"
                    value={newGroupSpeaker.name}
                    onChange={(e) => {
                      setNewGroupSpeaker({ ...newGroupSpeaker, name: e.target.value });
                      setGroupSpeakerError('');
                    }}
                    placeholder="Enter group speaker name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="groupSpeakerNode">Node <span className="text-danger">*</span>:</label>
                  <select
                    className="form-control"
                    id="groupSpeakerNode"
                    value={newGroupSpeaker.nodeId}
                    onChange={(e) => {
                      setNewGroupSpeaker({ ...newGroupSpeaker, nodeId: e.target.value });
                      setGroupSpeakerError('');
                    }}
                    required
                  >
                    <option value="">Select Node</option>
                    {nodes && nodes.filter(node => node.type === 'speaker' || node.type === 'scanner').map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="groupSpeakerRoom">Room <span className="text-danger">*</span>:</label>
                  <select
                    className="form-control"
                    id="groupSpeakerRoom"
                    value={newGroupSpeaker.roomId}
                    onChange={(e) => {
                      setNewGroupSpeaker({ ...newGroupSpeaker, roomId: e.target.value });
                      setGroupSpeakerError('');
                    }}
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                {groupSpeakerError && (
                  <div className="alert alert-danger" role="alert">
                    {groupSpeakerError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setGroupSpeakerModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateGroupSpeaker}>
                  {isEditMode ? 'Update Group Speaker' : 'Add Group Speaker'}
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
                <h5 className="modal-title">Delete Group Speaker</h5>
                <button type="button" className="close" onClick={() => setDeleteModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete group speaker <strong>{groupSpeakerToDelete?.name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteGroupSpeaker}>
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
