import moment from "moment";
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="border rounded p-4 bg-[#1c1c1c] hover:shadow-xl transition-all ease-in-out hover:bg-[#303030]">
      <div className="flex items-center justify-between">
        <div className="">
          <h6 className="text-sm font-medium text-[#e5e5e5]">{title}</h6>
          <span className="text-xs text-slate-400">
            {moment(date).format("LLLL")}
          </span>
        </div>

        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? "text-primary" : "text-[#e5e5e5]"}`}
          onClick={onPinNote}
        />
      </div>

      <p className="text-[#e5e5e5] text-md mt-5">{content?.slice(0, 60)}</p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
          {tags && Array.isArray(tags) && tags.length > 0 ? (
            tags.map((item, index) => <span key={index}>#{item} </span>)
          ) : (
            <p className="text-xs">Aún no has añadido ninguna etiqueta.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <MdCreate
            className="icon-btn hover:text-green-500 text-[#e5e5e5]"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-500 text-[#e5e5e5]"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
