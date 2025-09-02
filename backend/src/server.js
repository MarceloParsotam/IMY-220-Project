//Marcelo Parsotam u22491717 Pos7 
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get('/{*any}',(req, res) => res.sendFile(path.resolve('public', 'index.html')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

