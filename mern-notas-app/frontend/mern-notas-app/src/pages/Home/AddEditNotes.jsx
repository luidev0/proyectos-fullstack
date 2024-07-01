import { useState } from "react";
import { MdClose } from "react-icons/md";

import axiosInstance from "../../utils/axiosinstance";

import TagInput from "../../components/Input/TagInput";

const AddEditNotes = ({
  noteData,
  type,
  getAllNotes,
  onClose,
  handleShowToast,
}) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  // Añadir Nota
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        handleShowToast("Nota añadida.");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  // Editar Nota
  const editNote = async () => {
    const noteId = noteData._id;

    try {
      const response = await axiosInstance.patch(`/edit-note/${noteId}`, {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        handleShowToast("Nota actualizada.");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Por favor, ingresar un título.");

      return;
    }

    if (!content) {
      setError("No hay una descripción para la nota.");

      return;
    }

    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 relative">
        <MdClose
          className="absolute top-0 right-0 text-xl hover:text-red-500"
          onClick={onClose}
        />
        <label className="input-label">Título</label>
        <input
          type="text"
          className="text-lg text-[#252525] outline-none bg-transparent border-2 border-[#252525] p-2"
          placeholder="Ir al gym a las 7"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">Contenido</label>
        <textarea
          type="text"
          className="text-sm text-[#252525] outline-none bg-transparent p-2 rounded border-2 border-[#252525]"
          placeholder="Contenido"
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)}
        />
      </div>

      <div className="mt-3">
        <label className="input-label">Etiquetas</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className="text-red-500 text-xs pt-4">{error}</p>}

      <button
        className="btn-secondary font-medium mt-5 p-3"
        onClick={handleAddNote}
      >
        {type === "add" ? "Añadir" : "Actualizar"}
      </button>
    </div>
  );
};

export default AddEditNotes;
