const https = require('https');

const data = JSON.stringify({
  email: 'test@focusforest.com',
  password: 'Test1234!'
});

const req = https.request({
  hostname: 'focusforest-backend.onrender.com',
  port: 443,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Origin': 'http://localhost:5173'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS: ', res.headers);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
