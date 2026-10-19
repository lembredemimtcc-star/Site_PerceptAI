/**
 * Mock de emoções definidas por paciente
 * 
 * Aqui você define qual emoção cada paciente terá.
 * Isso facilita testar e pegar imagens específicas para cada emoção.
 * 
 * Para adicionar ou alterar emoções:
 * - Adicione o ID da internação como chave
 * - Defina a emoção e se está dormindo
 * 
 * Emoções disponíveis: "neutro", "dor", "tristeza", "medo", "enjoo"
 */

export const PATIENT_MOCK_EMOTIONS: Record<string, { emotion: string; isSleeping: boolean }> = {
  // ID da internação → emoção definida
  "402": { emotion: "dor", isSleeping: false },      // dor
  "403": { emotion: "neutro", isSleeping: false },   // neutro
  "404": { emotion: "medo", isSleeping: false },     // medo
  "405": { emotion: "tristeza", isSleeping: false }, // tristeza
  "406": { emotion: "enjoo", isSleeping: false },    // enjoo
  "407": { emotion: "neutro", isSleeping: true },    // dormindo
  "408": { emotion: "sono", isSleeping: false },     // sono
  "409": { emotion: "medo", isSleeping: true },      // medo e sono (dormindo)
  "teste": { emotion: "dor", isSleeping: false },    // teste padrão para modal sem paciente selecionado
};

// Emoção padrão para pacientes não mapeados
export const DEFAULT_MOCK_EMOTION = "neutro";
