"use client";

import { useEffect, useMemo, useState } from "react";

type Docente = {
  id:number; documento:string; nombres:string; apellidos:string; cargo:string; tipoPago:string;
  escalafon:string; formacion:string; facultad:string; programa:string; docencia:number;
  dedicacion:number; investigacion:number; administrativo:number; extension:number; otras:number;
  internacionalizacion:number; alertaDocencia:boolean;
};

const nf = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const activityKeys = ["docencia","investigacion","extension","administrativo","otras"] as const;
const activityLabels: Record<string,string> = {docencia:"Docencia", investigacion:"Investigación", extension:"Extensión", administrativo:"Administrativo", otras:"Otras"};

function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) {
  return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}><option value="">Todos</option>{options.map(x=><option key={x}>{x}</option>)}</select></label>
}

export default function Home() {
  const [data,setData]=useState<Docente[]>([]);
  const [query,setQuery]=useState(""); const [facultad,setFacultad]=useState("");
  const [cargo,setCargo]=useState(""); const [formacion,setFormacion]=useState("");
  const [actividad,setActividad]=useState(""); const [soloExtension,setSoloExtension]=useState(false);
  const [page,setPage]=useState(1); const [tab,setTab]=useState<"resumen"|"docentes"|"calidad">("resumen");
  useEffect(()=>{fetch("/docentes.json").then(r=>r.json()).then(setData)},[]);
  const options=(key:keyof Docente)=>Array.from(new Set(data.map(d=>String(d[key])).filter(Boolean))).sort();
  const filtered=useMemo(()=>data.filter(d=>{
    const text=`${d.nombres} ${d.apellidos} ${d.documento} ${d.programa}`.toLowerCase();
    return (!query||text.includes(query.toLowerCase()))&&(!facultad||d.facultad===facultad)&&(!cargo||d.cargo===cargo)&&(!formacion||d.formacion===formacion)&&(!soloExtension||d.extension>0)&&(!actividad||(d[actividad as keyof Docente] as number)>0)
  }),[data,query,facultad,cargo,formacion,soloExtension,actividad]);
  useEffect(()=>setPage(1),[query,facultad,cargo,formacion,soloExtension,actividad]);
  const docentes=new Set(filtered.map(d=>d.documento)).size;
  const sum=(k:keyof Docente)=>filtered.reduce((a,d)=>a+Number(d[k]||0),0);
  const byFaculty=useMemo(()=>Object.entries(filtered.reduce((a,d)=>{a[d.facultad]=(a[d.facultad]||0)+1;return a},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]),[filtered]);
  const activityTotals=activityKeys.map(k=>({key:k,label:activityLabels[k],value:sum(k)}));
  const maxActivity=Math.max(...activityTotals.map(x=>x.value),1); const maxFaculty=Math.max(...byFaculty.map(x=>x[1]),1);
  const reset=()=>{setQuery("");setFacultad("");setCargo("");setFormacion("");setActividad("");setSoloExtension(false)};
  const perPage=12, pages=Math.max(1,Math.ceil(filtered.length/perPage)), shown=filtered.slice((page-1)*perPage,page*perPage);
  const anomalies=data.filter(d=>d.alertaDocencia).length, withoutProgram=data.filter(d=>!d.programa).length;
  const uniqueDocs=new Set(data.map(d=>d.documento)).size;

  return <main>
    <aside>
      <div className="brand"><img src="/logo-colmayor.png" alt="Institución Universitaria Colegio Mayor de Antioquia"/><div><strong>PlanDoc</strong><small>Analítica docente</small></div></div>
      <nav><button className={tab==="resumen"?"active":""} onClick={()=>setTab("resumen")}>▦ <span>Resumen</span></button><button className={tab==="docentes"?"active":""} onClick={()=>setTab("docentes")}>♙ <span>Docentes</span></button><button className={tab==="calidad"?"active":""} onClick={()=>setTab("calidad")}>◇ <span>Calidad de datos</span></button></nav>
      <div className="period"><small>PERIODO ACTIVO</small><strong>2026 — 01</strong><span>Base actualizada</span></div>
    </aside>
    <section className="workspace">
      <header><div><p className="eyebrow">PLANEACIÓN ACADÉMICA</p><h1>{tab==="resumen"?"Panorama docente":tab==="docentes"?"Explorador de docentes":"Control de calidad"}</h1><p>{tab==="resumen"?"Distribución de la dedicación y actividades misionales.":tab==="docentes"?"Consulta detallada de vinculaciones y cargas académicas.":"Hallazgos que requieren revisión antes de consolidar cifras."}</p></div><div className="status"><i></i> 807 registros cargados</div></header>
      <div className="filters">
        <label className="search"><span>Buscar docente o programa</span><input placeholder="Nombre, documento o programa…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
        <Select label="Facultad" value={facultad} onChange={setFacultad} options={options("facultad")}/><Select label="Cargo" value={cargo} onChange={setCargo} options={options("cargo")}/><Select label="Formación" value={formacion} onChange={setFormacion} options={options("formacion")}/><Select label="Actividad" value={actividad} onChange={setActividad} options={activityKeys.map(k=>k)}/>
        <label className="check"><input type="checkbox" checked={soloExtension} onChange={e=>setSoloExtension(e.target.checked)}/> Con extensión</label>
        <button className="clear" onClick={reset}>Limpiar</button>
      </div>

      {tab==="resumen"&&<>
        <div className="kpis"><article><span>DOCENTES ÚNICOS</span><strong>{nf.format(docentes)}</strong><small>{filtered.length} vinculaciones visibles</small></article><article><span>HORAS DE EXTENSIÓN</span><strong>{nf.format(sum("extension"))}</strong><small>{new Set(filtered.filter(d=>d.extension>0).map(d=>d.documento)).size} docentes participan</small></article><article><span>HORAS DE INVESTIGACIÓN</span><strong>{nf.format(sum("investigacion"))}</strong><small>{new Set(filtered.filter(d=>d.investigacion>0).map(d=>d.documento)).size} docentes participan</small></article><article><span>DEDICACIÓN SEMESTRAL</span><strong>{nf.format(sum("dedicacion"))}</strong><small>Horas registradas</small></article></div>
        <div className="grid"><article className="panel"><div className="panel-title"><div><h2>Composición de actividades</h2><p>Horas registradas según filtros activos</p></div><span>2026—01</span></div><div className="bars">{activityTotals.map(x=><button key={x.key} title={`${x.label}: ${nf.format(x.value)} horas`} onClick={()=>setActividad(x.key)}><span>{x.label}</span><div><i style={{width:`${x.value/maxActivity*100}%`}}></i></div><b>{nf.format(x.value)}</b></button>)}</div></article><article className="panel"><div className="panel-title"><div><h2>Registros por facultad</h2><p>Participación en la selección</p></div></div><div className="faculty-list">{byFaculty.map(([name,value])=><button key={name} onClick={()=>setFacultad(name)}><div><span>{name.replace("Facultad de ","")}</span><b>{value}</b></div><i style={{width:`${value/maxFaculty*100}%`}}></i></button>)}</div></article></div>
        <article className="insight"><div className="insight-icon">↗</div><div><strong>Lectura rápida</strong><p>{soloExtension?"La vista está enfocada en docentes con extensión.":`${nf.format(new Set(filtered.filter(d=>d.extension>0).map(d=>d.documento)).size)} docentes tienen horas de extensión en la selección actual.`} Usa las barras para profundizar por actividad.</p></div><button onClick={()=>{setSoloExtension(true);setTab("docentes")}}>Ver docentes →</button></article>
      </>}

      {tab==="docentes"&&<article className="panel table-panel"><div className="panel-title"><div><h2>Vinculaciones docentes</h2><p>{filtered.length} resultados · {docentes} docentes únicos</p></div><span>Página {page} de {pages}</span></div><div className="table-wrap"><table><thead><tr><th>Docente</th><th>Facultad / programa</th><th>Cargo</th><th>Docencia</th><th>Investigación</th><th>Extensión</th><th>Dedicación</th></tr></thead><tbody>{shown.map(d=><tr key={d.id}><td><strong>{d.nombres} {d.apellidos}</strong><small>CC ···{d.documento.slice(-4)} · {d.formacion}</small></td><td><span>{d.facultad.replace("Facultad de ","")}</span><small>{d.programa||"Sin programa asociado"}</small></td><td><span className="pill">{d.cargo.replace("Docente ","")}</span></td><td>{nf.format(d.docencia)}</td><td>{nf.format(d.investigacion)}</td><td><b className={d.extension>0?"positive":""}>{nf.format(d.extension)}</b></td><td>{nf.format(d.dedicacion)}</td></tr>)}</tbody></table></div><div className="pagination"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Anterior</button><button disabled={page===pages} onClick={()=>setPage(p=>p+1)}>Siguiente →</button></div></article>}

      {tab==="calidad"&&<><div className="quality-grid"><article><span className="qicon warning">!</span><div><strong>{anomalies} valores corregidos</strong><p>Horas de docencia con pérdida aparente del separador decimal. Se ajustaron para el MVP y permanecen marcadas.</p></div></article><article><span className="qicon">○</span><div><strong>{withoutProgram} registros sin programa</strong><p>Pueden consultarse, pero requieren completar su asociación académica.</p></div></article><article><span className="qicon">≡</span><div><strong>{data.length-uniqueDocs} filas adicionales</strong><p>Un docente puede tener más de una vinculación, facultad o programa. Los KPI cuentan documentos únicos.</p></div></article><article><span className="qicon">✓</span><div><strong>{uniqueDocs} identificadores únicos</strong><p>El documento se utiliza como llave de consolidación del docente.</p></div></article></div><article className="panel rules"><h2>Reglas aplicadas en el MVP</h2><ul><li>Las cifras institucionales distinguen docentes únicos de vinculaciones.</li><li>Los documentos se ocultan parcialmente en la interfaz.</li><li>Los valores de docencia mayores a 100.000 se dividieron por 10¹² y se marcaron como anomalía.</li><li>Los campos vacíos no se convierten en categorías artificiales.</li><li>Los filtros se aplican de forma conjunta a indicadores, gráficos y tabla.</li></ul></article></>}
    </section>
  </main>
}
