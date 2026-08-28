import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
import { loginStyles, loginIconColor, getLoginInputStyle } from "./login.styles";
import { signIn } from "../../lib/auth";

interface LoginProps {
  onLogin: () => void;
}

const FEATURES = [
  {
    title: "Monitoramento contínuo",
    description: "Sinais vitais acompanhados em tempo real, sem intervalos.",
  },
  {
    title: "Alertas críticos instantâneos",
    description: "Notificação imediata diante de qualquer variação fora do padrão.",
  },
  {
    title: "Registro auditável",
    description: "Cada leitura documentada e rastreável para decisões clínicas.",
  },
];

export const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

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
        className="hidden md:flex w-[44%] flex-col justify-center px-12 py-12 relative overflow-hidden"
        style={loginStyles.brandPanel}
      >
        {/* moldura fina, inset, discreta */}
        <div className="absolute inset-6 border pointer-events-none" style={loginStyles.frame} />

        {/* traços de canto minimalistas */}
        <svg className="absolute top-6 right-6 pointer-events-none" width="28" height="28" viewBox="0 0 28 28">
          <path d="M2 14 L2 2 L14 2" fill="none" stroke={loginStyles.cornerMark.color} strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-6 left-6 pointer-events-none" width="28" height="28" viewBox="0 0 28 28">
          <path d="M26 14 L26 26 L14 26" fill="none" stroke={loginStyles.cornerMark.color} strokeWidth="1.5" />
        </svg>

        <div>
          <div className="flex items-center gap-5 mb-6">
            <img
              src={logo}
              alt="PerceptAI"
              style={{
                width: 64,
                height: 64,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <h1
              className="display text-[2.6rem] font-semibold leading-[1.05]"
              style={loginStyles.title}
            >
              PerceptAI
            </h1>
          </div>
          <p className="text-[16px] leading-relaxed max-w-sm" style={loginStyles.subtitle}>
            Sistema de Monitoramento Inteligente para Hospitais
          </p>

          <div className="my-9 h-px w-full max-w-sm" style={loginStyles.divider} />

          <ul className="space-y-6 max-w-sm">
            {FEATURES.map(({ title, description }) => (
              <li key={title}>
                <p className="text-[14px] font-semibold" style={loginStyles.featureTitle}>
                  {title}
                </p>
                <p className="text-[13px] leading-snug mt-0.5" style={loginStyles.featureDescription}>
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-[400px]">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={13} style={loginStyles.accessIcon} />
            <p className="kicker text-[12px] font-semibold uppercase" style={loginStyles.brandKicker}>
              Acesso Restrito
            </p>
          </div>
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
              name="email"
              autoComplete="username"
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
                name="password"
                autoComplete="current-password"
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
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            className="w-full py-3.5 text-white font-semibold text-[14px] disabled:opacity-50"
            style={{
              ...loginStyles.submitButton,
              ...(btnHover && !loading ? loginStyles.submitButtonHover : {}),
            }}
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