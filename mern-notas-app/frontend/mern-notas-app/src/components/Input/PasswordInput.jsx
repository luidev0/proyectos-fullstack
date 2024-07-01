import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const togglePassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="flex items-center bg-transparent border-[1px] border-black px-5 py-3 rounded mb-4">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={"Contraseña"}
        className="w-full text-sm bg-transparent rounded outline-none"        
      />

      {isShowPassword ? (
        <FaRegEye
          size={22}
          className="text-primary cursor-pointer"
          onClick={() => togglePassword()}
        />
      ) : (
        <FaRegEyeSlash
          size={22}
          className="text-primary cursor-pointer"
          onClick={() => togglePassword()}
        />
      )}
    </div>
  );
};

export default PasswordInput;
