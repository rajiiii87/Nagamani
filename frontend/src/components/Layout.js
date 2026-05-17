import React from 'react';
import '../styles/layout.css';

const Layout = ({ children, currentPage, onNavigate, company }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'company', label: 'Company Profile', icon: '🏢' },
    { id: 'parties', label: 'Parties', icon: '👥' },
    { id: 'goods', label: 'Goods & Items', icon: '📦' },
    { id: 'invoice', label: 'New Invoice', icon: '📝' },
    { id: 'invoices', label: 'All Invoices', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <aside className="sidebar">
        <h2>📄 GST Invoice</h2>
        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="header">
          <div>
            <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            {company && <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>{company.companyName}</p>}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {new Date().toLocaleDateString()}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
