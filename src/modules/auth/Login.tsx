import React, { useState } from "react";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { COLORS } from "../../config/colors";

interface LoginProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("dr.almeida@hospital.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: COLORS.orangeSoft }}>
            <LogIn size={32} color={COLORS.orange} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.ink }}>
            PerceptAI
          </h1>
          <p style={{ color: COLORS.slateSoft }}>
            Sistema de Monitoramento Inteligente para Hospitais
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border p-8" style={{ borderColor: COLORS.line }}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm"
              style={{ borderColor: COLORS.line, background: COLORS.bg }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.ink }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: COLORS.line, background: COLORS.bg }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.slate} />
                ) : (
                  <Eye size={18} color={COLORS.slate} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ background: COLORS.orange }}
          >
            Entrar
          </button>

          <p className="text-center text-xs mt-4" style={{ color: COLORS.slateSoft }}>
            Demo: dr.almeida@hospital.com / demo123
          </p>
        </form>
      </div>
    </div>
  );
};
