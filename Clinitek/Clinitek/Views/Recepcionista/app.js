/* ================== Utilidades ================== */
/** Convierte DUI DB "123456789" -> UI "12345678-9" */
function duiToUI(dbDui){
  if(!dbDui) return "";
  const s = dbDui.replace(/\D/g, "").padStart(9, "0").slice(-9);
  return `${s.slice(0,8)}-${s.slice(8)}`;
}
/** Convierte DUI UI "12345678-9" -> DB "123456789" */
function duiToDB(uiDui){
  if(!uiDui) return "";
  return uiDui.replace(/\D/g, "").slice(0,9);
}

/* ================== Estado en memoria (demo) ================== */
const state = {
  clinicas: [],
  medicos: [],
  pacientes: [],
  recepcionistas: [],
  cuentas: [],
  citas: [],     // {CitaId, Fecha (ISO), MedicoId, PacienteId, Estado}
  historiales: []
};

/* ================== Navegación ================== */
const menuButtons = document.querySelectorAll('.top-nav button[data-view]');
function setActive(btn){
  menuButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function showSection(view){
  document.querySelectorAll('main [data-section]').forEach(s => s.hidden = true);
  const section = document.querySelector(`[data-section="${view}"]`);
  if(section) section.hidden = false;
}
menuButtons.forEach(button => {
  button.addEventListener('click', function(){
    setActive(this);
    showSection(this.dataset.view);
  });
});
showSection('dashboard');

/* ================== Render helpers ================== */
function renderMedicosSelect() {
  const sel = document.getElementById('f-medico');
  sel.innerHTML = `<option value="">Todos</option>` +
    state.medicos.map(m => `<option value="${m.MedicoId}">${m.Nombre}</option>`).join("");
}
function renderCitasHoy() {
  const tbody = document.querySelector('#tbl-hoy tbody');
  const fechaSel = document.getElementById('f-fecha').value || new Date().toISOString().slice(0,10);
  const medicoSel = document.getElementById('f-medico').value;
  const estadoSel = document.getElementById('f-estado').value;

  const citasDia = state.citas.filter(c => c.Fecha.slice(0,10) === fechaSel)
    .filter(c => (medicoSel ? String(c.MedicoId) === String(medicoSel) : true))
    .filter(c => (estadoSel ? c.Estado === estadoSel : true));

  const row = (c) => {
    const med = state.medicos.find(m => m.MedicoId === c.MedicoId);
    const pac = state.pacientes.find(p => p.PacienteId === c.PacienteId);
    const hora = new Date(c.Fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const tagClass = c.Estado === 'Confirmada' ? 'ok' : (c.Estado === 'Cancelada' ? 'err' : 'warn');
    return `<tr>
      <td>${hora}</td>
      <td>${pac?.Nombre ?? '-'}</td>
      <td>${med?.Nombre ?? '-'}</td>
      <td>${med?.Especialidad ?? '-'}</td>
      <td><span class="tag ${tagClass}">${c.Estado ?? 'Pendiente'}</span></td>
      <td><button class="btn">Abrir</button></td>
    </tr>`;
  };

  tbody.innerHTML = citasDia.map(row).join("");

  // KPIs
  const hoy = state.citas.filter(c => c.Fecha.slice(0,10) === fechaSel);
  document.getElementById('kpi-hoy').textContent  = hoy.length;
  document.getElementById('kpi-conf').textContent = hoy.filter(c=>c.Estado==='Confirmada').length;
  document.getElementById('kpi-canc').textContent = hoy.filter(c=>c.Estado==='Cancelada').length;
}
function renderPacientes() {
  const tbody = document.querySelector('#tbl-pac tbody');
  const rows = state.pacientes.map(p => `
    <tr>
      <td>${duiToUI(p.DUI)}</td>
      <td>${p.Nombre}</td>
      <td>${p.Telefono ?? ''}</td>
      <td>${p.Email ?? ''}</td>
      <td>${p.Notas ?? ''}</td>
      <td><button class="btn">Editar</button></td>
    </tr>
  `).join("");
  tbody.innerHTML = rows;
}
function renderReportes() {
  // Demo simple por fecha de citas
  const porFecha = {};
  state.citas.forEach(c=>{
    const f = c.Fecha.slice(0,10);
    porFecha[f] = porFecha[f] || {Total:0, Confirmadas:0, Canceladas:0};
    porFecha[f].Total++;
    if(c.Estado==='Confirmada') porFecha[f].Confirmadas++;
    if(c.Estado==='Cancelada') porFecha[f].Canceladas++;
  });
  const tbodyDia = document.querySelector('#rep-dia tbody');
  tbodyDia.innerHTML = Object.entries(porFecha).sort().map(([fecha, v])=>`
    <tr><td>${fecha}</td><td>${v.Total}</td><td>${v.Confirmadas}</td><td>${v.Canceladas}</td></tr>
  `).join("");

  // Top horarios (hora redondeada por HH:MM)
  const horas = {};
  state.citas.forEach(c=>{
    const t = new Date(c.Fecha);
    const hhmm = t.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    horas[hhmm] = (horas[hhmm]||0)+1;
  });
  const tbodyTop = document.querySelector('#rep-top tbody');
  tbodyTop.innerHTML = Object.entries(horas)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,6)
    .map(([h,c])=>`<tr><td>${h}</td><td>${c}</td></tr>`).join("");
}

/* ================== Filtros / eventos ================== */
['f-fecha','f-medico','f-estado'].forEach(id=>{
  const el = document.getElementById(id);
  if(id==='f-fecha') el.value = new Date().toISOString().slice(0,10);
  el.addEventListener('change', renderCitasHoy);
});
document.getElementById('pac-buscar')?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  const tbody = document.querySelector('#tbl-pac tbody');
  const matches = state.pacientes.filter(p =>
    p.Nombre.toLowerCase().includes(q) || duiToUI(p.DUI).includes(q)
  );
  tbody.innerHTML = matches.map(p => `
    <tr>
      <td>${duiToUI(p.DUI)}</td>
      <td>${p.Nombre}</td>
      <td>${p.Telefono ?? ''}</td>
      <td>${p.Email ?? ''}</td>
      <td>${p.Notas ?? ''}</td>
      <td><button class="btn">Editar</button></td>
    </tr>
  `).join("");
});

