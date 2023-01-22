import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import Joi from "joi";
import db from "../config/database.js";

export async function signUp(req, res) {
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
    return res.status(400).send("Senhas diferentes");

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
}

export async function login(req, res) {
  const { email, password } = req.body;

  const usuario = await db.collection("users").findOne({ email });

  if (!usuario) return res.status(404).send("Email ou Senha invalidos");

  try {
    const validate =
      usuario.email === email && bcrypt.compareSync(password, usuario.password);

    if (!validate) return res.status(401).send("Senha ou email invalido");

    const token = uuid();

    const regularUser = await db
      .collection("sessions")
      .findOne({ userId: usuario._id });

    if (!regularUser) {
      await db.collection("sessions").insertOne({ userId: usuario._id, token });
      return res.send({ token, name: usuario.user });
    }

    await db
      .collection("sessions")
      .updateOne({ userId: usuario._id }, { $set: { token } });

    return res.send({ token, name: usuario.user });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
