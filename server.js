// server.js
// Simple safe demo: serves a login page and a local demo feed.
// WARNING: This is ONLY for learning. Do NOT use to collect real credentials.

const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ====== CONFIG ======
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory session (for demo only)
app.use(session({
  secret: 'demo-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure:true requires HTTPS
}));

// ====== Hardcoded demo account (ONLY for learning) ======
const DEMO_USER = { username: 'testuser', password: 'password123' };

// ====== Routes ======

// Serve login page (uses inline CSS similar to your HTML)
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/feed');
  }
  res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Instagram-style Demo</title>
<style>
  body{background:#fafafa;font-family:Arial, sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}
  .container{background:#fff;border:1px solid #dbdbdb;padding:40px 30px;width:350px;text-align:center;border-radius:6px}
  .logo{font-size:40px;font-weight:700;color:#262626;margin-bottom:18px}
  input[type=text],input[type=password]{width:100%;padding:10px;margin:6px 0;border:1px solid #dbdbdb;border-radius:3px;background:#fafafa;box-sizing:border-box}
  button{width:100%;padding:10px;background:#0095f6;color:#fff;border:none;border-radius:5px;font-weight:700;margin-top:10px;cursor:pointer}
  .divider{margin:18px 0;color:#999}
  .small{font-size:13px;color:#666;margin-top:10px}
  .error{color:#d93025;margin-top:8px}
</style>
</head>
<body>
  <div class="container">
    <div class="logo">Instagram</div>
    <form method="POST" action="/login">
      <input name="identifier" type="text" placeholder="Phone number, username, or email" autocomplete="username"/>
      <input name="password" type="password" placeholder="Password" autocomplete="current-password"/>
      <button type="submit">Log In</button>
    </form>
    <div class="divider">OR</div>
    <button onclick="alert('This is a demo only')"
            style="background:#385185;color:#fff;border:none;padding:10px;border-radius:5px;cursor:pointer">Log in with Facebook</button>
    <div class="small">Don't have an account? <a href="#" onclick="alert('Demo - sign up disabled')">Sign up</a></div>
    <div class="small" style="margin-top:12px;color:#444">Demo account: <strong>testuser</strong> / <strong>password123</strong></div>
    ${req.query.error ? `<div class="error">${req.query.error}</div>` : ''}
  </div>
</body>
</html>`);
});

// Handle login POST (ONLY checks demo credentials locally)
app.post('/login', (req, res) => {
  const id = (req.body.identifier || '').trim();
  const pw = req.body.password || '';

  if (!id || !pw) {
    return res.redirect('/?error=' + encodeURIComponent('Please enter both username and password.'));
  }

  // SAFE: only accept the hardcoded demo account.
  if ((id === DEMO_USER.username || id === 'testuser@example.com') && pw === DEMO_USER.password) {
    // login success: store minimal info in session (NO real passwords)
    req.session.user = { username: DEMO_USER.username };
    return res.redirect('/feed');
  }

  return res.redirect('/?error=' + encodeURIComponent('Invalid demo credentials. Use testuser / password123'));
});

// Demo feed (protected)
app.get('/feed', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  res.send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Demo Feed</title>
<style>
  body{font-family:Arial, sans-serif;background:#f2f2f2;margin:0;padding:20px}
  .topbar{background:#fff;border:1px solid #dbdbdb;padding:12px;border-radius:6px;display:flex;align-items:center;gap:12px}
  .card{max-width:720px;margin:14px auto}
  .post{background:#fff;border:1px solid #dbdbdb;padding:12px;border-radius:6px;margin-top:12px}
  button{padding:6px 10px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer}
</style>
</head><body>
  <div class="card">
    <div class="topbar">
      <div style="font-weight:700">Insta Demo Feed</div>
      <div style="margin-left:auto">Hello, <strong>${req.session.user.username}</strong> &nbsp; <form style="display:inline" method="POST" action="/logout"><button type="submit">Logout</button></form></div>
    </div>

    <div class="post"><div style="font-weight:600">@photofan</div><div style="margin-top:8px">Beautiful sunset from my rooftop. 🌇</div></div>
    <div class="post"><div style="font-weight:600">@codebuddy</div><div style="margin-top:8px">Built a small demo login today — learning frontend!</div></div>
    <div class="post"><div style="font-weight:600">@travelguy</div><div style="margin-top:8px">Planning the next trip. Where should I go?</div></div>
  </div>
</body></html>`);
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => console.log(`Demo app running at http://localhost:${PORT}`));
