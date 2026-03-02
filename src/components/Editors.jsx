import React, { useCallback } from "react";
import { Bi } from "./Bi";
import { ArrayField, ColorField, LogoField, SectionHeader } from "./UI";
import { BugProblemCard } from "./BugsComponents";
import { ChangeCard } from "./ChangelogComponents";
import { StudyTopicCard } from "./StudyComponents";
import { useIsMobile } from "../hooks/useIsMobile";
import { emptyBugProblem, emptyChange, emptyStudyTopic } from "../constants/templates";

export function StudyEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addTopic    = () => setConfig(c => ({ ...c, topicos: [...c.topicos, emptyStudyTopic()] }));
  const updateTopic = (id, p) => setConfig(c => ({ ...c, topicos: c.topicos.map(x => x.id === id ? p : x) }));
  const removeTopic = id      => setConfig(c => ({ ...c, topicos: c.topicos.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-text" size={22} />} title="Informações do Estudo" subtitle="Metadados do relatório de aprendizado" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Estudo de React Hooks e Context API" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo / Tema</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Desenvolvimento Frontend Moderno" /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Estudante / Autor</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Seu nome" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["concept","Conceito"],["practice","Prática"],["summary","Resumo"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="info-circle" size={22} />} title="Introdução" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.introducao} onChange={v => upd("introducao", v)} placeholder="Objetivos do estudo e contexto..." />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-bookmark-fill" size={22} />} title="Tópicos de Estudo" subtitle="Conceitos e práticas aprendidas" badge={config.topicos.length} />
        {config.topicos.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="journal-plus" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhum tópico cadastrado</div>
            <button onClick={addTopic} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> Adicionar Tópico</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.topicos.map((topic, i) => (
              <StudyTopicCard key={topic.id} topic={topic} idx={i} onChange={p => updateTopic(topic.id, p)} onRemove={() => removeTopic(topic.id)} />
            ))}
            <button onClick={addTopic} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> Adicionar Tópico</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Conclusão" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder="Resumo do aprendizado e próximos passos..." />
        </div>
      </div>
    </div>
  );
}

export function BugsEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addProblem    = () => setConfig(c => ({ ...c, problemas: [...c.problemas, emptyBugProblem()] }));
  const updateProblem = (id, p) => setConfig(c => ({ ...c, problemas: c.problemas.map(x => x.id === id ? p : x) }));
  const removeProblem = id      => setConfig(c => ({ ...c, problemas: c.problemas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="file-earmark-text" size={22} />} title="Informações Gerais" subtitle="Metadados e identidade do relatório" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="1.0" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Análise de Segurança — API de Pagamentos" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Escopo do sistema analisado" /></div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Autor / Equipe</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["altaSev","Alta Sev."],["mediaSev","Média Sev."],["baixaSev","Baixa Sev."],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="journal-richtext" size={22} />} title="Resumo Executivo" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumoExecutivo} onChange={v => upd("resumoExecutivo", v)} placeholder="Contexto e objetivo da análise..." />
        </div>
      </div>
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="bug-fill" size={22} />} title="Problemas" subtitle="Vulnerabilidades e achados" badge={config.problemas.length} />
        {config.problemas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="shield-exclamation" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhum problema cadastrado</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>Adicione a primeira vulnerabilidade</div>
            <button onClick={addProblem} className="btn-primary"><Bi name="plus-circle-fill" size={16} /> Adicionar Problema</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.problemas.map((prob, i) => (
              <BugProblemCard key={prob.id} prob={prob} idx={i} onChange={p => updateProblem(prob.id, p)} onRemove={() => removeProblem(prob.id)} />
            ))}
            <button onClick={addProblem} className="btn-primary full" style={{ marginTop: 4 }}><Bi name="plus-circle-fill" size={16} /> Adicionar Problema</button>
          </div>
        )}
      </div>
      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Conclusão" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.conclusao} onChange={v => upd("conclusao", v)} placeholder="Considerações finais e próximos passos..." />
        </div>
      </div>
    </div>
  );
}

