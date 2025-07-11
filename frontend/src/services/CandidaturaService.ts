
import { Candidatura } from "../models/Candidatura";
import apiClient from "./interceptors";

export class CandidaturaService {
  getCandidaturas(): Promise<Candidatura[]> {
    return apiClient
      .get("eleccion/candidaturas/")
      .then(r => r.data)
      .catch(e => { throw new Error(e.message); });
  }

  crearCandidatura(cand: Candidatura): Promise<Candidatura> {
    const payload = {
      candidato: cand.candidato,
      sigla: cand.sigla,
      partido_politico: cand.partido_politico,
      color: cand.color,
      cargo_id: (typeof cand.cargo === "object" ? cand.cargo.id : cand.cargo),
      eleccion_id: (typeof cand.eleccion === "object" ? cand.eleccion.id : cand.eleccion),
    };
    return apiClient
      .post("eleccion/candidaturas/", payload, {
        headers: { "Content-Type": "application/json" }
      })
      .then(r => r.data)
      .catch(e => { throw new Error(e.message); });
  }

  editarCandidatura(cand: Candidatura): Promise<Candidatura> {
    const payload = {
      candidato: cand.candidato,
      sigla: cand.sigla,
      partido_politico: cand.partido_politico,
      color: cand.color,
      cargo_id: (typeof cand.cargo === "object" ? cand.cargo.id : cand.cargo),
      eleccion_id: (typeof cand.eleccion === "object" ? cand.eleccion.id : cand.eleccion),
    };
    return apiClient
      .put(`eleccion/candidaturas/${cand.id}/`, payload, {
        headers: { "Content-Type": "application/json" }
      })
      .then(r => r.data)
      .catch(e => { throw new Error(e.message); });
  }

  eliminarCandidatura(id: number): Promise<void> {
    return apiClient
      .delete(`eleccion/candidaturas/${id}/`)
      .then(() => {})
      .catch(e => { throw new Error(e.message); });
  }
}
