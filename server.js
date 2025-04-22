const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const FILE_PATH = './data.json';

const session = require('express-session');

app.use(session({
    secret: 'supersecretpassword123', // Chuỗi bí mật
    resave: false,
    saveUninitialized: true,
}));

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/admin', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    const data = loadRegistrations();
    res.render('admin', { data });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


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


function loadRegistrations() {
    if (!fs.existsSync(FILE_PATH)) return [];
    return JSON.parse(fs.readFileSync(FILE_PATH));
}
function saveRegistrations(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

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

app.get('/danhsach', (req, res) => {
    const data = loadRegistrations();
    data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.render('danhsach', { data });
});

// Trang quản trị
app.get('/admin', (req, res) => {
    const data = loadRegistrations();
    res.render('admin', { data });
});

// Xóa mục đăng ký
app.get('/admin/delete/:index', (req, res) => {
    const index = req.params.index;
    const data = loadRegistrations();
    data.splice(index, 1); // Xóa mục tại index
    saveRegistrations(data); // Lưu lại dữ liệu
    res.redirect('/admin'); // Quay lại trang quản trị
});

// Khởi động server
app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});

