import { createFileRoute } from "@tanstack/react-router";
import PerceptAIPrototype from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PerceptAI — Monitoramento hospitalar inteligente" },
      {
        name: "description",
        content:
          "Painel PerceptAI: monitoramento de leitos, expressões e sinais vitais com preferências de acessibilidade.",
      },
      { property: "og:title", content: "PerceptAI — Monitoramento hospitalar inteligente" },
      {
        property: "og:description",
        content:
          "Painel PerceptAI: monitoramento de leitos, expressões e sinais vitais com preferências de acessibilidade.",
      },
    ],
  }),
  component: PerceptAIPrototype,
});
