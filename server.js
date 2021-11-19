const express = require('express');
const sqlite3 = require('sqlite3').verbose();
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const app = express();
const port = 8090;
const db = new sqlite3.Database('db.sqlite');
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS persons (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
});
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

// set a cookie
app.use(function (req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.first_name;
    if (cookie === undefined) {
        // no: set a new cookie
        res.cookie('first_name','changed_first_name', { maxAge: 900000, httpOnly: true });
        console.log('cookie created successfully');
    } else {
        // yes, cookie was already present
        res.cookie('first_name','changed_first_name', );
        console.log('cookie exists', cookie);
    }
    next(); // <-- important!
});

app.get('/', (req, res) => {
    db.serialize(() => {
        db.all('SELECT * FROM persons', [], (err, rows) => {
            res.json(rows);
        });
    })
})
app.post('/', (req, res) => {
    const { name, age } = req.body;
    db.serialize(() => {
        const stmt = db.prepare('INSERT INTO persons (name, age) VALUES (?, ?)');
        stmt.run(name, age);
        stmt.finalize();
        res.json(req.body);
    })
})
app.put('/:id', (req, res) => {
    const { name, age } = req.body;
    const { id } = req.params;
    db.serialize(() => {
        const stmt = db.prepare('UPDATE persons SET name = ?, age = ? WHERE id = ?');
        stmt.run(name, age, id);
        stmt.finalize();
        res.json(req.body);
    })
})
app.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.serialize(() => {
        const stmt = db.prepare('DELETE FROM persons WHERE id = ?');
        stmt.run(id);
        stmt.finalize();
        res.json(req.body);
    })
})
const server = app.listen(port);



