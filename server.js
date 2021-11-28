const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mysql = require('mysql');
const bcrypt = require('bcrypt');


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
    return res.render('register');
});
app.get('/register', (req, res) => {
    return res.render('register');
});
app.get('/login', (req, res) => {
    return res.render('login');
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

app.post('/register', (req,res) => {
    // could be avoided with 'required' but it doesnt look as fancy right?
    if(req.body.password !== req.body.con_password){
        req.flash('con_password', 'Passwords do not match.');
        return res.redirect('/');
    } else if(req.body.password == '' || req.body.password == undefined) {
        req.flash('password', 'Password need to be at least 6 characters long.');
        return res.redirect('/');
    } else if(req.body.password.length < 6) {
        req.flash('password', 'Password need to be at least 6 characters long.');
        return res.redirect('/');
    }  else if (req.body.first_name == ''){
        req.flash('first_name', 'Please enter your First Name');
        return res.redirect('/');
    } else if (req.body.last_name == ''){
        req.flash('last_name', 'Please enter your Last Name');
        return res.redirect('/');
    } else if (req.body.username == ''){
        req.flash('username', 'Please enter a username.');
        return res.redirect('/');
    } else if (req.body.email == ''){
        req.flash('email', 'Please enter your email');
        return res.redirect('/');
    } else if (req.body.user_type == ''){
        req.flash('user_type', 'Please select a user type');
        return res.redirect('/');
    } else if (req.body.status == ''){
        req.flash('status', 'Please select a status');
        return res.redirect('/');
    } 

    let ematch = `select * from users where email = '${req.body.email}'`;
    db.query(ematch, (err, result) => {
        if (err) {
            return res.end(JSON.stringify(err));
        }   
        if(result.length > 0){
            req.flash('email', 'This email has been taken.');
            return res.redirect('/');
       } else {
            try{
                const hashedPw = bcrypt.hashSync(req.body.password, 10);
                let q = `insert into users(first_name, last_name, username, password, email, phone_number, user_type, status, referral_code) values ('${req.body.first_name}', '${req.body.last_name}', '${req.body.username}','${hashedPw}', '${req.body.email}', '${req.body.phone_number}', '${req.body.user_type}', '${req.body.status}', '${req.body.referral_code}')`;
                db.query(q, (err, result) => {
                    if (err) {
                        return res.end(JSON.stringify(err));
                    }   
                    req.flash('success', 'Your account has been created, Please log in');
                    return res.redirect('/login');
                });
            } catch (e){
                req.flash('error', 'There was an error on our end.');
                console.log(e);
                return res.redirect('/');
            } 
        }
    });

    
});

app.post('/login', (req, res) => {
    let q = `select * from users where username = '${req.body.username}'`;
    db.query(q, (err, result) => {
        if (err) return res.end(JSON.stringify(err));
        try{
            if(result.length > 0 && result){
                //console.log(result);
                if(bcrypt.compare(req.body.password, result[0].password)){
                    return res.end(JSON.stringify(result));
                } 
                req.flash('error', 'Your information does not match our records.');
                return res.redirect('/login');
            }
            else {
                req.flash('error', 'Your information does not match our records.');
                return res.redirect('/login');
            }
        } catch(e) {
            req.flash('error', 'There was an error on our end.');
            console.log(e);
            return res.redirect('/login');
        }
    });
});


app.listen('3000', () => {
    console.log('Server running at http://localhost:3000/');
});