'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  useEffect(() => {
    // Load scripts only on client side
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      return script;
    };

    // Load jQuery first, then Bootstrap, then AdminLTE
    const jqueryScript = loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
    
    jqueryScript.onload = () => {
      const bootstrapScript = loadScript('https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js');
      
      bootstrapScript.onload = () => {
        loadScript('https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js');
      };
    };

    return () => {
      // Cleanup scripts on unmount
      const scripts = document.querySelectorAll('script[src*="jquery"], script[src*="bootstrap"], script[src*="admin-lte"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return (
    <div className="wrapper">
      {/* Navbar */}
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
              <i className="fas fa-bars"></i>
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ml-auto">
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
              <li className="nav-item menu-open">
                <Link href="/dashboard" className="nav-link active">
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
                <h1 className="m-0">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 col-6">
                <div className="small-box bg-info">
                  <div className="inner">
                    <h3>150</h3>
                    <p>Total Students</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-success">
                  <div className="inner">
                    <h3>53</h3>
                    <p>Active Nodes</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-server"></i>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-warning">
                  <div className="inner">
                    <h3>44</h3>
                    <p>Today's Scans</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-qrcode"></i>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="small-box bg-danger">
                  <div className="inner">
                    <h3>65</h3>
                    <p>Pending Alerts</p>
                  </div>
                  <div className="icon">
                    <i className="fas fa-bell"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="card card-primary card-outline">
                  <div className="card-header">
                    <h3 className="card-title">Welcome to School Dashboard</h3>
                  </div>
                  <div className="card-body">
                    <p>Manage your school's network and monitoring system here.</p>
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