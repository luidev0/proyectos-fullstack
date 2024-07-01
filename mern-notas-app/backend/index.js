require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticationToken } = require("./utilities");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();
const config = require("./config.json");
const saltRounds = 10;

mongoose.connect(config.connectionString);

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (_req, res) => {
  res.json({ data: "Conectado a servidor." });
});

// Crear cuenta
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "El nombre completo, correo y contraseña son requeridos.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const isUser = await User.findOne({
      email: email,
    });

    if (isUser) {
      return res.json({
        error: true,
        message: "El correo ya ha sido registrado.",
      });
    }

    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
      {
        user,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "36000m",
      }
    );

    return res.json({
      error: false,
      user,
      accessToken,
      message: "Se ha registrado al usuario correctamente.",
    });
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Iniciar Sesión
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "El correo y la contraseña son requeridos.",
    });
  }

  try {
    const userInfo = await User.findOne({
      email: email,
    });

    if (!userInfo) {
      return res.status(400).json({
        message: "El correo no se encuentra en la base de datos.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, userInfo.password);

    if (userInfo.email == email && isValidPassword) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
      });

      return res.json({
        error: false,
        message: "Has iniciado sesión correctamente.",
        email,
        accessToken,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Credenciales inválidas.",
      });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Obtener usuario
app.get("/get-user", authenticationToken, async (req, res) => {
  try {
    const { user } = req.user;

    // const isUser = await User.findOne({
    //   _id: user._id,
    // }).populate("notes");

    const isUser = await User.findOne({
      _id: user._id,
    });

    if (!isUser) {
      return res
        .sendStatus(401)
        .json({ error: true, message: "Usuario no encontrado." });
    }

    return res.json({
      user: {
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id,
        notes:
          isUser.notes.length > 0 ? isUser.notes : "No hay notas creadas aún.",
        createdOn: isUser.createdOn,
      },
      message: "Usuario encontrado correctamente.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Error interno del servidor." });
  }
});

// Obtener todas los usuarios
app.get("/get-all-users", authenticationToken, async (req, res) => {
  try {
    // const users = await User.find().populate("notes").sort({ fullName: "asc" });

    const users = await User.find().sort({ fullName: "asc" });

    if (users.length > 0) {
      return res.json({
        error: false,
        users,
        message: "Todos los usarios fueron obtenidos con éxito.",
      });
    } else {
      return res.json({
        error: false,
        users: [],
        message: "No hay usuarios registrados aún.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Borrar un usuario
app.delete("/delete-user/:userId", authenticationToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    await Note.deleteMany({ userId: userId });

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "El usuario no se encuentra en la base de datos.",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.json({
      error: false,
      message: "Usuario eliminado con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Agregar nota
app.post("/add-note", authenticationToken, async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      error: true,
      message: "El título y el contenido son requeridos.",
    });
  }

  try {
    const { user } = req.user;
    const foundUser = await User.findById(user._id);

    if (!foundUser) {
      return res.status(400).json({
        error: true,
        message: "El usuario no ha sido encontrado en la base de datos.",
      });
    }

    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: foundUser,
    });

    await note.save();

    // Añadir la referencia de la nota al usuario
    foundUser.notes.push(note._id);

    // Guardar el usuario actualizado
    await foundUser.save();

    return res.status(200).json({
      error: false,
      note,
      message: "Nota añadida con éxito.",
    });
  } catch (error) {
    console.error("Error al agregar la nota:", error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Editar nota
app.patch("/edit-note/:noteId", authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res.status(400).json({
      error: true,
      message: "No han habido cambios.",
    });
  }

  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: user._id,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "La nota no ha sido encontrada en la base de datos.",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "La nota fue actualizada.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Obtener todas las notas
app.get("/get-all-notes", authenticationToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({
      userId: user._id,
    }).sort({
      isPinned: -1,
    });

    return res.json({
      error: false,
      notes,
      message:
        notes.length === 0
          ? "No hay notas creadas."
          : '"Todas las notas fueron obtenidas con éxito."',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Borrar una nota
app.delete("/delete-note/:noteId", authenticationToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "La nota no se encuentra en la base de datos.",
      });
    }

    // Luego busca todos los usuarios que tienen esta nota en su array notes
    const usersToUpdate = await User.find({ notes: noteId });

    await Note.deleteOne({
      _id: noteId,
      userId: user._id,
    });

    // Actualiza cada usuario para eliminar la referencia a la nota eliminada
    const updatePromises = usersToUpdate.map(async (user) => {
      user.notes = user.notes.filter((note) => note.toString() !== noteId);
      await user.save();
    });

    // Espera a que todas las actualizaciones se completen
    await Promise.all(updatePromises);

    return res.json({
      error: false,
      message: "Nota eliminada con éxito",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

// Actualizar si está fijado
app.put(
  "/update-note-pinned/:noteId",
  authenticationToken,
  async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
      const note = await Note.findOne({
        _id: noteId,
        userId: user._id,
      });

      if (!note) {
        return res.status(404).json({
          error: true,
          message: "La nota no ha sido encontrada en la base de datos.",
        });
      }

      note.isPinned = isPinned;

      await note.save();

      return res.json({
        error: false,
        note,
        message: "La nota fue actualizada.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Error interno del servidor.",
      });
    }
  }
);

// Buscar notas
app.get("/search-notes", authenticationToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Debes poner algo en el buscador para poder usarlo.",
    });
  }

  try {
    const notes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    if (!notes) {
      return res.status(400).json({
        error: true,
        message: "No se han encontrado coincidencias.",
      });
    }

    return res.status(200).json({
      error: false,
      notes,
      message: "Notas encontradas.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error interno del servidor.",
    });
  }
});

app.listen(8000);
