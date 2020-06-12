const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySql = require("mysql");
let connectionDb = require("./lib/connectionDb");
let competenciaController = require("./controllers/competenciasController");

let app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

app.use(cors());

app.get("/competencias", competenciaController.listarCompetencias);
app.get("/competencias/:id/peliculas", competenciaController.obtenerOpciones);
app.post("/competencias/:id/voto", competenciaController.guardarVoto);
app.get("/competencias/:id/resultados", competenciaController.obtenerResultados);
app.post("/competencias", competenciaController.crearCompetencia);
app.delete("/competencias/:id/votos", competenciaController.reiniciarCompetencia);
app.get("/generos", competenciaController.obtenerGeneros);
app.get("/directores", competenciaController.obtenerDirectores);
app.get("/actores", competenciaController.obtenerActores);
app.delete("/competencias/:id", competenciaController.eliminarCompetencia);
app.get("/competencias/:id", competenciaController.obtenerCompetencia);
app.put("/competencias/:id/", competenciaController.editarCompetencia);

let puerto = 8080;

app.listen(puerto, function () {
  console.log("escuchando puerto " + puerto);
  connectionDb.connect();
});
