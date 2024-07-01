import moment from "moment";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../utils/axiosinstance";

import noDataImg from "../../assets//no-data-6.svg";

import AddEditNotes from "./AddEditNotes";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/Cards/EmptyCard";

// Transformador de fechas a "es-mx"
moment.updateLocale("es", {
  months:
    "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
      "_"
    ),
  monthsShort:
    "Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.".split("_"),
  weekdays: "Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado".split("_"),
  weekdaysShort: "Dom._Lun._Mar._Mier._Jue._Vier._Sab.".split("_"),
  weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
});

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [error, setError] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [showToastMessage, setShowToastMessage] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    data: null,
    type: "add",
  });

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      data: noteDetails,
      type: "edit",
    });
  };

  const onClose = () => {
    setOpenAddEditModal({
      isShown: false,
      data: null,
      type: "add",
    });
  };

  const handleShowToast = (message, type) => {
    setShowToastMessage({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMessage({
      isShown: false,
      message: "",
    });
  };

  // Obtener información del usuario
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");

      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Obtener todas las notas
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      setError(
        "Ha ocurrido un error inesperado. Por favor, intente de nuevo en unos momentos."
      );
    }
  };

  // Eliminar nota
  const deleteNote = async (data) => {
    const noteId = data._id;

    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`);

      if (response.data && !response.data.error) {
        handleShowToast("Nota eliminada.", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(
          "Ha ocurrido un error inesperado. Por favor, intente de nuevo en unos momentos."
        );
      }
    }
  };

  // Buscar nota
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();

    // Este return se utiliza para limpiar o cancelar el efecto cuando el componente se desmonta o se actualiza
    return () => {};
  }, []);

  // Nota fijada
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;

    try {
      const response = await axiosInstance.put(
        `/update-note-pinned/${noteId}`,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        handleShowToast("Nota fijada.");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto p-5">
        {error && <p className="text-red-500 text-lg pb-1">{error}</p>}
        {allNotes.length > 0 && allNotes !== undefined ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={noDataImg}
            message={
              isSearch
                ? "No se encontraron notas."
                : "No hay notas añadidas todavía. Añade una nota usando el símbolo de " +
                  " en la parte inferior derecha."
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#e5e5e5] hover:bg-primary hover:text-white absolute right-10 bottom-10 transition-all ease-in-out"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px]" />
      </button>

      <Modal
        ariaHideApp={false}
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 rounded-md mx-auto mt-14 p-5 overflow-hidden bg-white"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={onClose}
          getAllNotes={getAllNotes}
          handleShowToast={handleShowToast}
        />
      </Modal>

      <Toast
        isShown={showToastMessage.isShown}
        message={showToastMessage.message}
        type={showToastMessage.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
