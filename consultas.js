const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "skaterpark",
  port: 5432
});

async function nuevoSkater(email, nombre, password, experiencia, especialidad, name) {
    const result = await pool.query(
        `INSERT INTO skaters
         (email, nombre, password, anos_experiencia, especialidad, foto, estado) 
         values 
         ('${email}', '${nombre}', '${password}', '${experiencia}', '${especialidad}', '${name}', false) RETURNING *`
    );
    const skater = result.rows[0];
    return skater;
}

async function getSkaters(){
    const result = await pool.query(`SELECT * FROM skaters`)
    return result.rows;
}

async function setSkaterStatus(id, estado){
    const result = await pool.query(
        `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING*`
    );
    const usuario = result.rows[0];
    return usuario;
} 

async function getSkater(email, password){
    const result = await pool.query(
        `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`
    );
    return result.rows[0];
}

async function modificar(id, nombre, password1, experiencia, especialidad) {
    const result = await pool.query(
        `UPDATE skaters SET nombre='${nombre}', password='${password1}', especialidad='${especialidad}', anos_experiencia=${experiencia} WHERE id=${id} RETURNING *;`
        )
    return result.rows[0]
}

async function eliminar(id) {  
  
    id = Number.parseInt(id)  
    const result = await pool.query(
        `DELETE FROM skaters WHERE id=${id}`
        )
    return result
}

module.exports = {
    nuevoSkater,
    getSkaters,
    setSkaterStatus,
    getSkater,
    modificar,
    eliminar
}