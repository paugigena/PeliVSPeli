let connectionDb = require("../lib/connectionDb");

function listarCompetencias(req, res) {
  let query = "select * from competencia";

  connectionDb.query(query, function (error, results) {
    if (error) {
      console.log("error", error);
      throw error;
    }

    let respuesta = {
      competencias: results,
    };
    res.send(JSON.stringify(respuesta));
  });
}

function obtenerOpciones(req, res) {
  let idComp = req.params.id;
  let queryComp = `Select competencia.nombre, competencia.genero_id, competencia.director_id, competencia.actor_id from competencia  where id= '${idComp}'`;

  connectionDb.query(queryComp, function (error, result) {
    if (error) throw error;

    if (result.length == 0) {
      res.status(404).send();
      return;
    }

    console.log(result);

    let query = `Select distinct p.titulo, p.poster, p.id , p.genero_id
                from pelicula p, actor_pelicula ap, director_pelicula dp
                where 
                ap.pelicula_id=p.id
                and 
                dp.pelicula_id=p.id
                and
                (${result[0].genero_id} is null or p.genero_id = ${result[0].genero_id})
                and (${result[0].director_id} is null or dp.director_id = ${result[0].director_id})
                and (${result[0].actor_id} is null or ap.actor_id = ${result[0].actor_id})
                order by rand() limit 0,2;`;

    connectionDb.query(query, function (error, result2) {
      if (error) {
        console.log("error!!", error);
        throw error;
      }

      var respuesta = {
        competencia: result[0].nombre,
        peliculas: result2,
      };

      res.send(JSON.stringify(respuesta));
    });
  });
}

function guardarVoto(req, res) {
  let idComp = req.params.id;
  let idPel = req.body.idPelicula;
  let cantidadVotos = 1;
  let querySelect = `select * from voto where pelicula_id = '${idPel}'and competencia_id = '${idComp}'`;
  let queryInsert = `insert into voto (pelicula_id, competencia_id, cantidad_votos) values('${idPel}','${idComp}', '${cantidadVotos}')`;

  connectionDb.query(querySelect, function (error, results) {
    if (error) {
      console.log("error", error);
      throw error;
    }

    if (results.length > 0) {
      let queryUpdate = `update voto set cantidad_votos=${++results[0]
        .cantidad_votos} where id=${results[0].id}`;

      connectionDb.query(queryUpdate, function (error, results) {
        if (error) {
          console.log("error", error);
          throw error;
        }
        res.send("se actualizan votos correctamente");
      });
    } else {
      connectionDb.query(queryInsert, function (error, results) {
        if (error) {
          console.log("error", error);
          throw error;
        }
        res.send("se agregan votos correctamente");
      });
    }
  });
}

function obtenerResultados(req, res) {
  let id = req.params.id;
  let queryCompetencia = `select c.nombre from competencia c where c.id= '${id}'`;
  let query = `Select v.pelicula_id, v.cantidad_votos as votos, p.titulo, p.poster 
              from pelicula p 
              inner join voto v 
              on v.pelicula_id = p.id 
              where v.competencia_id='${id}'
              order by votos desc
              limit 0,3; `;

  connectionDb.query(queryCompetencia, function (error, result) {
    if (error) {
      console.log("error", error);
      throw error;
    }
    if (result.length != 1) {
      res.status(400).send("la competencia no fue encontrada");
      return;
    }
    connectionDb.query(query, function (error, result2) {
      if (error) {
        console.log("error", error);
        throw error;
      }

      var respuesta = {
        competencia: result[0].nombre,
        resultados: result2,
      };

      res.send(JSON.stringify(respuesta));
    });
  });
}

function crearCompetencia(req, res) {
  let nombreCompetencia = req.body.nombre.trim();
  let idGenero = req.body.genero == 0 ? null : req.body.genero;
  let idDirector = req.body.director == 0 ? null : req.body.director;
  let idActor = req.body.actor == 0 ? null : req.body.actor;

  let queryInsert = `INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES ('${nombreCompetencia}',${idGenero},${idDirector}, ${idActor});`;
  let queryCheck = `SELECT COUNT(*) AS cantidad FROM competencia
                    WHERE trim(lower(nombre)) = lower('${nombreCompetencia}')
                    UNION ALL
                    SELECT COUNT(distinct p.id) AS cantidad 
                    FROM pelicula p, director_pelicula dp , actor_pelicula ap
                    WHERE p.id = dp.pelicula_id 
                    and ap.pelicula_id= p.id 
                    AND (${idDirector} is NULL OR dp.director_id = ${idDirector})
                    AND (${idGenero} is NULL OR p.genero_id = ${idGenero})
                    AND (${idActor} is NULL OR ap.actor_id= ${idActor})`;

  connectionDb.query(queryCheck, function (error, result) {
    console.log(result);
    if (error) {
      console.log("error", error);
      throw error;
    }
    if (result[0].cantidad != 0) {
      res.status(422).send("la competencia ya existe");
      return;
    }
    if (result[1].cantidad < 2) {
      res.status(422).send("no hay suficientes peliculas");
      return;
    }

    connectionDb.query(queryInsert, function (error, result2) {
      if (error) {
        console.log("error", error);
        throw error;
      }
      res.send("la competencia  ha sido agregada correctamente");
    });
  });
}

