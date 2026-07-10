import React, { useState, useEffect, useCallback } from 'react';
import { 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Filter, 
  Car, 
  Lock, 
  Mail,
  User as UserIcon
} from 'lucide-react';
import { api, type User, type Vehicle, getUser } from './api';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(getUser());
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<'USER' | 'ADMIN'>('USER');

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter state
  const [searchMake, setSearchMake] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPriceMin, setSearchPriceMin] = useState<number | ''>('');
  const [searchPriceMax, setSearchPriceMax] = useState<number | ''>('');

  // UI state (Alerts & Modals)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Modal configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'restock'>('add');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Form state for Add/Edit
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formQuantity, setFormQuantity] = useState<number | ''>('');
  
  // Form state for Restock
  const [restockQty, setRestockQty] = useState<number | ''>('');

  // Helper: Trigger custom alert
  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  // Fetch Vehicles
  const fetchVehicles = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, showAlert]);

  // Load vehicles when logged in
  useEffect(() => {
    if (currentUser) {
      fetchVehicles();
    }
  }, [currentUser, fetchVehicles]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showAlert('error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.login(authEmail, authPassword);
      setCurrentUser(res.user);
      showAlert('success', 'Logged in successfully!');
      setAuthPassword('');
    } catch (err: any) {
      showAlert('error', err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showAlert('error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await api.register(authEmail, authPassword, authRole);
      showAlert('success', 'Registration successful! You can now log in.');
      setIsRegistering(false);
      setAuthPassword('');
    } catch (err: any) {
      showAlert('error', err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setVehicles([]);
    showAlert('success', 'Logged out successfully');
  };

  // Handle Search & Filter
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.searchVehicles({
        make: searchMake || undefined,
        model: searchModel || undefined,
        category: searchCategory || undefined,
        priceMin: searchPriceMin !== '' ? searchPriceMin : undefined,
        priceMax: searchPriceMax !== '' ? searchPriceMax : undefined,
      });
      setVehicles(data);
    } catch (err: any) {
      showAlert('error', err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchMake('');
    setSearchModel('');
    setSearchCategory('');
    setSearchPriceMin('');
    setSearchPriceMax('');
    fetchVehicles();
  };

  // Purchase Vehicle
  const handlePurchase = async (id: string) => {
    try {
      const updated = await api.purchaseVehicle(id);
      setVehicles(prev => prev.map(v => v.id === id ? updated : v));
      showAlert('success', `Purchased! 1 unit of ${updated.make} ${updated.model} claimed.`);
    } catch (err: any) {
      showAlert('error', err.message || 'Purchase failed');
    }
  };

  // Delete Vehicle
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${name}?`)) return;
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      showAlert('success', `${name} deleted successfully.`);
    } catch (err: any) {
      showAlert('error', err.message || 'Delete failed');
    }
  };

  // Open Modal Helpers
  const openAddModal = () => {
    setModalMode('add');
    setSelectedVehicle(null);
    setFormMake('');
    setFormModel('');
    setFormCategory('');
    setFormPrice('');
    setFormQuantity('');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    setFormMake(vehicle.make);
    setFormModel(vehicle.model);
    setFormCategory(vehicle.category);
    setFormPrice(vehicle.price);
    setFormQuantity(vehicle.quantity);
    setIsModalOpen(true);
  };

  const openRestockModal = (vehicle: Vehicle) => {
    setModalMode('restock');
    setSelectedVehicle(vehicle);
    setRestockQty('');
    setIsModalOpen(true);
  };

  // Submit Modal Actions
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (modalMode === 'add') {
        if (!formMake || !formModel || !formCategory || formPrice === '' || formQuantity === '') {
          showAlert('error', 'Please fill in all vehicle parameters');
          return;
        }
        const created = await api.createVehicle({
          make: formMake,
          model: formModel,
          category: formCategory,
          price: Number(formPrice),
          quantity: Number(formQuantity),
        });
        setVehicles(prev => [created, ...prev]);
        showAlert('success', `Added ${created.make} ${created.model} successfully!`);
        setIsModalOpen(false);
      } else if (modalMode === 'edit') {
        if (!selectedVehicle) return;
        const updated = await api.updateVehicle(selectedVehicle.id, {
          make: formMake || undefined,
          model: formModel || undefined,
          category: formCategory || undefined,
          price: formPrice !== '' ? Number(formPrice) : undefined,
          quantity: formQuantity !== '' ? Number(formQuantity) : undefined,
        });
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updated : v));
        showAlert('success', `Updated ${updated.make} ${updated.model} specs.`);
        setIsModalOpen(false);
      } else if (modalMode === 'restock') {
        if (!selectedVehicle || restockQty === '' || Number(restockQty) < 1) {
          showAlert('error', 'Please enter a valid quantity of 1 or more');
          return;
        }
        const updated = await api.restockVehicle(selectedVehicle.id, Number(restockQty));
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updated : v));
        showAlert('success', `Restocked ${updated.make} ${updated.model} (+${restockQty}).`);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Brand & Header / Auth Info */}
      <header className="navbar glass-panel">
        <div className="brand">
          <Car size={32} className="brand-logo" style={{ color: '#66fcf1' }} />
          <span>Velocity</span> Motors
        </div>
        {currentUser && (
          <div className="nav-user">
            <span className="badge admin" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserIcon size={12} />
              {currentUser.email}
            </span>
            <span className={`badge ${currentUser.role === 'ADMIN' ? 'admin' : 'user'}`}>
              {currentUser.role}
            </span>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <LogOut size={14} /> Log Out
            </button>
          </div>
        )}
      </header>

      {/* Global Alerts Banner */}
      {alert && (
        <div className={`alert-banner ${alert.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="modal-close" style={{ fontSize: '1rem', color: 'inherit' }}>&times;</button>
        </div>
      )}

      {/* MAIN LAYOUT CONDITIONAL */}
      {!currentUser ? (
        <div className="auth-wrapper">
          <div className="auth-card glass-panel">
            <div className="auth-header">
              <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isRegistering ? 'Register to view and purchase vehicles' : 'Sign in to access your inventory'}</p>
            </div>
            
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f9296' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                    placeholder="name@dealership.com"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#8f9296' }} />
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ paddingLeft: '2.5rem', width: '100%' }}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label>Assign Role</label>
                  <select 
                    className="form-control"
                    value={authRole}
                    onChange={e => setAuthRole(e.target.value as any)}
                  >
                    <option value="USER">Customer (User)</option>
                    <option value="ADMIN">Dealership Staff (Admin)</option>
                  </select>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
                {isLoading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              {isRegistering ? (
                <>
                  Already have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}>Log In</a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}>Sign Up</a>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* DASHBOARD VIEW */
        <>
          {/* Dashboard Control Buttons (Admins) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff', fontWeight: 800 }}>Dealership Showroom</h2>
            {currentUser.role === 'ADMIN' && (
              <button onClick={openAddModal} className="btn btn-accent">
                <Plus size={18} /> Add New Vehicle
              </button>
            )}
          </div>

          {/* Filter / Search Panel */}
          <form onSubmit={handleSearch} className="filter-bar glass-panel">
            <div className="form-group">
              <label>Make</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Toyota" 
                value={searchMake}
                onChange={e => setSearchMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Camry" 
                value={searchModel}
                onChange={e => setSearchModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Sedan" 
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Min Price ($)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0" 
                value={searchPriceMin}
                onChange={e => setSearchPriceMin(e.target.value !== '' ? Number(e.target.value) : '')}
              />
            </div>
            <div className="form-group">
              <label>Max Price ($)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="100000" 
                value={searchPriceMax}
                onChange={e => setSearchPriceMax(e.target.value !== '' ? Number(e.target.value) : '')}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                <Search size={16} /> Search
              </button>
              <button type="button" onClick={handleResetFilters} className="btn btn-outline" style={{ padding: '0.75rem' }} title="Reset Filters">
                <RefreshCw size={16} />
              </button>
            </div>
          </form>

          {/* Showroom Vehicles Grid */}
          {isLoading && vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw className="spin" size={32} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: '#66fcf1' }} />
              <p>Scanning Inventory...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: '#8f9296' }}>
              <Filter size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h3>No vehicles found matching filters.</h3>
              <p>Try modifying your search queries or reset filters.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map(vehicle => {
                const isOutOfStock = vehicle.quantity <= 0;
                const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 3;
                
                return (
                  <div key={vehicle.id} className="vehicle-card glass-card">
                    <div>
                      <div className="vehicle-header">
                        <span className="vehicle-category">{vehicle.category}</span>
                        <div className="stock-indicator">
                          <span className={`stock-dot ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`} />
                          <span style={{ 
                            color: isOutOfStock ? '#e74c3c' : isLowStock ? '#f1c40f' : '#2ecc71',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `LOW STOCK (${vehicle.quantity})` : 'IN STOCK'}
                          </span>
                        </div>
                      </div>
                      <h3 className="vehicle-title">{vehicle.make} {vehicle.model}</h3>
                      <div className="vehicle-price">
                        ${vehicle.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="vehicle-actions">
                      <button 
                        onClick={() => handlePurchase(vehicle.id)} 
                        disabled={isOutOfStock}
                        className="btn btn-primary"
                        style={{ width: '100%', gap: '0.5rem' }}
                      >
                        <DollarSign size={16} /> Purchase {isOutOfStock ? '(Unavailable)' : ''}
                      </button>

                      {currentUser.role === 'ADMIN' && (
                        <div className="vehicle-admin-actions">
                          <button onClick={() => openEditModal(vehicle)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                            <Edit size={12} /> Edit
                          </button>
                          <button onClick={() => openRestockModal(vehicle)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem', color: '#a2f2b7', borderColor: 'rgba(46, 204, 113, 0.3)' }}>
                            <RefreshCw size={12} /> Restock
                          </button>
                          <button 
                            onClick={() => handleDelete(vehicle.id, `${vehicle.make} ${vehicle.model}`)} 
                            className="btn btn-danger" 
                            style={{ gridColumn: 'span 2', fontSize: '0.8rem', padding: '0.5rem' }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ADMIN MODALS (ADD / EDIT / RESTOCK) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>
                {modalMode === 'add' && 'Add Vehicle to Inventory'}
                {modalMode === 'edit' && `Edit Spec: ${selectedVehicle?.make} ${selectedVehicle?.model}`}
                {modalMode === 'restock' && `Restock Stock: ${selectedVehicle?.make} ${selectedVehicle?.model}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
            </div>

            <form onSubmit={handleModalSubmit}>
              {modalMode === 'restock' ? (
                <div className="form-group">
                  <label>Current Stock: {selectedVehicle?.quantity} units</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter additional stock units" 
                    value={restockQty}
                    onChange={e => setRestockQty(e.target.value !== '' ? Number(e.target.value) : '')}
                    min={1}
                    required
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Make / Brand</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Ford" 
                      value={formMake}
                      onChange={e => setFormMake(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Mustang" 
                      value={formModel}
                      onChange={e => setFormModel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Sports / SUV / Electric" 
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Retail Price ($)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 45000" 
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                      min={0}
                      step="any"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Quantity in Stock</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 5" 
                      value={formQuantity}
                      onChange={e => setFormQuantity(e.target.value !== '' ? Number(e.target.value) : '')}
                      min={0}
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn btn-accent">
                  {isLoading ? 'Saving...' : modalMode === 'restock' ? 'Restock' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
