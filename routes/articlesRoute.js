const express = require('express');
const router = express.Router();

var tables;
var primaryKeys;
var selected = []

router.get('/', (req,res)=>{
	let connection = req.app.get('connection');
	connection.query('SHOW TABLES', function(err, rows, fields) {
	  if (err){
		res.send(err);
	  } 
	  else{
		//console.log(tables);
		tables=Object.values(JSON.parse(JSON.stringify(rows)));
		res.render('pages/articles', {tables:tables, itemList:[]});
	  }
	});
	  //res.render('pages/articles', {itemList:[]})
  })

router.get('/:category/changeSel/:primaryKeys', function(req, res) {

	
	let category = req.params['category'];
	selected = req.params.primaryKeys;
	console.log("changed to "+selected);
	res.redirect('http://localhost:5000/articles/'+category);

});

router.get('/:category/', function(req, res) {
	let category = req.params['category'];
  	let connection = req.app.get('connection');
  	let result=[];
	primaryKeys=[];
	connection.query("SHOW KEYS FROM "+category+" WHERE Key_name = 'PRIMARY'", function(err, fields){
		fields.forEach(function(field){
			primaryKeys.push(field.Column_name)
		})
	});

  	if(JSON.stringify(req.query) === '{}'){
	  	connection.query('SELECT * FROM '+category, function(err, rows, fields) {
			if (err){
			 	res.send(err);
			} 
			else{
				result=Object.values(JSON.parse(JSON.stringify(rows)));
				keys=Object.values(JSON.parse(JSON.stringify(fields)));
				//console.log(keys);
				//console.log(rows);
				res.render('pages/articles', {tables:tables, primaryKeys:primaryKeys, itemKeys:keys, itemList:result, selected:selected});
			}
		});
  	}
	else{
		let prop = req.query.optradio.toString();
		let value = req.query.value.toString();
		connection.query('SELECT * FROM '+category+' WHERE ' +  prop + ' = (?)', [value], function(err, rows, fields) {
			if (err){
				console.log(err);
			} 
			else{
				result=Object.values(JSON.parse(JSON.stringify(rows)));
				keys=Object.values(JSON.parse(JSON.stringify(fields)));
				res.render('pages/articles', {tables:tables, primaryKeys:primaryKeys, itemKeys:keys, itemList:result, selected:selected});
			}
		});
	}
});

router.get('/:category/:id', async(req, res) =>{
	let category = req.params['category'];
    let connection = req.app.get('connection');
	let id=Number(req.params['id']);
	connection.query('SELECT * FROM '+category+' WHERE id = (?)', [id], function(err, rows, fields) {
    	if (err){
			console.log(err);
			res.send(err);
		} 
		else{
			result=Object.values(JSON.parse(JSON.stringify(rows)));
			keys=Object.values(JSON.parse(JSON.stringify(fields)));
		    res.render('pages/articles', {tables:tables, itemKeys:keys, itemList:result, selected:selected});
		}
	});
});


router.post('/:category/',async (req, res) => {
	let category = req.params['category'];
    let connection = req.app.get('connection');
    let body = req.body;
	var keys = Object.keys(body);
	var values = Object.values(body);

    try {
        const result = await connection.query('insert into '+category+' ('+keys+') values (?)', [values]);
        res.redirect(category);
    } catch (err) {
        //throw err;
		res.send(err);
    }
});


router.delete('/:category/:id', async(req, res) =>{

	let category = req.params['category'];
    let connection = req.app.get('connection');
	let pkvalues=req.params['id'].split('&');
	let idQuery='';
	for(let i=0;i<pkvalues.length;i++){
		idQuery+=primaryKeys[i]+'='+pkvalues[i]+' AND ';
	}
	idQuery = idQuery.slice(0,-5);
	connection.query('DELETE FROM '+category+' WHERE '+idQuery, function(err, rows, fields) {
    	if (err){
			console.log(err);
			res.send(err);
		} 
		else{
		    res.send("deleted")
		}
	});
});

router.put('/:category/:id', async(req, res) =>{

	let category = req.params['category'];
    let connection = req.app.get('connection');
	let body = req.body;
	var keys = Object.keys(body);
	var values = Object.values(body);
	let pkvalues=req.params['id'].split('&');
	let idQuery='';
	for(let i=0;i<pkvalues.length;i++){
		idQuery+=primaryKeys[i]+'='+pkvalues[i]+' AND ';
	}
	idQuery = idQuery.slice(0,-5);
	let fieldSetQuery="";
	keys.forEach(function(key){
		fieldSetQuery+=key+'="'+body[key]+'", '
	})
	//console.log(fieldSetQuery)
	connection.query('UPDATE '+category+' SET '+fieldSetQuery.slice(0,-2)+' WHERE '+idQuery, function(err, rows, fields) {
    	if (err){
			console.log(err);
			res.send(err);
		} 
		else{
		    res.send("updated")
		}
	});
});

module.exports = router;