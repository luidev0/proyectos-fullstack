import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";

import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ onLogout, userInfo }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 hidden sm:flex items-center justify-center rounded-full text-[#e5e5e5] font-medium bg-[#1c1c1c] border-white border-2">
        {getInitials(userInfo?.fullName)}
      </div>

      <div className="flex flex-col items-start justify-between">
        <p className="hidden sm:text-sm font-medium text-[#e5e5e5]">
          {userInfo?.fullName}
        </p>
        <button onClick={onLogout} className="text-[#e5e5e5] text-sm underline">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
