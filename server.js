const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;
const FILE_PATH = './data.json';

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'supersecretpassword123',
    resave: false,
    saveUninitialized: true,
}));

// Load dữ liệu từ file
function loadRegistrations() {
    if (!fs.existsSync(FILE_PATH)) return [];
    return JSON.parse(fs.readFileSync(FILE_PATH));
}

// Ghi dữ liệu vào file
function saveRegistrations(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// Trang đăng nhập
app.get('/login', (req, res) => {
    res.render('login');
});

// Xử lý đăng nhập
app.post('/login', (req, res) => {
    const { password } = req.body;
    const correctPassword = 'toan123';

    if (password === correctPassword) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.send('Sai mật khẩu!');
    }
});

// Đăng xuất
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Trang admin (chỉ hiển thị nếu đã đăng nhập)
app.get('/admin', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    const data = loadRegistrations();
    data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.render('admin', { data });
});

// Xóa mục đăng ký
app.get('/admin/delete-by-time/:timestamp', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    const timestamp = req.params.timestamp;
    let data = loadRegistrations();

    data = data.filter(entry => entry.timestamp !== timestamp);

    saveRegistrations(data);
    console.log(`Đã xóa mục có timestamp: ${timestamp}`);
    res.redirect('/admin');
});
// xóa All
app.get('/admin/delete-all', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    saveRegistrations([]); // Ghi file rỗng
    console.log('Đã xóa toàn bộ dữ liệu');
    res.redirect('/admin');
});


// Đăng ký mới
app.post('/register', (req, res) => {
    const { name, time, song } = req.body;
    const timestamp = new Date().toISOString();
    const newEntry = { name, time, song, timestamp };

    const data = loadRegistrations();
    data.push(newEntry);
    data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    saveRegistrations(data);

    res.redirect('/danhsach');
});

// Hiển thị danh sách đăng ký
app.get('/danhsach', (req, res) => {
    const data = loadRegistrations();
    data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.render('danhsach', { data });
});

// Khởi động server
app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});

