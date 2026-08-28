import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const envStr = fs.readFileSync(".env.local", "utf8");
let url = "", key = "";
envStr.split("\n").forEach(line => {
  if (line.startsWith("VITE_SUPABASE_URL=")) url = line.split("=")[1].trim();
  if (line.startsWith("VITE_SUPABASE_ANON_KEY=")) key = line.split("=")[1].trim();
});
const supabase = createClient(url, key);

async function run() {
  const { data: internacoes, error: ei } = await supabase.from("internacoes").select("*").limit(1);
  if (ei) console.log("internacoes ERROR:", ei.message);
  else console.log("internacoes columns:", internacoes?.length ? Object.keys(internacoes[0]) : "(empty table)");

  const { data: leitos, error: el } = await supabase.from("leitos").select("*").limit(1);
  if (el) console.log("leitos ERROR:", el.message);
  else console.log("leitos columns:", leitos?.length ? Object.keys(leitos[0]) : "(empty table)");

  const { data: pacientes, error: ep } = await supabase.from("pacientes").select("*").limit(1);
  if (ep) console.log("pacientes ERROR:", ep.message);
  else console.log("pacientes columns:", pacientes?.length ? Object.keys(pacientes[0]) : "(empty table)");
}
run();
