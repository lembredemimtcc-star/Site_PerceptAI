import type { CSSProperties } from "react";
import { COLORS } from "../../config/colors";

const MUTED = "#6B6B6B";
const WHITE = "#FFFFFF";

/* Tons suaves de laranja (pêssego) para combinar com o branco */
const TINT = "#FFF5ED";
const TINT_2 = "#FFEBDC";
const TINT_LINE = "#F9D9C2";

const s = <T extends Record<string, CSSProperties>>(o: T) => o;

export const landingStyles = s({
  page: { background: WHITE, color: COLORS.ink },

  /* NAVBAR */
  nav: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(8px)",
    borderBottom: `1px solid ${TINT_LINE}`,
  },
  navLogoText: { color: COLORS.ink },

  /* HERO */
  hero: {
    background: `linear-gradient(180deg, ${WHITE} 0%, ${TINT} 55%, ${TINT_2} 100%)`,
  },
  heroGlowTop: {
    position: "absolute",
    top: -160,
    right: -140,
    width: 560,
    height: 560,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,122,48,0.30) 0%, rgba(255,122,48,0) 68%)",
    pointerEvents: "none",
  },
  heroGlowBottom: {
    position: "absolute",
    bottom: -200,
    left: -160,
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,122,48,0.18) 0%, rgba(255,122,48,0) 70%)",
    pointerEvents: "none",
  },
  heroRing: {
    position: "absolute",
    top: "50%",
    right: "6%",
    width: 380,
    height: 380,
    transform: "translateY(-50%)",
    borderRadius: "50%",
    border: `1px solid ${TINT_LINE}`,
    pointerEvents: "none",
  },
  heroRingInner: {
    position: "absolute",
    top: "50%",
    right: "calc(6% + 70px)",
    width: 240,
    height: 240,
    transform: "translateY(-50%)",
    borderRadius: "50%",
    border: `1px solid ${COLORS.orange}`,
    opacity: 0.35,
    pointerEvents: "none",
  },
  frame: { borderColor: TINT_LINE },
  cornerStroke: { color: COLORS.orange },

  kicker: { color: COLORS.orange, letterSpacing: "0.16em" },
  kickerLine: {
    display: "inline-block",
    width: 28,
    height: 1.5,
    background: COLORS.orange,
    marginRight: 12,
    verticalAlign: "middle",
  },
  heroTitle: { color: COLORS.ink },
  heroAccent: { color: COLORS.orange },
  heroText: { color: MUTED },

  /* SEÇÕES */
  sectionWhite: { background: WHITE, borderTop: `1px solid ${TINT_LINE}` },
  sectionTint: {
    background: `linear-gradient(180deg, ${TINT} 0%, ${WHITE} 140%)`,
    borderTop: `1px solid ${TINT_LINE}`,
  },
  sectionTitle: { color: COLORS.ink },
  body: { color: MUTED },

  /* RECURSOS (estilo "serviços": itens soltos, hover vira card laranja) */
  resourcesWatermark: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: "7.5rem",
    fontWeight: 600,
    lineHeight: 1,
    color: "rgba(255,122,48,0.09)",
    pointerEvents: "none",
    userSelect: "none",
  },
  resourcesTitle: {
    position: "relative",
    textAlign: "center",
    color: COLORS.ink,
  },
  resourceSparkle: {
    position: "absolute",
    left: -14,
    bottom: -14,
    pointerEvents: "none",
  },

  /* STAT */
  statBox: {
    background: TINT,
    border: `1px solid ${TINT_LINE}`,
    borderLeft: `3px solid ${COLORS.orange}`,
    borderRadius: 2,
    padding: "24px 28px",
  },
  statNumber: { color: COLORS.orange },
  statLabel: { color: MUTED },

  /* CARDS */
  cardIndex: { color: COLORS.orange, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em" },
  cardTitle: { color: COLORS.ink },
  cardText: { color: MUTED },

  /* PASSOS */
  step: { borderTop: `1px solid ${TINT_LINE}`, paddingTop: 20, position: "relative" },
  stepMark: {
    position: "absolute",
    top: -1,
    left: 0,
    width: 40,
    height: 2,
    background: COLORS.orange,
  },
  stepNumber: { color: COLORS.orange, fontSize: 38, fontWeight: 600, lineHeight: 1 },

  /* TAGS */
  tag: {
    border: `1px solid ${TINT_LINE}`,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 2,
    background: WHITE,
  },
  tagAccent: {
    border: `1px solid ${COLORS.orange}`,
    color: COLORS.orange,
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: 2,
    background: TINT_2,
  },

  /* CTA */
  ctaBand: {
    background: COLORS.orange,
    backgroundImage:
      "radial-gradient(circle at 85% 0%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 55%)",
    color: WHITE,
  },

  /* FOOTER */
  footer: { background: WHITE, borderTop: `1px solid ${TINT_LINE}`, color: MUTED, fontSize: 12 },
});

