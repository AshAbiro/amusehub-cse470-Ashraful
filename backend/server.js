const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'data/users.json');
const BOOKINGS_FILE = path.join(__dirname, 'data/bookings.json');

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function loadBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveBookings(bookings) {
  await fs.mkdir(path.dirname(BOOKINGS_FILE), { recursive: true });
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

app.get('/', (req, res) => {
  res.json({ message: 'AmuseHub API running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }
    const users = await loadUsers();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), name, email, password: hash, role };
    users.push(user);
    await saveUsers(users);
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const users = await loadUsers();
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await loadBookings();
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { userEmail, type, details, slots } = req.body;
    const bookings = await loadBookings();
    const booking = {
      id: Date.now().toString(),
      userEmail, 
      type, 
      details,
      slots: slots || 1,
      date: new Date().toISOString(),
      status: "confirmed"
    };
    bookings.push(booking);
    await saveBookings(bookings);
    res.json({ message: '🎫 Booking confirmed!', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Booking failed' });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await loadBookings();
    const users = await loadUsers();
    const bookingsWithNames = bookings.map(b => {
      const user = users.find(u => u.email === b.userEmail);
      return { ...b, userName: user ? user.name : 'Unknown' };
    });
    res.json(bookingsWithNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Admin bookings failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👑 Admin: http://localhost:${PORT}/api/admin/bookings`);
});