function reiniciarCompetencia(req, res) {
  let idCompetencia = req.params.id;
  let querySelect = `Select * from competencia where id =' ${idCompetencia}'`;
  let queryUpdate = `Update voto 
  set cantidad_votos = 0 
  where competencia_id ='${idCompetencia}'`;

  connectionDb.query(querySelect, function (error, result) {
    if (error) throw error;

    if (result.length == 0) {
      res.status(422).send("La competencia no existe Pauli!");
      return;
    }

    connectionDb.query(queryUpdate, function (error, result2) {
      if (error) throw error;

      res.send("Se ha reiniciado la competencia");
    });
  });
}

function obtenerGeneros(req, res) {
  let query = "select * from genero";

  connectionDb.query(query, function (error, results) {
    if (error) {
      console.log("error", error);
      throw error;
    }
    res.send(JSON.stringify(results));
  });
}

function obtenerDirectores(req, res) {
  let query = "select * from director";

  connectionDb.query(query, function (error, results) {
    if (error) {
      console.log("error", error);
      throw error;
    }
    res.send(JSON.stringify(results));
  });
}

function obtenerActores(req, res) {
  let query = "select id, nombre from actor";

  connectionDb.query(query, function (error, results) {
    if (error) {
      console.log("error", error);
      throw error;
    }
    res.send(JSON.stringify(results));
  });
}

function eliminarCompetencia(req, res) {
  let id = req.params.id;
  let querySelect = `Select * from competencia where id = ${id}`;
  let queryEliminar = `Delete from competencia where id = ${id}`;

  connectionDb.query(querySelect, function (error, result) {
    if (error) throw error;

    if (result.length == 0) {
      res.status(422).send("No se ha encontrado la competencia");
      return;
    }

    connectionDb.query(queryEliminar, function (error, result2) {
      if (error) throw error;

      res.send("Se ha eliminado la competencia");
    });
  });
}

function obtenerCompetencia(req, res) {
  let id = req.params.id;
  let queryChequear = `Select * from competencia where id = ${id}`;
  let querySelect = `SELECT C.id id, C.nombre nombre, G.NOMBRE genero, D.NOMBRE director, A.NOMBRE actor
  from competencia C
  LEFT JOIN genero G
  ON C.GENERO_ID = G.ID
  LEFT JOIN director D
  ON C.DIRECTOR_ID = D.ID
  LEFT JOIN actor A
  ON C.ACTOR_ID = A.ID
  where C.ID = ${id}`;

  connectionDb.query(queryChequear, function (error, result) {
    if (error) throw error;

    if (result.length == 0) {
      res.status(422).send("No se ha encontrado la competencia");
      return;
    }

    connectionDb.query(querySelect, function (error, result2) {
      if (error) throw error;

      var respuesta = {
        competencia: result2[0].id,
        nombre: result2[0].nombre,
        genero_nombre: result2[0].genero,
        director_nombre: result2[0].director,
        actor_nombre: result2[0].actor,
      };

      res.send(JSON.stringify(respuesta));
    });
  });
}

function editarCompetencia(req, res) {
  let id = req.params.id;
  let nombre = req.body.nombre;
  let queryUpdate = `UPDATE competencia 
  SET nombre = '${nombre}' where id = ${id}`;
  let querySelect = `Select * from competencia where id = ${id}`;

  connectionDb.query(querySelect, function (error, result) {
    if (error) throw error;

    if (result.length == 0) {
      res.status(400).send("No se ha encontrado la competencia");
      return;
    }

    connectionDb.query(queryUpdate, function (error, result) {
      if (error) throw error;

      res.send("Se ha editado la competencia");
    });
  });
}

module.exports = {
  listarCompetencias: listarCompetencias,
  obtenerOpciones: obtenerOpciones,
  guardarVoto: guardarVoto,
  obtenerResultados: obtenerResultados,
  crearCompetencia: crearCompetencia,
  reiniciarCompetencia: reiniciarCompetencia,
  obtenerGeneros: obtenerGeneros,
  obtenerDirectores: obtenerDirectores,
  obtenerActores: obtenerActores,
  eliminarCompetencia: eliminarCompetencia,
  obtenerCompetencia: obtenerCompetencia,
  editarCompetencia: editarCompetencia,
};
