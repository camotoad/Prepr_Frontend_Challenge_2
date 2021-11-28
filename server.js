const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mysql = require('mysql');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session ({
        secret: 'not-very-secret-key',
        saveUninitialized: false,
        resave: false
    })
);
app.use(flash());
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('register');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/login', (req, res) => {
    res.render('login');
});

const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : ''
    ,database    : 'frontend_2_login_db'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql Connected');
});


app.listen('3000', () => {
    console.log('Server running at http://localhost:3000/');
});