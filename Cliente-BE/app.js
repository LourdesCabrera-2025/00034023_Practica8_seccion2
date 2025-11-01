import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "15MayPweb2025";
const pool = new Pool({
    user: process.env.PGUSER || 'neondb_owner',
    host: process.env.PGHOST || 'ep-curly-sound-ahcrxe5b-pooler.c-3.us-east-1.aws.neon.tech',
    database: process.env.PGDATABASE || 'neondb',
    password: process.env.PGPASSWORD || 'npg_WUmQdXwNZ2f6',
    ssl: { rejectUnauthorized: false },
});

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors());

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Token requerido" });
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ error: "Formato de token invalido" });
    const token = parts[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.user = decoded;
        next();
    });
}

app.get("/", (req, res) => {
    res.json({ info: "Node.js, Express y PostgreSQL API" });
});

app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "email y password son requeridos" });

        const q = "SELECT id, email, password FROM users WHERE email = $1";
        const { rows } = await pool.query(q, [email]);
        if (rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (err) {
        console.error("sginin error: ", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

//INSERT USERS 
app.post("/users", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
            [name, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    }catch(err) {
        console.error(err);
        res.status(500).json({error:"Error al crear usuario"});
    }
});

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id,name, email FROM users ORDER BY id ASC");
        res.json(result.rows);
    }catch(err) {
        console.error(err);
        res.status(500).json({error: "Error al obtener usuarios"});
    }
});

app.get("/users/:id", async (req,res) => {
    const {id} = req.params;
    try{
        const result = await pool.query("SELECT id, name, email  FROM users WHERE id= $1", [id]);
        if(result.rows.length === 0) return res.status(404).json({error: "Usuario no encontrado"});
        res.json(result.rows[0]);
    }catch(err) {
        console.error("Detalles del error:", err);
        res.status(500).json({error: "Error al obtener usuario"});
    }
});

app.put("/users/:id", async (req, res) => {
    const {id} = req.params;
    const {name, email} = req.body;
    try{
        const result = await pool.query (
            "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
            [name, email, id]
        );
        if(result.rows.length === 0) return res.status(404).json({error: "Usuario no encontrado"});
        res.json(result.rows[0]);
    }catch(err) {
        console.error(err);
        res.status(500).json({error: "Error al actualizar usuario"});
    }
});

app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *", [id]
        );
        if(result.rows.length=== 0) return res.status(404).json({error: "Usuario no encontrado"});
        res.json({message: "Usuario eliminado", user: result.rows[0]});
    }catch(err) {
        console.error(err);
        res.status(500).json({error: "Error al eliminar usuario"});
    }
});

app.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "Protected data accessed", user: req.user });
});

pool.connect()
    .then(() => console.log("Conexion exitosa a PostgreSQL"))
    .catch(err => console.error("Error al conectar a PostgreSQL", err.message));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})