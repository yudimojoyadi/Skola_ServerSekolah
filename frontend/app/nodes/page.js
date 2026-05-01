'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [newNode, setNewNode] = useState({ name: '', type: 'scanner', ipAddress: '', isEnable: true });
  const [nodeError, setNodeError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState(null);

  useEffect(() => {
    fetchNodes();
    
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
    // Filter nodes based on search term
    const filtered = nodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.ipAddress && node.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredNodes(filtered);
    setCurrentPage(1);
  }, [searchTerm, nodes]);

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
      setFilteredNodes(data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleDropdown = (nodeId, event) => {
    if (dropdownOpen === nodeId) {
      setDropdownOpen(null);
    } else {
      const rect = event.target.getBoundingClientRect();
      const dropdownWidth = 160;
      const screenWidth = window.innerWidth;
      
      // Calculate position, adjust if dropdown would go off right edge
      let left = rect.left + window.scrollX;
      if (left + dropdownWidth > screenWidth) {
        left = screenWidth - dropdownWidth - 20;
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: left
      });
      setDropdownOpen(nodeId);
    }
  };

  const handleCreateNode = async () => {
    if (!newNode.name || !newNode.type || !newNode.ipAddress) {
      setNodeError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `http://localhost:3000/node/${editingNodeId}`
        : 'http://localhost:3000/node';
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNode)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setNodeError(data.error || 'Error saving node. Please try again.');
        return;
      }
      
      setNodeModalOpen(false);
      setNodeError('');
      setNewNode({ name: '', type: 'scanner', ipAddress: '', isEnable: true });
      setIsEditMode(false);
      setEditingNodeId(null);
      fetchNodes();
    } catch (error) {
      console.error('Error saving node:', error);
      setNodeError('Error saving node. Please try again.');
    }
  };

  const handleEditNode = (node) => {
    setNewNode({
      name: node.name,
      type: node.type,
      ipAddress: node.ipAddress || '',
      isEnable: node.isEnable
    });
    setEditingNodeId(node.id);
    setIsEditMode(true);
    setNodeError('');
    setNodeModalOpen(true);
  };

  const handleDeleteConfirm = (node) => {
    setNodeToDelete(node);
    setDeleteModalOpen(true);
  };

  const handleDeleteNode = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/node/${nodeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const data = await res.json();
        setNodeError(data.error || 'Error deleting node');
        return;
      }
      
      setDeleteModalOpen(false);
      setNodeToDelete(null);
      fetchNodes();
    } catch (error) {
      console.error('Error deleting node:', error);
      setNodeError('Error deleting node. Please try again.');
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
              <li className="nav-item">
                <Link href="/students" className="nav-link">
                  <i className="nav-icon fas fa-users"></i>
                  <p>Students</p>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/nodes" className="nav-link active">
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
                <h1 className="m-0">Nodes</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><Link href="/dashboard">Home</Link></li>
                  <li className="breadcrumb-item active">Nodes</li>
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
                    <h3 className="card-title">Node List</h3>
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
                          setNodeModalOpen(true);
                          setNodeError('');
                          setNewNode({ name: '', type: 'scanner', ipAddress: '', isEnable: true });
                          setIsEditMode(false);
                          setEditingNodeId(null);
                        }}
                      >
                        <i className="fas fa-plus"></i> Add Node
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
                              <th>Type</th>
                              <th>IP Address</th>
                              <th>Created At</th>
                              <th>Status</th>
                              <th>Last Heartbeat</th>
                              <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredNodes.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  <i className="fas fa-search fa-2x text-gray-400 mb-2"></i>
                                  <p className="text-gray-500">No nodes found</p>
                                </td>
                              </tr>
                            ) : (
                              currentItems.map((node, index) => (
                                <tr key={node.id}>
                                  <td>{indexOfFirstItem + index + 1}</td>
                                  <td>{node.name}</td>
                                  <td>
                                    {node.type === 'scanner' ? (
                                      <span className="badge badge-info">
                                        <i className="fas fa-qrcode mr-1"></i> Scanner
                                      </span>
                                    ) : node.type === 'speaker' ? (
                                      <span className="badge badge-success">
                                        <i className="fas fa-volume-up mr-1"></i> Speaker
                                      </span>
                                    ) : (
                                      <span className="badge badge-secondary">{node.type}</span>
                                    )}
                                  </td>
                                  <td>{node.ipAddress || '-'}</td>
                                  <td>{node.createdAt ? new Date(node.createdAt).toLocaleString() : '-'}</td>
                                  <td>
                                    {node.isEnable ? (
                                      <span className="badge badge-success">Active</span>
                                    ) : (
                                      <span className="badge badge-danger">Inactive</span>
                                    )}
                                  </td>
                                  <td>
                                    {node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Never'}
                                  </td>
                                  <td>
                                    <div className="dropdown">
                                      <button 
                                        className="btn btn-sm btn-primary dropdown-toggle" 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleDropdown(node.id, e); }}
                                      >
                                        Actions
                                      </button>
                                      {dropdownOpen === node.id && (
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
                                          <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleEditNode(node); }}>
                                            <i className="fas fa-edit mr-2"></i> Edit
                                          </a>
                                          <div className="dropdown-divider"></div>
                                          <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDeleteConfirm(node); }}>
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
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredNodes.length)} of {filteredNodes.length} entries
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

      {/* Add Node Modal */}
      {nodeModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? 'Edit Node' : 'Add New Node'}</h5>
                <button type="button" className="close" onClick={() => setNodeModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="nodeName">Name <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nodeName"
                    value={newNode.name}
                    onChange={(e) => {
                      setNewNode({ ...newNode, name: e.target.value });
                      setNodeError('');
                    }}
                    placeholder="Enter node name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nodeType">Type <span className="text-danger">*</span>:</label>
                  <select
                    className="form-control"
                    id="nodeType"
                    value={newNode.type}
                    onChange={(e) => {
                      setNewNode({ ...newNode, type: e.target.value });
                      setNodeError('');
                    }}
                    required
                  >
                    <option value="scanner">Scanner</option>
                    <option value="speaker">Speaker</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="nodeIpAddress">IP Address <span className="text-danger">*</span>:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nodeIpAddress"
                    value={newNode.ipAddress}
                    onChange={(e) => {
                      setNewNode({ ...newNode, ipAddress: e.target.value });
                      setNodeError('');
                    }}
                    placeholder="Enter IP address"
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="custom-control custom-switch">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="nodeEnable"
                      checked={newNode.isEnable}
                      onChange={(e) => setNewNode({ ...newNode, isEnable: e.target.checked })}
                    />
                    <label className="custom-control-label" htmlFor="nodeEnable">Enable Node</label>
                  </div>
                </div>
                {nodeError && (
                  <div className="alert alert-danger" role="alert">
                    {nodeError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setNodeModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateNode}>
                  {isEditMode ? 'Update Node' : 'Add Node'}
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
                <h5 className="modal-title">Delete Node</h5>
                <button type="button" className="close" onClick={() => setDeleteModalOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete node <strong>{nodeToDelete?.name}</strong>?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteNode}>
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
