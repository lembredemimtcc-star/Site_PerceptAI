import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
import { loginStyles, loginIconColor, getLoginInputStyle } from "./login.styles";
import { signIn } from "../../lib/auth";

interface LoginProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

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
    <div className="w-full h-screen flex" style={loginStyles.page}>
      <aside
        className="hidden md:flex w-[44%] flex-col justify-between px-12 py-12"
        style={loginStyles.brandPanel}
      >
        <div>
          <p className="kicker mb-8" style={loginStyles.brandKicker}>
            Sistema clínico
          </p>
          <img
            src={logo}
            alt="PerceptAI"
            className="w-20 h-20 object-contain mb-8"
          />
          <h1 className="display text-[3.1rem] font-semibold leading-[1.05] mb-5" style={loginStyles.title}>
            PerceptAI
          </h1>
          <p className="text-[16px] leading-relaxed max-w-sm" style={loginStyles.subtitle}>
            Sistema de Monitoramento Inteligente para Hospitais
          </p>
        </div>
        <p className="kicker" style={loginStyles.brandKicker}>
          Ala · UTI
        </p>
      </aside>

      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-[400px]">
          <p className="kicker mb-3" style={loginStyles.brandKicker}>
            Acesso
          </p>
          <h2 className="display text-[2rem] font-semibold mb-2 md:hidden" style={loginStyles.formTitle}>
            PerceptAI
          </h2>
          <p className="text-[15px] mb-10" style={loginStyles.formSubtitle}>
            Sistema de Monitoramento Inteligente para Hospitais
          </p>

          <div className="mb-8">
            <label className="block text-[12px] font-semibold mb-2" style={loginStyles.label}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              className="w-full px-0 py-2.5 text-[15px] outline-none"
              style={getLoginInputStyle(emailFocus)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </div>

          <div className="mb-10">
            <label className="block text-[12px] font-semibold mb-2" style={loginStyles.label}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-0 py-2.5 pr-10 text-[15px] outline-none"
                style={getLoginInputStyle(passwordFocus)}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff size={16} color={loginIconColor} />
                ) : (
                  <Eye size={16} color={loginIconColor} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-semibold text-[14px] disabled:opacity-50"
            style={loginStyles.submitButton}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-[12px] mt-5" style={loginStyles.demoText}>
            Demo: dra.ferraz@hospital.com/ hash_senha_456
          </p>
        </form>
      </div>
    </div>
  );
};