/* ================== Simulación de carga (seed) ================== */
document.getElementById('seed').addEventListener('click', async () => {
  // Basado en tus INSERT iniciales
  state.clinicas = [{ClinicaId:1, Nombre:'Clinitek Central', Direccion:'Av. Principal #123', Telefono:'2222-3333'}];

  state.medicos = [
    {MedicoId:1, Nombre:'Dr. Juan Pérez',  Especialidad:'Cardiología', Telefono:'7890-1234'},
    {MedicoId:2, Nombre:'Dra. María Gómez', Especialidad:'Pediatría',  Telefono:'7890-5678'}
  ];

  state.pacientes = [
    {PacienteId:1, Nombre:'Carlos López', DUI:'123456789', Telefono:'7777-8888', Email:'carlos@mail.com'},
    {PacienteId:2, Nombre:'Ana Torres',   DUI:'987654321', Telefono:'9999-0000', Email:'ana@mail.com'}
  ];

  state.recepcionistas = [{RecepcionistaId:1, Nombre:'Laura Sánchez', Telefono:'2233-4455'}];

  state.cuentas = [{CuentaId:1, Username:'admin', PasswordHash:'admin', Role:'Admin', PersonaId:null}];

  // Citas demo de hoy
  const today = new Date();
  const iso = (h,m)=> new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).toISOString();
  state.citas = [
    {CitaId:1, Fecha: iso(9,0),  MedicoId:1, PacienteId:1, Estado:'Pendiente'},
    {CitaId:2, Fecha: iso(10,0), MedicoId:2, PacienteId:2, Estado:'Confirmada'},
    {CitaId:3, Fecha: iso(11,30),MedicoId:1, PacienteId:2, Estado:'Pendiente'},
    {CitaId:4, Fecha: iso(14,0), MedicoId:2, PacienteId:1, Estado:'Confirmada'}
  ];

  renderMedicosSelect();
  renderCitasHoy();
  renderPacientes();
  renderReportes();
  alert('Datos demo cargados.');
});

/* Acción rápida para "Nueva cita" (placeholder) */
document.getElementById('new-quick').addEventListener('click', ()=>{
  // Aquí abrirías un modal real; dejo demo que agrega una cita en 30 min
  const base = new Date();
  const nueva = {
    CitaId: (state.citas.at(-1)?.CitaId ?? 0) + 1,
    Fecha: new Date(base.getTime() + 30*60000).toISOString(),
    MedicoId: state.medicos[0]?.MedicoId ?? 1,
    PacienteId: state.pacientes[0]?.PacienteId ?? 1,
    Estado:'Pendiente'
  };
  state.citas.push(nueva);
  renderCitasHoy();
});

/* ================== Búsqueda global (placeholder) ================== */
document.getElementById('q').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const term = e.target.value.trim().toLowerCase();
    // Aquí podrías redirigir a la vista adecuada:
    // - si coincide con paciente: ir a Gestión de Perfiles y filtrar
    const hit = state.pacientes.find(p => p.Nombre.toLowerCase().includes(term) || duiToUI(p.DUI).includes(term));
    if(hit){
      document.querySelector('.top-nav button[data-view="pacientes"]').click();
      const input = document.getElementById('pac-buscar');
      input.value = hit.Nombre;
      input.dispatchEvent(new Event('input'));
    } else {
      alert('Sin resultados (demo). Integra tu /api/buscar para resultados reales.');
    }
  }
});

/* ================== (Opcional) Hooks de API reales ==================
   Reemplaza estas funciones con tus endpoints .NET/Node/etc.

async function fetchPacientes(){ 
  const r = await fetch('/api/pacientes'); 
  return r.json(); // [{PacienteId, Nombre, DUI, Telefono, Email, Notas}]
}
async function fetchMedicos(){ 
  const r = await fetch('/api/medicos'); 
  return r.json(); // [{MedicoId, Nombre, Especialidad, Telefono}]
}
async function fetchCitas(params){ 
  const r = await fetch('/api/citas?fecha=YYYY-MM-DD&MedicoId=&Estado='); 
  return r.json(); // [{CitaId, Fecha, MedicoId, PacienteId, Estado}]
}
===================================================================== */
