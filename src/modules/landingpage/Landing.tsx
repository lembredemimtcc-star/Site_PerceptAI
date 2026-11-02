import React, { useState } from "react";
import logo from "../../assets/logo.png";
import {
  landingStyles as st,
  getNavLinkStyle,
  getNavUnderlineStyle,
  getNavButtonStyle,
  getPrimaryButtonStyle,
  getGhostButtonStyle,
  getResourceItemStyle,
  getResourceIconStyle,
  getResourceTitleStyle,
  getResourceTextStyle,
  getResourceSparkleStyle,
  getCtaButtonStyle,
} from "./landing.styles";

interface LandingProps {
  onGoToLogin: () => void;
}

const NAV_LINKS = [
  { id: "sobre", label: "Sobre" },
  { id: "recursos", label: "Recursos" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "tecnologia", label: "Tecnologia" },
];

type IconKey = "paciente" | "plantao" | "medicamento" | "visao" | "ia" | "historico";

const RESOURCES: { icon: IconKey; title: string; text: string }[] = [
  { icon: "paciente", title: "Cadastro de pacientes", text: "Registro organizado e centralizado das informações de cada paciente." },
  { icon: "plantao", title: "Profissionais e plantões", text: "Acompanhamento da equipe de saúde e controle dos plantões." },
  { icon: "medicamento", title: "Controle de medicamentos", text: "Acesso e gestão dos medicamentos de forma simples e rastreável." },
  { icon: "visao", title: "Visão computacional", text: "Captura de imagens faciais para análise contínua do paciente." },
  { icon: "ia", title: "Classificação por IA", text: "Rede Neural Convolucional que identifica expressões e estados." },
  { icon: "historico", title: "Histórico de detecções", text: "Todas as leituras registradas para consulta pela equipe." },
];

const STEPS = [
  { title: "Captura", text: "A câmera registra a face do paciente no leito." },
  { title: "Análise", text: "O modelo de CNN classifica a expressão e o estado de vigília." },
  { title: "Registro", text: "O resultado é salvo no sistema, com data e hora." },
  { title: "Acompanhamento", text: "A equipe consulta o histórico e decide com mais segurança." },
];

const EXPRESSIONS = ["Dor", "Enjoo", "Medo", "Sono", "Tristeza", "Neutralidade"];

/* Ícones de linha (herdam a cor via currentColor) */
const ResourceIcon: React.FC<{ name: IconKey }> = ({ name }) => {
  const common = {
    width: 46,
    height: 46,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "paciente":
      return (
        <svg {...common}>
          <circle cx="24" cy="16" r="7" />
          <path d="M10 40c0-8 6-14 14-14s14 6 14 14" />
        </svg>
      );
    case "plantao":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="16" />
          <path d="M24 14v10l7 4" />
        </svg>
      );
    case "medicamento":
      return (
        <svg {...common}>
          <g transform="rotate(-45 24 24)">
            <rect x="6" y="17" width="36" height="14" rx="7" />
            <path d="M24 17v14" />
          </g>
        </svg>
      );
    case "visao":
      return (
        <svg {...common}>
          <path d="M3 24c5-9 12-14 21-14s16 5 21 14c-5 9-12 14-21 14S8 33 3 24z" />
          <circle cx="24" cy="24" r="6" />
        </svg>
      );
    case "ia":
      return (
        <svg {...common}>
          <rect x="13" y="13" width="22" height="22" rx="3" />
          <rect x="19" y="19" width="10" height="10" rx="1.5" />
          <path d="M19 7v6M29 7v6M19 35v6M29 35v6M7 19h6M7 29h6M35 19h6M35 29h6" />
        </svg>
      );
    case "historico":
      return (
        <svg {...common}>
          <path d="M14 6h14l8 8v28H14z" />
          <path d="M28 6v8h8" />
          <path d="M19 24h12M19 31h12" />
        </svg>
      );
  }
};

