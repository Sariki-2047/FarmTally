const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FarmTally Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  // Check credentials
  if (email === 'admin@farmtally.in' && password === 'FarmTallyAdmin2024!') {
    // Return format that matches frontend expectations
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'admin-user-id',
          email: email,
          role: 'APPLICATION_ADMIN',
          status: 'APPROVED',
          profile: {
            firstName: 'System',
            lastName: 'Administrator'
          },
          organization_id: null
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLWlkIiwiZW1haWwiOiJhZG1pbkBmYXJtdGFsbHkuaW4iLCJyb2xlIjoiQVBQTElDQVRJT05fQURNSU4iLCJvcmdhbml6YXRpb25JZCI6bnVsbCwiZXhwIjoxNzYxMDY0MzY5fQ.mock-jwt-token-for-testing',
          refreshToken: 'mock-refresh-token-for-testing'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Add other endpoints as needed
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
