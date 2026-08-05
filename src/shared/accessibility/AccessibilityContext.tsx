import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type FontSize = 0 | 1 | 2;

export interface AccessibilityPrefs {
  contraste: boolean;
  leitor: boolean;
  reducaoMov: boolean;
  vibracao: boolean;
  fonte: FontSize;
  idioma: string;
}

export const DEFAULT_PREFS: AccessibilityPrefs = {
  contraste: false,
  leitor: false,
  reducaoMov: false,
  vibracao: true,
  fonte: 1,
  idioma: "pt-BR",
};

const STORAGE_KEY = "perceptai:acessibilidade";

const FONT_SCALE: Record<FontSize, string> = {
  0: "0.92",
  1: "1",
  2: "1.12",
};

interface AccessibilityContextValue {
  prefs: AccessibilityPrefs;
  /** Preferências ainda não salvas (estado do formulário) */
  draft: AccessibilityPrefs;
  setDraft: (patch: Partial<AccessibilityPrefs>) => void;
  dirty: boolean;
  save: () => void;
  reset: () => void;
  /** Fala/anuncia um texto quando o leitor de tela está ativo (force ignora a preferência) */
  announce: (message: string, opts?: { force?: boolean }) => void;
  /** Vibra o dispositivo quando alertas por vibração estão ativos (force ignora a preferência) */
  vibrate: (pattern?: number | number[], opts?: { force?: boolean }) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readStored(): AccessibilityPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AccessibilityPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULT_PREFS);
  const [draft, setDraftState] = useState<AccessibilityPrefs>(DEFAULT_PREFS);
  const [announcement, setAnnouncement] = useState("");
  const prefsRef = useRef<AccessibilityPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  // Carrega do navegador após a hidratação (evita mismatch de SSR)
  useEffect(() => {
    const stored = readStored();
    setPrefs(stored);
    setDraftState(stored);
  }, []);

  // Aplica as preferências à interface inteira
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("a11y-contrast", prefs.contraste);
    root.classList.toggle("a11y-reduce-motion", prefs.reducaoMov);
    root.style.setProperty("--a11y-font-scale", FONT_SCALE[prefs.fonte]);
    root.setAttribute("lang", prefs.idioma);
  }, [prefs]);

  const setDraft = useCallback((patch: Partial<AccessibilityPrefs>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const announce = useCallback((message: string, opts?: { force?: boolean }) => {
    const current = prefsRef.current;
    if ((!current.leitor && !opts?.force) || !message) return;
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 30);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = current.idioma;
      utterance.rate = 1;
      synth.speak(utterance);
    }
  }, []);

  const vibrate = useCallback(
    (pattern: number | number[] = [120, 60, 120], opts?: { force?: boolean }) => {
      if (!prefsRef.current.vibracao && !opts?.force) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    },
    [],
  );

  const save = useCallback(() => {
    setPrefs(draft);
    prefsRef.current = draft;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* armazenamento indisponível */
    }
  }, [draft]);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
    setDraftState(DEFAULT_PREFS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* armazenamento indisponível */
    }
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(prefs) !== JSON.stringify(draft),
    [prefs, draft],
  );

  const value = useMemo(
    () => ({ prefs, draft, setDraft, dirty, save, reset, announce, vibrate }),
    [prefs, draft, setDraft, dirty, save, reset, announce, vibrate],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div aria-live="assertive" aria-atomic="true" className="sr-only-a11y">
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility precisa estar dentro de AccessibilityProvider");
  }
  return ctx;
}