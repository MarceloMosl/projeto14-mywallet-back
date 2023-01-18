import express, { json } from "express";
import cors from "cors";
import Joi from "joi";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import dayjs from "dayjs";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(json());

let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);

const dbWasConnected = await mongoClient.connect();

if (dbWasConnected) db = mongoClient.db();

app.post("/cadastro", async (req, res) => {
  const user = req.body;
  const schemaUser = Joi.object({
    user: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confPassword: Joi.string().required(),
  });

  const validate = schemaUser.validate(user, { abortEarly: false });
  if (validate.error) {
    return res.status(422).send(validate.error.details);
  }

  if (user.password !== user.confPassword)
    res.status(400).send("Senhas diferentes");

  const validateEmail = await db.collection("users").find().toArray();

  const emailExist = validateEmail.find(
    (element) => element.email === user.email
  );

  if (emailExist) return res.status(409).send("Email em uso");

  const passwordEncript = bcrypt.hashSync(user.password, 10);

  try {
    await db.collection("users").insertOne({
      user: user.user,
      email: user.email,
      password: passwordEncript,
    });
    res.status(200).send("usuario Cadastrado");
  } catch (error) {
    res.send(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let userValidate = [];

  const usuarios = await db.collection("users").findOne({ email });
  console.log(usuarios);

  try {
    if (
      usuarios.email === email &&
      bcrypt.compareSync(password, usuarios.password)
    ) {
      userValidate = [usuarios];
    }

    if (userValidate.length === 0)
      return res.status(401).send("Senha ou email invalido");

    return res.send(userValidate[0]);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.get("/extract", async (req, res) => {
  const { user } = req.headers;
  if (!user) return res.sendStatus(400);

  const movements = await db.collection("extract").find().toArray();

  let extractList = [];

  movements.forEach((element) => {
    if (element.user == user) {
      extractList = [...extractList, element];
    }
  });

  res.status(200).send(extractList);
});

app.post("/extract", async (req, res) => {
  const { token } = req.headers;
  const movement = req.body;

  if (!token) return res.sendStatus(400);

  const schemaMovement = Joi.object({
    type: Joi.string().required(),
    value: Joi.number().required(),
    desc: Joi.string().required(),
  });

  const validate = schemaMovement.validate(movement, { abortEarly: false });

  if (validate.error) {
    return res.status(422).send(validate.error.details[0].message);
  }

  try {
    await db.collection("extract").insertOne({
      user: token,
      ...movement,
      date: dayjs().format("DD/MM/YYYY"),
    });
    return res.send("movimento cadastrado");
  } catch (error) {
    return res.send(error);
  }
});

app.listen(PORT, () => console.log("Servidor funfou"));
