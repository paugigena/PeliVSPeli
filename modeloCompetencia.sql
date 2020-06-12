create table competencia (
					id int not null auto_increment primary key,
                    nombre varchar(150)
                    
);
use competencias;
insert into competencia (nombre)
values
	('¿Cual es la película más bizarra?'),
	('¿Cuál es mejor película?'),
	('¿Qué drama te hizo llorar más?'),
    ('¿Cuál peli de acción es mejor?');
select * from actor;
select * from director;


CREATE TABLE voto(
	id int not null auto_increment,
    pelicula_id int unsigned not null, 
	competencia_id int not null,
    cantidad_votos int not null,
    primary key (id),
    foreign key (pelicula_id) references competencias.pelicula(id),
	foreign key (competencia_id) references competencias.competencia(id)
);


alter table competencias.competencia
add column genero_id int unsigned,
add constraint fk_genero foreign key (genero_id) 
references competencias.genero(id);

ALTER TABLE competencia 
ADD COLUMN director_id int unsigned,
ADD CONSTRAINT fk_director
FOREIGN KEY (director_id) REFERENCES competencias.director (id);

alter table competencias.competencia 
add column actor_id int unsigned,
ADD CONSTRAINT fk_actor foreign key (actor_id) references competencias.actor(id);

alter table voto drop FOREIGN KEY voto_ibfk_2;

ALTER TABLE voto 
ADD CONSTRAINT voto_ibfk_2 
FOREIGN KEY (competencia_id) 
REFERENCES competencia (id)
ON DELETE CASCADE;

