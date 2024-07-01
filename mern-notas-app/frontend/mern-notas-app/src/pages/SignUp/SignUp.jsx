import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axiosInstance from "../../utils/axiosinstance";
import { validateEmail } from "../../utils/helper";

import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/Input/PasswordInput";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Por favor, ingresa tu nombre y apellido.");

      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo válido.");

      return;
    }

    if (!password) {
      setError("Por favor, ingresa tu contraseña.");

      return;
    }

    setError("");

    // API Registro
    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email.toLowerCase(),
        password: password,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError(
          "Ha ocurrido un error inesperado. Por favor, intente de nuevo en unos momentos."
        );
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex justify-center items-center mt-28">
        <div className="w-96 border rounded-3xl px-7 py-10 bg-[#e5e5e5]">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7 text-[#252525]">Registro de cuenta</h4>

            <input
              type="text"
              placeholder="Nombre completo"
              className="input-box text-[#252525]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box text-[#252525]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Crear cuenta
            </button>

            <p className="text-sm text-center mt-4 text-[#252525]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to={"/login"}
                className="font-medium text-primary underline"
              >
                Ingresa aquí.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
