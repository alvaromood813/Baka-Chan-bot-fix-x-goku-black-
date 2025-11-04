const express = require("express");
const http = require("http");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'goatbot-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: false
  }
}));

// Flash messages
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// View engine setup
app.set('view engine', 'eta');
app.set('views', path.join(__dirname, 'views'));

// Global variables
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.errors = req.flash('errors');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');
  res.locals.user = req.user || null;
  next();
});

module.exports = async (api) => {
  if (!api) {
    await require("./connectDB.js")();
  }

  // Import routes
  const loginRoute = require('./routes/login');
  const registerRoute = require('./routes/register');
  const dashboardRoute = require('./routes/dashBoard');
  const forgotPasswordRoute = require('./routes/forgotPassword');
  const changePasswordRoute = require('./routes/changePassword');
  const verifyfbidRoute = require('./routes/verifyfbid');
  const apiRoute = require('./routes/api');

  // Use routes
  app.use('/login', loginRoute);
  app.use('/register', registerRoute);
  app.use('/dashboard', dashboardRoute({
    isAuthenticated: require('./middleware').isAuthenticated,
    isVeryfiUserIDFacebook: require('./middleware').isVeryfiUserIDFacebook,
    checkHasAndInThread: require('./middleware').checkHasAndInThread,
    threadsData: global.db.threadsData,
    checkAuthConfigDashboardOfThread: require('./middleware').checkAuthConfigDashboardOfThread,
    imageExt: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    videoExt: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
    audioExt: ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
    convertSize: (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    drive: global.drive,
    isVideoFile: (filename) => {
      const ext = path.extname(filename).toLowerCase();
      return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'].includes(ext);
    }
  }));
  app.use('/forgot-password', forgotPasswordRoute);
  app.use('/change-password', changePasswordRoute);
  app.use('/verifyfbid', verifyfbidRoute);
  app.use('/api', apiRoute);

  // Home route
  app.get('/', (req, res) => {
    res.render('home', {
      title: 'Home - Baka-Chan Dashboard'
    });
  });

  // Stats route
  app.get('/stats', [require('./middleware').isAuthenticated], async (req, res) => {
    try {
      const totalThreads = await global.db.threadsData.getAll();
      const totalUsers = await global.db.usersData.getAll();

      res.render('stats', {
        title: 'Statistics - Baka-Chan Dashboard',
        totalThreads: totalThreads.length,
        totalUsers: totalUsers.length,
        botName: global.GoatBot.config.nickNameBot || 'Baka-Chan'
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.render('stats', {
        title: 'Statistics - Baka-Chan Dashboard',
        totalThreads: 0,
        totalUsers: 0,
        botName: 'Baka-Chan'
      });
    }
  });

  // Donate route
  app.get('/donate', (req, res) => {
    res.render('donate', {
      title: 'Donate - Baka-Chan Dashboard'
    });
  });

  // Logout route
  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      req.flash('success', { msg: 'Successfully logged out' });
      res.redirect('/login');
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).render('404', {
      title: '404 - Page Not Found'
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dashboard server is running on port ${PORT}`);
    console.log(`Access at: http://0.0.0.0:${PORT}`);
  });

  return server;
};