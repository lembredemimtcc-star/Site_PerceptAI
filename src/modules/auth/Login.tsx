import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
import { loginStyles, loginIconColor } from "./login.styles";
import { signIn } from "../../lib/auth";

interface LoginProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      onLogin();
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={loginStyles.page}
    >
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <img
              src={logo}
              alt="PerceptAI"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={loginStyles.title}>
            PerceptAI
          </h1>
          <p style={loginStyles.subtitle}>
            Sistema de Monitoramento Inteligente para Hospitais
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border p-8"
          style={loginStyles.formBorder}
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={loginStyles.label}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              className="w-full px-4 py-3 rounded-xl border text-sm"
              style={loginStyles.input}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={loginStyles.label}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={loginStyles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={18} color={loginIconColor} />
                ) : (
                  <Eye size={18} color={loginIconColor} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50"
            style={loginStyles.submitButton}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-xs mt-4" style={loginStyles.demoText}>
            Demo: dr.almeida@hospital.com / demo123
          </p>
        </form>
      </div>
    </div>
  );
};