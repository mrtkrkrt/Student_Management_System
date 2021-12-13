var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://admin:a@muratkarakurt.9ergo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

/*  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("user", function(err, res) {
    if (err) console.log("Collection already exist");
    console.log("Collection created!");
    db.close();
  });   
});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("admin", function(err, res) {
    if (err) console.log("Collection already exist");
    console.log("Collection created!");
    db.close();
  });   
}); 
*/
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { username: "f", password: "f" };
  dbo.collection("user").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
}); 

/*  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { username: "a", password: "a" };
  dbo.collection("admin").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});  */
/* 
const moongose = require("mongoose");
moongose.connect('mongodb://localhost/Temp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}); */