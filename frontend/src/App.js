import React, { useState, useEffect, useCallback } from 'react';
import InvoiceForm from './components/InvoiceForm';
import './styles/global.css';
import Layout from './components/Layout';
import CompanyProfile from './components/CompanyProfile';
import PartyManagement from './components/PartyManagement';
import GoodsManagement from './components/GoodsManagement';
import InvoiceList from './components/InvoiceList';
import { companyAPI, invoiceAPI, partyAPI, goodsAPI } from './utils/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await companyAPI.get();
      setCompany(response.data);
    } catch (error) {
      console.log('Company profile not configured');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard company={company} onNavigate={setCurrentPage} />;
      case 'company':
        return <CompanyProfile />;
      case 'parties':
        return <PartyManagement />;
      case 'goods':
        return <GoodsManagement />;
      case 'invoice':
        return <InvoiceForm />;
      case 'invoices':
        return <InvoiceList />;
      case 'reports':
        return <Reports company={company} />;
      default:
        return <Dashboard company={company} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      company={company}
    >
      {renderPage()}
    </Layout>
  );
}

const Dashboard = ({ company, onNavigate }) => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalGST: 0,
    cancelledAmount: 0,
    thisMonthInvoices: 0,
    thisMonthAmount: 0,
    totalParties: 0,
    totalGoods: 0,
    recentInvoices: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [invoicesRes, partiesRes, goodsRes] = await Promise.all([
        invoiceAPI.getAll(),
        partyAPI.getAll(),
        goodsAPI.getAll()
      ]);

      const invoices = invoicesRes.data || [];
      const parties = partiesRes.data || [];
      const goods = goodsRes.data || [];

      // Filter invoices by status
      const activeInvoices = invoices.filter(inv => inv.status === 'saved' || inv.status === 'printed');
      const cancelledInvoices = invoices.filter(inv => inv.status === 'cancelled');

      // Calculate statistics
      const totalRevenue = activeInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
      const totalGST = activeInvoices.reduce((sum, inv) => sum + ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0)), 0);
      const cancelledAmount = cancelledInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const thisMonthInvoices = activeInvoices.filter(inv => 
        (inv.invoiceDate || '').slice(0, 7) === currentMonth
      );
      const thisMonthAmount = thisMonthInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

      setStats({
        totalInvoices: activeInvoices.length + cancelledInvoices.length,
        totalRevenue,
        totalGST,
        cancelledAmount,
        thisMonthInvoices: thisMonthInvoices.length,
        thisMonthAmount,
        totalParties: parties.length,
        totalGoods: goods.length,
        recentInvoices: activeInvoices.slice(-5).reverse()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div>
      {!company ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 16px 0', color: '#1f2937' }}>Welcome to GST Invoice Manager</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Get started by configuring your company profile. This information will appear on all invoices.</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Configure Company Profile
          </button>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h4>📊 Total Invoices</h4>
              <div className="value">{stats.totalInvoices}</div>
              <div className="subtitle">This financial year</div>
            </div>

            <div className="stat-card">
              <h4>💰 Total Revenue</h4>
              <div className="value" style={{ color: '#16a34a', fontSize: '24px' }}>
                {formatCurrency(stats.totalRevenue).slice(0, 12)}
              </div>
              {/* <div className="subtitle">GST: {formatCurrency(stats.totalGST).slice(0, 8)}</div> */}
            </div>

            <div className="stat-card">
              <h4>� Cancelled Amount</h4>
              <div className="value" style={{ color: '#dc2626', fontSize: '24px' }}>
                {formatCurrency(stats.cancelledAmount).slice(0, 12)}
              </div>
              <div className="subtitle">Cancelled invoices</div>
            </div>

            <div className="stat-card">
              <h4>�📅 This Month</h4>
              <div className="value">{stats.thisMonthInvoices}</div>
              <div className="subtitle">{formatCurrency(stats.thisMonthAmount).slice(0, 12)}</div>
            </div>

            <div className="stat-card">
              <h4>👥 Parties</h4>
              <div className="value">{stats.totalParties}</div>
              <div className="subtitle">{stats.totalGoods} goods configured</div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="dashboard-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <div className="action-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('invoice')}>
                <div className="action-icon" style={{ backgroundColor: '#dbeafe' }}>📄</div>
                <div className="action-content">
                  <h3>Create Invoice</h3>
                  <p>Generate a new tax invoice</p>
                </div>
              </div>

              <div className="action-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('parties')}>
                <div className="action-icon" style={{ backgroundColor: '#d1fae5' }}>👤</div>
                <div className="action-content">
                  <h3>Manage Parties</h3>
                  <p>Add or edit customers</p>
                </div>
              </div>

              <div className="action-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('goods')}>
                <div className="action-icon" style={{ backgroundColor: '#fef3c7' }}>📦</div>
                <div className="action-content">
                  <h3>Manage Goods</h3>
                  <p>Configure HSN & GST rates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent Invoices</h2>
              <button type="button" className="section-link">View All →</button>
            </div>
            <div className="recent-invoices">
              {stats.recentInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No invoices yet. Create your first invoice!
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Party</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInvoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td><strong>{invoice.invoiceNumber}</strong></td>
                        <td>{invoice.partyName || 'N/A'}</td>
                        <td>{formatCurrency(invoice.grandTotal)}</td>
                        <td>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${invoice.status === 'saved' ? 'warning' : 'success'}`}>
                            {invoice.status || 'Saved'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Reports = ({ company }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await invoiceAPI.getAll();
      const invoices = response.data || [];

      // Filter out cancelled invoices and filter by selected month
      const monthInvoices = invoices.filter(inv =>
        inv.status !== 'cancelled' && (inv.invoiceDate || '').slice(0, 7) === selectedMonth
      );

      if (monthInvoices.length === 0) {
        setReportData(null);
        return;
      }

      // Calculate report data
      const totalRevenue = monthInvoices.reduce((sum, inv) => sum + ((inv.subtotal || inv.grandTotal || 0) - ((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))), 0);
      const totalCGST = monthInvoices.reduce((sum, inv) => sum + (inv.cgst || 0), 0);
      const totalSGST = monthInvoices.reduce((sum, inv) => sum + (inv.sgst || 0), 0);
      const totalIGST = monthInvoices.reduce((sum, inv) => sum + (inv.igst || 0), 0);

      setReportData({
        month: selectedMonth,
        totalInvoices: monthInvoices.length,
        totalRevenue,
        totalCGST,
        totalSGST,
        totalIGST,
        grandTotal: monthInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0),
        invoices: monthInvoices
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="card">
      <h2>GST Reports</h2>

      <div className="form-group" style={{ maxWidth: '300px' }}>
        <label>Select Month</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading report data...
        </div>
      ) : reportData ? (
        <>
          <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>
            Monthly Summary - {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card">
              <h4>📊 Total Invoices</h4>
              <div className="value">{reportData.totalInvoices}</div>
            </div>
            <div className="stat-card">
              <h4>💰 Taxable Revenue</h4>
              <div className="value" style={{ fontSize: '20px', color: '#16a34a' }}>
                {formatCurrency(reportData.totalRevenue).slice(0, 12)}
              </div>
            </div>
            <div className="stat-card">
              <h4>🏛️ CGST</h4>
              <div className="value" style={{ fontSize: '20px', color: '#3b82f6' }}>
                {formatCurrency(reportData.totalCGST).slice(0, 10)}
              </div>
            </div>
            <div className="stat-card">
              <h4>🏛️ SGST</h4>
              <div className="value" style={{ fontSize: '20px', color: '#3b82f6' }}>
                {formatCurrency(reportData.totalSGST).slice(0, 10)}
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '15px' }}>Detailed Summary</h3>
          <table className="table">
            <tbody>
              <tr>
                <td><strong>Total Invoices</strong></td>
                <td style={{ textAlign: 'right' }}>{reportData.totalInvoices}</td>
              </tr>
              <tr>
                <td><strong>Total Taxable Revenue</strong></td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(reportData.totalRevenue)}</td>
              </tr>
              <tr>
                <td><strong>Total CGST</strong></td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(reportData.totalCGST)}</td>
              </tr>
              <tr>
                <td><strong>Total SGST</strong></td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(reportData.totalSGST)}</td>
              </tr>
              <tr>
                <td><strong>Total IGST</strong></td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(reportData.totalIGST)}</td>
              </tr>
              <tr style={{ backgroundColor: '#f0f9ff', fontWeight: 'bold' }}>
                <td>Grand Total</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(reportData.grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Invoices in this Month</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Party</th>
                <th>Amount</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>IGST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td><strong>{invoice.invoiceNumber}</strong></td>
                  <td>{invoice.partyName || 'N/A'}</td>
                  <td>{formatCurrency((invoice.subtotal || invoice.grandTotal || 0) - ((invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)))}</td>
                  <td>{formatCurrency(invoice.cgst || 0)}</td>
                  <td>{formatCurrency(invoice.sgst || 0)}</td>
                  <td>{formatCurrency(invoice.igst || 0)}</td>
                  <td><strong>{formatCurrency(invoice.grandTotal)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No invoices found for the selected month
        </div>
      )}
    </div>
  );
};

export default App;
