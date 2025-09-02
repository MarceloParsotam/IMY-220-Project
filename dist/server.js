"use strict";

//Marcelo Parsotam u22491717 Pos7 
var express = require("express");
var path = require("path");
var app = express();
var PORT = 3000;
app.use(express["static"](path.join(__dirname, "../public")));
app.get('/{*any}', function (req, res) {
  return res.sendFile(path.resolve('public', 'index.html'));
});
app.listen(PORT, function () {
  console.log("Server running at http://localhost:".concat(PORT));
});