/* Faíscas decorativas que aparecem no hover */
const Sparkle: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill={"#E85A12"}>
    <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
    <path d="M26 20 L27.2 24.8 L32 26 L27.2 27.2 L26 32 L24.8 27.2 L20 26 L24.8 24.8 Z" />
  </svg>
);

export const LandingScreen: React.FC<LandingProps> = ({ onGoToLogin }) => {
  const [hover, setHover] = useState<string | null>(null);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const h = (key: string) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover(null),
  });

  return (
    <div className="w-full h-screen overflow-y-auto" style={st.page}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50" style={st.nav}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => scrollTo("topo")}
            className="flex items-center gap-3"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img src={logo} alt="PerceptAI" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span className="display text-[1.15rem] font-semibold" style={st.navLogoText}>
              PerceptAI
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={getNavLinkStyle(hover === `nav-${l.id}`)}
                {...h(`nav-${l.id}`)}
              >
                {l.label}
                <span style={getNavUnderlineStyle(hover === `nav-${l.id}`)} />
              </button>
            ))}
          </nav>

          <button
            onClick={onGoToLogin}
            style={getNavButtonStyle(hover === "nav-login")}
            {...h("nav-login")}
          >
            Entrar
          </button>
        </div>
      </header>

      {/* HERO */}
      <section id="topo" className="relative overflow-hidden" style={st.hero}>
        <div style={st.heroGlowTop} />
        <div style={st.heroGlowBottom} />
        <div className="hidden md:block" style={st.heroRing} />
        <div className="hidden md:block" style={st.heroRingInner} />

        <div className="absolute inset-6 border pointer-events-none" style={st.frame} />
        <svg className="absolute top-6 right-6 pointer-events-none" width="28" height="28" viewBox="0 0 28 28">
          <path d="M2 14 L2 2 L14 2" fill="none" stroke={st.cornerStroke.color} strokeWidth="1.5" />
        </svg>
        <svg className="absolute bottom-6 left-6 pointer-events-none" width="28" height="28" viewBox="0 0 28 28">
          <path d="M26 14 L26 26 L14 26" fill="none" stroke={st.cornerStroke.color} strokeWidth="1.5" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-40">
          <p className="kicker text-[12px] font-semibold uppercase mb-6" style={st.kicker}>
            <span style={st.kickerLine} />
            Monitoramento inteligente hospitalar
          </p>
          <h1
            className="display text-[2.6rem] md:text-[4rem] font-semibold leading-[1.05] max-w-3xl"
            style={st.heroTitle}
          >
            Perceber o paciente <span style={st.heroAccent}>antes</span> que ele precise pedir.
          </h1>
          <p className="text-[16px] leading-relaxed max-w-xl mt-6" style={st.heroText}>
            O PerceptAI une gestão hospitalar e Inteligência Artificial para identificar sinais de
            dor, enjoo, medo e outros estados, apoiando uma assistência mais segura, humanizada e
            eficiente.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <button
              onClick={onGoToLogin}
              style={getPrimaryButtonStyle(hover === "hero-primary")}
              {...h("hero-primary")}
            >
              Acessar o sistema
            </button>
            <button
              onClick={() => scrollTo("sobre")}
              style={getGhostButtonStyle(hover === "hero-ghost")}
              {...h("hero-ghost")}
            >
              Saber mais
            </button>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" style={st.sectionWhite}>
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14">
          <div>
            <p className="kicker text-[12px] font-semibold uppercase mb-4" style={st.kicker}>
              <span style={st.kickerLine} />
              Sobre o projeto
            </p>
            <h2 className="display text-[2rem] font-semibold leading-tight" style={st.sectionTitle}>
              Conhecer as necessidades do paciente é o primeiro passo do cuidado.
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed" style={st.body}>
              Identificar as necessidades dos pacientes contribui para o seu bem-estar e ajuda a
              equipe de saúde a oferecer uma assistência mais eficiente. O PerceptAI foi criado para
              auxiliar na administração hospitalar, com cadastro de pacientes, acompanhamento de
              profissionais e plantões e controle de medicamentos, e traz como diferencial o
              monitoramento por Inteligência Artificial.
            </p>
            <div className="flex items-center gap-5 mt-10" style={st.statBox}>
              <span className="display text-[2.6rem] font-semibold" style={st.statNumber}>
                540.906
              </span>
              <span className="text-[13px] leading-snug max-w-[220px]" style={st.statLabel}>
                leitos hospitalares no Brasil em 2026 (Brasil, 2026)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — agora entre Sobre e Recursos */}
      <section style={st.ctaBand}>
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 className="display text-[1.8rem] font-semibold max-w-xl leading-tight">
            Uma assistência mais segura, humanizada e eficiente.
          </h2>
          <button
            onClick={onGoToLogin}
            style={getCtaButtonStyle(hover === "cta")}
            {...h("cta")}
          >
            Entrar no sistema
          </button>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="relative overflow-hidden" style={st.sectionTint}>
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <h2
            className="display text-[2rem] md:text-[2.4rem] font-semibold mb-16 pt-10"
            style={st.resourcesTitle}
          >
            Tudo o que a rotina hospitalar precisa, em um só lugar.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {RESOURCES.map((r, i) => {
              const hovered = hover === `res-${i}`;
              return (
                <div key={r.title} style={getResourceItemStyle(hovered)} {...h(`res-${i}`)}>
                  <div style={getResourceIconStyle(hovered)}>
                    <ResourceIcon name={r.icon} />
                  </div>
                  <p className="display text-[1.1rem] font-semibold mt-5" style={getResourceTitleStyle(hovered)}>
                    {r.title}
                  </p>
                  <p
                    className="text-[13px] leading-relaxed mt-3 max-w-[240px]"
                    style={getResourceTextStyle(hovered)}
                  >
                    {r.text}
                  </p>
                  <span style={getResourceSparkleStyle(hovered)}>
                    <Sparkle />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={st.sectionWhite}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="kicker text-[12px] font-semibold uppercase mb-4" style={st.kicker}>
            <span style={st.kickerLine} />
            Como funciona
          </p>
          <h2 className="display text-[2rem] font-semibold mb-12" style={st.sectionTitle}>
            Da imagem ao registro, em quatro etapas.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} style={st.step}>
                <span style={st.stepMark} />
                <p className="display" style={st.stepNumber}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[15px] font-semibold mt-4" style={st.cardTitle}>
                  {step.title}
                </p>
                <p className="text-[13px] leading-snug mt-2" style={st.cardText}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECNOLOGIA */}
      <section id="tecnologia" style={st.sectionTint}>
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14">
          <div>
            <p className="kicker text-[12px] font-semibold uppercase mb-4" style={st.kicker}>
              <span style={st.kickerLine} />
              Tecnologia
            </p>
            <h2 className="display text-[2rem] font-semibold leading-tight" style={st.sectionTitle}>
              Redes Neurais Convolucionais a serviço do cuidado.
            </h2>
            <p className="text-[15px] leading-relaxed mt-5" style={st.body}>
              Com visão computacional e um modelo de CNN, o sistema classifica expressões faciais e
              indica se o paciente está acordado ou desacordado. Tudo é registrado para que a equipe
              acompanhe o histórico de detecções.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-3">
            {EXPRESSIONS.map((e) => (
              <span key={e} style={st.tag}>
                {e}
              </span>
            ))}
            <span style={st.tagAccent}>Acordado</span>
            <span style={st.tagAccent}>Desacordado</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={st.footer}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 PerceptAI. Sistema de Monitoramento Inteligente para Hospitais.</span>
          <span>Projeto de TCC</span>
        </div>
      </footer>
    </div>
  );
};