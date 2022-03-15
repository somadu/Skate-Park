// Importaciones
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const expressFileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "Silencio";

const { 
    nuevoSkater,
    getSkaters,
    setSkaterStatus,
    getSkater,
    modificar,
    eliminar
} = require("./consultas")

// Server
app.listen(3000, () => console.log("Server ON"))

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public" ));
app.use(
    expressFileupload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el limite permitidio de 5 megas"
    })
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/uploads", express.static(__dirname + "/public/uploads"))
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

// Rutas

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/Registro", function (req, res) {
    res.render("Registro");
});

app.get("/Login", function (req, res) {
    res.render("Login");
})

app.post("/usuario", async (req, res) => {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send("No se encuentra ningun archivo")
    }
    let { fotoPerfil } = req.files
    let { name } = fotoPerfil
    fotoPerfil.mv(`${__dirname}/public/uploads/${name}`, (err) => {
        if (err) return res.status(500).send({
            error: `algo salio mal... ${err}`,
            code: 500
        })
    });
    let { email, nombre, password2, experiencia, especialidad } = req.body
    try {
        const registro = await nuevoSkater(email, nombre, password2, experiencia, especialidad, name)
        res.status(201).render("login")
    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal... ${error}`,
            code: 500
        })
    }
})

app.put("/skaters", async (req, res) => {
    const { id, estado } = req.body;
    try {
        const skater = await setSkaterStatus(id, estado);
        res.status(200).send(skater);
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
})

app.get("/ingresos", async (req, res) => {
    const registros = await getSkaters()
    res.send(registros)
})

app.get("/Admin", async (req, res) => {
    try {
        const skaters = await getSkaters();
        res.render("Admin", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.post("/verify", async function (req, res) {
    const { email, password } = req.body;
    const user = await getSkater(email, password);
    if (user) {
        if (user.estado) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 180,
                    data: user,
                },
                secretKey
            );
            res.send(token);
        } else {
            res.status(401).send({
                error: "Este skater aún no ah sido revisado",
                code: 401
            });
        }
    } else {
        res.status(404).send({
            error: "Este usuario no está registrado en la base de datos",
            code: 404,
        });
    }
});

app.get("/Datos", function (req, res) {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        const { data } = decoded
        const { id, nombre, email, password, anos_experiencia, especialidad } = data
        err
            ? res.status(401).send(
                res.send({
                    error: "401 Unauthorized",
                    message: "Necesita logear primero para ver sus datos.",
                    token_error: err.message,
                })
            )
            : res.render("Datos", { id, nombre, email, password, anos_experiencia, especialidad });
    })
});

app.put("/modificar", async (req, res) => {
    const { id, nombre, password1, experiencia, especialidad } = req.body
    try {
        const resultado = await modificar(id, nombre, password1, experiencia, especialidad)
        res.status(200).render("index")
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    }
})

app.delete("/delete", async (req, res) => {   
    let {id} = req.body.source
  try { 
        const registro = await eliminar(id)
        res.status(200).render("index")   
    }  catch (e) {
        res.status(500).send({
            error: `Algo salio mal ${e}`,
            code: 500
        })
    } 
}) 

app.get("*", (req, res) => {
    res.send("Ruta invalida")
})