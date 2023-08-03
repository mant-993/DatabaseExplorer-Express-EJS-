express = require("express");
var fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
var articlesRoute = require('./routes/articlesRoute.js');
var path = require('path')

require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
})


if(connection.connect()){
	console.log("connected");
}

app = express();

app.set('connection', connection);
app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/articles', articlesRoute);
//app.use(express.static(path.join(__dirname, 'public')));




app.get("/", (req,res)=>{
	res.render("./pages/index" );
});

app.get('/about', function(req, res) {
  res.render('pages/about');
});


app.listen(5000);