export function ChangelogEditor({ config, setConfig }) {
  const isMobile = useIsMobile();
  const upd     = useCallback((f, v) => setConfig(c => ({ ...c, [f]: v })), [setConfig]);
  const updCore = useCallback((f, v) => setConfig(c => ({ ...c, cores: { ...c.cores, [f]: v } })), [setConfig]);
  const updLogo = useCallback((url, nome) => setConfig(c => ({ ...c, logo: url, logoNome: nome })), [setConfig]);
  const addChange    = () => setConfig(c => ({ ...c, mudancas: [...c.mudancas, emptyChange()] }));
  const updateChange = (id, m) => setConfig(c => ({ ...c, mudancas: c.mudancas.map(x => x.id === id ? m : x) }));
  const removeChange = id      => setConfig(c => ({ ...c, mudancas: c.mudancas.filter(x => x.id !== id) }));

  return (
    <div className="editor-inner">
      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git-commit-fill" size={22} />} title="Informações da Versão" subtitle="Metadados do release" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div><label className="lbl">Formato</label><select className="inp" value={config.formato} onChange={e => upd("formato", e.target.value)}><option value="ABNT">ABNT (A4)</option><option value="CARTA">CARTA</option></select></div>
            <div><label className="lbl">Versão do Release</label><input className="inp" value={config.versao} onChange={e => upd("versao", e.target.value)} placeholder="2.4.1" /></div>
          </div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Título</label><input className="inp" value={config.titulo} onChange={e => upd("titulo", e.target.value)} placeholder="Changelog v2.4 — Refatoração do core" /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Subtítulo / Descrição curta</label><input className="inp" value={config.subtitulo} onChange={e => upd("subtitulo", e.target.value)} placeholder="Melhorias de performance e refatoração do módulo de auth" /></div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div><label className="lbl">Projeto / Serviço</label><input className="inp" value={config.projeto} onChange={e => upd("projeto", e.target.value)} placeholder="api-gateway, frontend-web..." /></div>
            <div><label className="lbl">Repositório</label><input className="inp" value={config.repositorio} onChange={e => upd("repositorio", e.target.value)} placeholder="github.com/org/repo" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18, marginBottom: 22 }}>
            <div><label className="lbl">Data inicial</label><input className="inp" type="date" value={config.dataInicio} onChange={e => upd("dataInicio", e.target.value)} /></div>
            <div><label className="lbl">Data final</label><input className="inp" type="date" value={config.dataFim} onChange={e => upd("dataFim", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 22 }}><label className="lbl">Autor / Equipe</label><input className="inp" value={config.autor} onChange={e => upd("autor", e.target.value)} placeholder="Nome do autor ou equipe" /></div>
          <LogoField value={config.logo} nome={config.logoNome} onChange={updLogo} />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="palette2" size={22} />} title="Paleta de Cores" subtitle="Personalização visual" />
        <div className="card" style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 18 }}>
            {[["primaria","Cor Primária"],["secundaria","Cor Secundária"],["breaking","Breaking"],["feat","Feature"],["fix","Fix"],["refactor","Refactor"],["perf","Perf"],["style","Style"],["chore","Chore"],["codeBg","Código BG"],["codeText","Código Texto"]].map(([k, label]) => (
              <ColorField key={k} label={label} value={config.cores[k]} onChange={v => updCore(k, v)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="textarea-t" size={22} />} title="Visão Geral" subtitle="Contexto e descrição geral das mudanças" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.descricao} onChange={v => upd("descricao", v)} placeholder="Descreva o contexto desta versão..." />
        </div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader icon={<Bi name="git-commit-fill" size={22} />} title="Mudanças" subtitle="Alterações, refatorações e melhorias" badge={config.mudancas.length} />
        {config.mudancas.length === 0 ? (
          <div className="card" style={{ padding: "56px 36px", textAlign: "center", border: "2px dashed var(--b2)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "var(--s2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Bi name="code-slash" size={32} style={{ color: "var(--tx3)" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx2)", marginBottom: 10 }}>Nenhuma mudança cadastrada</div>
            <div style={{ fontSize: 14, color: "var(--tx3)", marginBottom: 28 }}>Documente a primeira alteração do código</div>
            <button onClick={addChange} className="btn-primary" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> Adicionar Mudança
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {config.mudancas.map((change, i) => (
              <ChangeCard key={change.id} change={change} idx={i} onChange={m => updateChange(change.id, m)} onRemove={() => removeChange(change.id)} />
            ))}
            <button onClick={addChange} className="btn-primary full" style={{ marginTop: 4, background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Bi name="plus-circle-fill" size={16} /> Adicionar Mudança
            </button>
          </div>
        )}
      </div>

      <div>
        <SectionHeader icon={<Bi name="check2-circle" size={22} />} title="Resumo Final" subtitle="Considerações e observações finais" />
        <div className="card" style={{ padding: 30 }}>
          <ArrayField values={config.resumo} onChange={v => upd("resumo", v)} placeholder="Observações e próximos passos..." />
        </div>
      </div>
    </div>
  );
}