/* ---------- estilos dependentes de hover ---------- */

export const getNavLinkStyle = (hovered: boolean): CSSProperties => ({
  position: "relative",
  color: hovered ? COLORS.orange : COLORS.ink,
//   background: hovered ? TINT : "transparent",
  fontSize: 13,
  fontWeight: hovered ? 600 : 500,
  padding: "8px 14px",
  border: "none",
  borderRadius: 2,
  cursor: "pointer",
  transition: "color .2s, background .2s",
});

export const getNavUnderlineStyle = (hovered: boolean): CSSProperties => ({
  position: "absolute",
  left: 14,
  right: 14,
  bottom: 2,
  height: 2,
  background: COLORS.orange,
  transform: hovered ? "scaleX(1)" : "scaleX(0)",
  transformOrigin: "left",
  transition: "transform .25s ease",
});

export const getNavButtonStyle = (hovered: boolean): CSSProperties => ({
  background: hovered ? WHITE : COLORS.orange,
  color: hovered ? COLORS.orange : WHITE,
  fontSize: 13,
  fontWeight: 600,
  padding: "9px 20px",
  border: `1px solid ${COLORS.orange}`,
  borderRadius: 2,
  cursor: "pointer",
  transition: "background .2s, color .2s",
});

export const getPrimaryButtonStyle = (hovered: boolean): CSSProperties => ({
  background: COLORS.orange,
  color: WHITE,
  fontSize: 14,
  fontWeight: 600,
  padding: "14px 28px",
  border: `1px solid ${COLORS.orange}`,
  borderRadius: 2,
  cursor: "pointer",
  opacity: hovered ? 0.88 : 1,
  transition: "opacity .2s",
});

export const getGhostButtonStyle = (hovered: boolean): CSSProperties => ({
  background: hovered ? TINT_2 : "transparent",
  color: hovered ? COLORS.orange : COLORS.ink,
  fontSize: 14,
  fontWeight: 600,
  padding: "14px 28px",
  border: `1px solid ${hovered ? COLORS.orange : TINT_LINE}`,
  borderRadius: 2,
  cursor: "pointer",
  transition: "background .2s, color .2s, border-color .2s",
});

/* Item de recurso: solto por padrão, vira card laranja no hover */
export const getResourceItemStyle = (hovered: boolean): CSSProperties => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "40px 28px",
  background: hovered ? COLORS.orange : "transparent",
  borderRadius: hovered ? "48px 14px 48px 8px" : "14px",
  boxShadow: hovered ? "0 18px 36px -12px rgba(255,122,48,0.55)" : "0 0 0 rgba(0,0,0,0)",
  transform: hovered ? "translateY(-6px)" : "translateY(0)",
  cursor: "default",
  transition:
    "background .25s ease, border-radius .3s ease, box-shadow .25s ease, transform .25s ease",
});

export const getResourceIconStyle = (hovered: boolean): CSSProperties => ({
  color: hovered ? WHITE : COLORS.orange,
  transition: "color .25s ease",
});

export const getResourceTitleStyle = (hovered: boolean): CSSProperties => ({
  color: hovered ? WHITE : COLORS.ink,
  transition: "color .25s ease",
});

export const getResourceTextStyle = (hovered: boolean): CSSProperties => ({
  color: hovered ? "rgba(255,255,255,0.92)" : MUTED,
  transition: "color .25s ease",
});

export const getResourceSparkleStyle = (hovered: boolean): CSSProperties => ({
  ...landingStyles.resourceSparkle,
  opacity: hovered ? 1 : 0,
  transform: hovered ? "scale(1)" : "scale(0.4)",
  transition: "opacity .25s ease, transform .3s ease",
});

export const getCardStyle = (hovered: boolean): CSSProperties => ({
  position: "relative",
  background: WHITE,
  border: `1px solid ${hovered ? COLORS.orange : TINT_LINE}`,
  borderTop: `2px solid ${COLORS.orange}`,
  borderRadius: 2,
  transform: hovered ? "translateY(-3px)" : "translateY(0)",
  transition: "border-color .2s, transform .2s",
});

export const getCtaButtonStyle = (hovered: boolean): CSSProperties => ({
  background: hovered ? "transparent" : WHITE,
  color: hovered ? WHITE : COLORS.orange,
  fontSize: 14,
  fontWeight: 600,
  padding: "14px 28px",
  border: `1px solid ${WHITE}`,
  borderRadius: 2,
  cursor: "pointer",
  transition: "background .2s, color .2s",
});