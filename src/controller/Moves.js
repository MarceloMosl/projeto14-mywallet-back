import dayjs from "dayjs";
import db from "../config/database.js";
import { schemaMovement } from "../model/extractSchema.js";

export async function getExtract(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).send("Envie o Token");

  const usuario = await db.collection("sessions").findOne({ token });

  if (!usuario) return res.status(404).send("Usuario Deslogado");

  const movements = await db
    .collection("extract")
    .find({ user: usuario.userId })
    .toArray();

  if (movements.length === 0)
    return res.status(200).send({ movements, balance: 0 });

  const saidas = await db
    .collection("extract")
    .find({ user: usuario.userId, type: "saida" })
    .toArray();

  const entradas = await db
    .collection("extract")
    .find({ user: usuario.userId, type: "entrada" })
    .toArray();

  const totalSaidas = saidas
    .map((a) => a.value)
    .reduce((partialSum, a) => partialSum + a, 0)
    .toFixed(2);

  const totalEntradas = entradas
    .map((a) => a.value)
    .reduce((partialSum, a) => partialSum + a, 0)
    .toFixed(2);

  res.status(200).send({ movements, balance: totalEntradas - totalSaidas });
}
export async function postExtract(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");
  const movement = req.body;

  if (!token) return res.status(400).send("Envie o Token!");

  const validate = schemaMovement.validate(movement, { abortEarly: false });

  if (validate.error) {
    return res.status(422).send(validate.error.details[0].message);
  }

  const schemaToken = await db.collection("sessions").findOne({ token });

  if (!schemaToken) return res.status(422).send("usuario deslogado");

  try {
    await db.collection("extract").insertOne({
      user: schemaToken.userId,
      ...movement,
      date: dayjs().format("DD/MM"),
    });
    return res.send("movimento cadastrado");
  } catch (error) {
    return res.send(error);
  }
}
