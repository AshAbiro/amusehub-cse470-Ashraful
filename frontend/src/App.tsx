import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'client';
}

function App() {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'admin' | 'staff' | 'client'
  });
  const [message, setMessage] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, form);
      setUser(res.data);
      setView('dashboard');
      setMessage('✅ Registered!');
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: form.email,
        password: form.password
      });
      setUser(res.data);
      setView('dashboard');
      setMessage('✅ Logged in!');
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed'}`);
    }
  };

  const logout = () => {
    setUser(null);
    setView('login');
    setMessage('');
  };

  // 🚀 NEW BOOKING FUNCTIONS
  const handleBooking = async () => {
    const type = (document.getElementById('bookingType') as HTMLSelectElement).value;
    const details = (document.getElementById('bookingDetails') as HTMLInputElement).value;
    const slots = parseInt((document.getElementById('bookingSlots') as HTMLInputElement).value) || 1;
    
    try {
      const res = await axios.post(`${API_BASE}/bookings`, {
        userEmail: user!.email,
        type,
        details,
        slots
      });
      alert(res.data.message);
      (document.getElementById('bookingDetails') as HTMLInputElement).value = '';
      (document.getElementById('bookingSlots') as HTMLInputElement).value = '';
      fetchBookings();
    } catch (err) {
      alert('Booking failed!');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/bookings`);
      const bookingsList = document.getElementById('bookingsList')!;
      bookingsList.innerHTML = `
        <div className="message">
          <h4>Your Bookings (${res.data.length})</h4>
          ${res.data.map((b: any) => 
            `<p>${b.type.toUpperCase()}: ${b.details} (${b.slots} slots) - ${new Date(b.date).toLocaleString()}</p>`
          ).join('')}
        </div>
      `;
    } catch (err) {
      document.getElementById('bookingsList')!.innerHTML = '<p>No bookings yet</p>';
    }
  };

  if (view === 'dashboard' && user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🎢 AmuseHub Dashboard</h1>
          <div className="user-info">
            <p>👋 {user.name} ({user.role.toUpperCase()})</p>
            <p>{user.email}</p>
          </div>
          
          {user.role === 'admin' && (
            <>
              <h3>👑 Admin Panel</h3>
              <button onClick={logout} className="logout-btn">🚪 Logout</button>
            </>
          )}
          
          {user.role === 'staff' && (
            <>
              <h3>🛠️ Staff Dashboard</h3>
              <button onClick={logout} className="logout-btn">🚪 Logout</button>
            </>
          )}
          
          {user.role === 'client' && (
            <>
              <h3>🎫 Client Portal</h3>
              
              <div className="form">
                <h4>Book Tickets/Rooms/Parking</h4>
                <select id="bookingType" className="input">
                  <option value="ticket">🎢 Tickets</option>
                  <option value="room">🛏️ Rooms</option>
                  <option value="parking">🚗 Parking</option>
                </select>
                <input id="bookingDetails" placeholder="Details (e.g. Roller Coaster x2)" className="input"/>
                <input id="bookingSlots" type="number" placeholder="Slots (1-10)" min="1" max="10" className="input"/>
                <button className="btn" onClick={handleBooking}>Book Now 🎫</button>
              </div>
              
              <div id="bookingsList"></div>
              <button onClick={logout} className="logout-btn">🚪 Logout</button>
            </>
          )}
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎢 AmuseHub</h1>
        {message && <p className="message">{message}</p>}
        
        {view === 'login' && (
          <div className="form">
            <h2>🔐 Login</h2>
            <input name="email" placeholder="Email" value={form.email} onChange={handleInput} className="input" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleInput} className="input" />
            <button onClick={login} className="btn">Login</button>
            <p><button type="button" onClick={() => setView('register')} className="link-btn">Register</button></p>
          </div>
        )}
        
        {view === 'register' && (
          <div className="form">
            <h2>📝 Register</h2>
            <input name="name" placeholder="Name" value={form.name} onChange={handleInput} className="input" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleInput} className="input" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleInput} className="input" />
            <select name="role" value={form.role} onChange={handleInput} className="input">
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={register} className="btn">Register</button>
            <p><button type="button" onClick={() => setView('login')} className="link-btn">Login</button></p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
