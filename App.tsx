
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { AppState, FormStatus, INITIAL_DATA, ExtractedData, BANCO_ENTRY_IDS, CARTA_PODER_BANCO_IDS, AppFile } from './types';
import { extractDocumentData } from './services/geminiService';

const FORM_STEPS = [
  { id: 1, title: 'Titular', icon: '👤' },
  { id: 2, title: 'Localidad', icon: '📍' },
  { id: 3, title: 'Economía', icon: '💵' },
  { id: 4, title: 'Deudas (Tabla)', icon: '🏦' },
  { id: 5, title: 'Liquidación', icon: '🗓️' },
  { id: 6, title: 'ENLACES PRE-LLENADOS', icon: '🚀' },
];

export default function App() {
  const [state, setState] = useState<AppState>({
    status: FormStatus.IDLE,
    currentStep: 1,
    data: { ...INITIAL_DATA },
    files: []
  });

  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (base64: string, mimeType: string, name: string) => {
    const newFile: AppFile = { base64, mimeType, name, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, files: [...prev.files, newFile] }));
    setError(null);
  };

  const removeFile = (id: string) => {
    setState(prev => ({ ...prev, files: prev.files.filter(f => f.id !== id) }));
  };

  const startExtraction = async () => {
    if (state.files.length === 0) {
      setError("Atención: Por favor sube los archivos del expediente (PDF o Fotos).");
      return;
    }
    setError(null);
    setState(prev => ({ ...prev, status: FormStatus.EXTRACTING }));

    try {
      const extracted = await extractDocumentData(state.files);
      const full = `${extracted.nombre || ''} ${extracted.apellidoPaterno || ''} ${extracted.apellidoMaterno || ''}`.trim();
      setState(prev => ({
        ...prev,
        status: FormStatus.REVIEW,
        data: { ...prev.data, ...extracted, nombreCompleto: full }
      }));
    } catch (e) {
      console.error(e);
      setError("Error en el análisis de IA. Verifica que los documentos sean legibles.");
      setState(prev => ({ ...prev, status: FormStatus.IDLE }));
    }
  };

  const updateField = (field: keyof ExtractedData, value: any) => {
    setState(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  const getFilledUrl = (baseUrl: string, blockIndex: number, isCartaPoder: boolean = false) => {
    const { data } = state;
    let params = `?usp=pp_url`;
    
    // Mapeo común que se inyecta en todos los bloques
    const commonMapping: any = {
      // Identidad
      "entry.1528884326": data.folio,
      "entry.467392620": data.fechaNegociacion,
      "entry.145343656": data.nombre,
      "entry.1292799277": data.apellidoPaterno,
      "entry.1140129990": data.apellidoMaterno,
      "entry.1165461828": data.curp,
      "entry.296904391": data.fechaNacimiento,
      "entry.1291947679": data.edad,
      "entry.17812200": data.sexo,
      "entry.867363903": data.estadoCivil,
      "entry.1246420298": data.ocupacion,
      "entry.1270154711": data.nivelAcademico,
      "entry.1037231494": data.telefono,
      "entry.497192232": data.nacionalidad,
      // Ubicación
      "entry.1192664824": data.calle,
      "entry.1504725515": data.numExt,
      "entry.1743712475": data.colonia,
      "entry.1828990869": data.municipio,
      "entry.104703900": data.estado,
      "entry.1649286337": data.cp,
      "entry.276802533": data.tipoVivienda,
      "entry.889961116": data.añosVivienda,
      "entry.1164640420": data.dependientes,
      // Financiero
      "entry.1580769637": data.ingresoBruto,
      "entry.487220238": data.ingresoNeto,
      "entry.1253596906": data.deudaTotal,
      "entry.231007905": data.deudaTotalLetra,
      "entry.1890290010": data.montoLiquidas,
      "entry.86580786": data.montoLiquidasLetra,
      "entry.746701300": data.montoAporte,
      "entry.1264301773": data.montoAporte,
      "entry.1052306013": data.montoAporteLetra,
      "entry.1219641766": data.fechaPrimerAporte,
      "entry.826192875": data.diaAporte,
      // Campos compartidos por otros formularios
      "entry.2061124974": data.nombreCompleto,
      "entry.130578309": data.fechaNegociacion,
      "entry.7814906": data.nombreCompleto,
      "entry.480564284": data.folio,
      "entry.801835681": data.nombreCompleto,
      "entry.1936956575": data.fechaNegociacion,
      "entry.884755422": data.telefono,
      "entry.1875229565": data.correo,
      "entry.1741035083": data.nombreCompleto,
      "entry.1382356999": data.nombreCompleto,
      "entry.1562640317": data.valorCps,
      "entry.1205450977": data.valorCpsLetra,
      "entry.1302360453": data.nombreCompleto,
      "entry.802170752": data.fechaNegociacion,
      "entry.380642958": data.nombreCompleto,
      "entry.2127578933": data.folio,
    };

    Object.entries(commonMapping).forEach(([k, v]) => {
      if (v) params += `&${k}=${encodeURIComponent(String(v))}`;
    });

    // Inyectar bloque de 6 deudas
    const blockStart = blockIndex * 6;
    const blockBancos = data.bancos.slice(blockStart, blockStart + 6);

    blockBancos.forEach((b, i) => {
      if (isCartaPoder) {
        const ids = CARTA_PODER_BANCO_IDS[i];
        params += `&${ids.acreedor}=${encodeURIComponent(b.acreedor)}`;
        params += `&${ids.monto}=${encodeURIComponent(b.monto)}`;
      } else {
        const ids = BANCO_ENTRY_IDS[i];
        params += `&${ids.acreedor}=${encodeURIComponent(b.acreedor)}`;
        params += `&${ids.credito}=${encodeURIComponent(b.credito)}`;
        params += `&${ids.monto}=${encodeURIComponent(b.monto)}`;
      }
    });

    return baseUrl + params;
  };

  const renderCurrentForm = () => {
    const { data } = state;
    const inputClass = "w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-xs font-bold shadow-sm transition-all";
    const labelClass = "block text-[10px] font-black text-black uppercase mb-1 ml-1 tracking-tight";

    switch (state.currentStep) {
      case 1: return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelClass}>Nombres</label><input value={data.nombre} onChange={e => updateField('nombre', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Paterno</label><input value={data.apellidoPaterno} onChange={e => updateField('apellidoPaterno', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Materno</label><input value={data.apellidoMaterno} onChange={e => updateField('apellidoMaterno', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>CURP</label><input value={data.curp} onChange={e => updateField('curp', e.target.value)} className={inputClass + " uppercase font-mono"} /></div>
            <div><label className={labelClass}>Clave Elector</label><input value={data.claveElector} onChange={e => updateField('claveElector', e.target.value)} className={inputClass + " uppercase font-mono"} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={labelClass}>Edad</label><input value={data.edad} onChange={e => updateField('edad', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Sexo</label><input value={data.sexo} onChange={e => updateField('sexo', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Estado Civil</label><input value={data.estadoCivil} onChange={e => updateField('estadoCivil', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Teléfono</label><input value={data.telefono} onChange={e => updateField('telefono', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Correo</label><input value={data.correo} onChange={e => updateField('correo', e.target.value)} className={inputClass} /></div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className={labelClass}>Calle</label><input value={data.calle} onChange={e => updateField('calle', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Número</label><input value={data.numExt} onChange={e => updateField('numExt', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Colonia</label><input value={data.colonia} onChange={e => updateField('colonia', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Municipio</label><input value={data.municipio} onChange={e => updateField('municipio', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Estado</label><input value={data.estado} onChange={e => updateField('estado', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>C.P.</label><input value={data.cp} onChange={e => updateField('cp', e.target.value)} className={inputClass} /></div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Folio CORE</label><input value={data.folio} onChange={e => updateField('folio', e.target.value)} className={inputClass + " border-black text-indigo-600"} /></div>
            <div><label className={labelClass}>F. Negociación</label><input value={data.fechaNegociacion} onChange={e => updateField('fechaNegociacion', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Ingreso Bruto</label><input value={data.ingresoBruto} onChange={e => updateField('ingresoBruto', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Ingreso Neto</label><input value={data.ingresoNeto} onChange={e => updateField('ingresoNeto', e.target.value)} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Deuda Total Monto</label><input value={data.deudaTotal} onChange={e => updateField('deudaTotal', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Deuda Total Letra</label><input value={data.deudaTotalLetra} onChange={e => updateField('deudaTotalLetra', e.target.value)} className={inputClass + " uppercase italic font-medium"} /></div>
        </div>
      );
      case 4: return (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-black text-[#D4AF37] p-4 rounded-2xl flex justify-between items-center mb-4 sticky top-0 z-10">
            <span className="text-xs font-black">TABLA DE DEUDAS DETECTADAS</span>
            <span className="text-[10px] font-bold bg-[#D4AF37] text-black px-3 py-1 rounded-full">{data.bancos.length} ACTIVAS</span>
          </div>
          {data.bancos.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No se detectaron deudas automáticamente.</p>}
          {data.bancos.map((b, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border-l-8 border-black grid grid-cols-3 gap-3 shadow-sm">
              <div className="col-span-3 text-[10px] font-black text-slate-400">REGISTRO #{i+1}</div>
              <div><label className={labelClass}>Acreedor</label><input value={b.acreedor} onChange={e => {
                const newBancos = [...data.bancos];
                newBancos[i] = { ...b, acreedor: e.target.value };
                updateField('bancos', newBancos);
              }} className={inputClass} /></div>
              <div><label className={labelClass}>Crédito</label><input value={b.credito} onChange={e => {
                const newBancos = [...data.bancos];
                newBancos[i] = { ...b, credito: e.target.value };
                updateField('bancos', newBancos);
              }} className={inputClass} /></div>
              <div><label className={labelClass}>Monto</label><input value={b.monto} onChange={e => {
                const newBancos = [...data.bancos];
                newBancos[i] = { ...b, monto: e.target.value };
                updateField('bancos', newBancos);
              }} className={inputClass} /></div>
            </div>
          ))}
        </div>
      );
      case 5: return (
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Monto Liquidar</label><input value={data.montoLiquidas} onChange={e => updateField('montoLiquidas', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Liquidas Letra</label><input value={data.montoLiquidasLetra} onChange={e => updateField('montoLiquidasLetra', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Aporte Mensual</label><input value={data.montoAporte} onChange={e => updateField('montoAporte', e.target.value)} className={inputClass + " bg-yellow-50"} /></div>
          <div><label className={labelClass}>Aporte Letra</label><input value={data.montoAporteLetra} onChange={e => updateField('montoAporteLetra', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>1er Aporte</label><input value={data.fechaPrimerAporte} onChange={e => updateField('fechaPrimerAporte', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Día de Pago</label><input value={data.diaAporte} onChange={e => updateField('diaAporte', e.target.value)} className={inputClass} /></div>
        </div>
      );
      case 6: {
        const debtBlocks = Math.ceil(data.bancos.length / 6) || 1;
        return (
          <div className="space-y-6">
            <div className="bg-black text-[#D4AF37] p-6 rounded-[32px] border-2 border-[#D4AF37]/30 mb-8">
              <h3 className="text-lg font-black uppercase tracking-tighter">Panel de Inyección de Datos</h3>
              <p className="text-[11px] text-white/60 font-medium uppercase tracking-widest mt-1">
                Detectamos {data.bancos.length} deudas. Se han generado {debtBlocks} bloques de formularios.
              </p>
            </div>

            <div className="space-y-8">
              {/* Bloques de Carátula */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Módulos de Carátula (Identidad + Bancos)</h4>
                {[...Array(debtBlocks)].map((_, i) => (
                  <button key={`caratula-${i}`} onClick={() => window.open(getFilledUrl('https://docs.google.com/forms/d/e/1FAIpQLSfonP1hkAxUxR1EzN0SV2Apl4PJ8jvQ1phELIT6dUwwWk9kJw/viewform', i), '_blank')}
                    className="w-full flex items-center justify-between p-5 bg-white border-2 border-black rounded-[24px] hover:bg-black hover:text-[#D4AF37] transition-all group shadow-sm">
                    <div className="flex flex-col text-left">
                      <span className="font-black text-sm uppercase tracking-tight">Carátula Principal • Bloque {i+1}</span>
                      <span className="text-[10px] opacity-60 font-bold uppercase">Incluye deudas {i*6+1} a {Math.min((i+1)*6, data.bancos.length)}</span>
                    </div>
                    <div className="bg-[#D4AF37] text-black p-2 rounded-full group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bloques de Carta Poder */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Módulos de Carta Poder (Representación)</h4>
                {[...Array(debtBlocks)].map((_, i) => (
                  <button key={`poder-${i}`} onClick={() => window.open(getFilledUrl('https://docs.google.com/forms/d/e/1FAIpQLSck3u0JAoWosvZ3WXYqUPbttJVuXbule0xD1V3ejgAB-gM-9w/viewform', i, true), '_blank')}
                    className="w-full flex items-center justify-between p-5 bg-white border-2 border-indigo-100 rounded-[24px] hover:border-black transition-all group shadow-sm">
                    <div className="flex flex-col text-left">
                      <span className="font-black text-sm uppercase tracking-tight text-slate-800 group-hover:text-black">Carta Poder • Bloque {i+1}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase group-hover:text-slate-600">Representación legal de deudas {i*6+1} a {Math.min((i+1)*6, data.bancos.length)}</span>
                    </div>
                    <div className="bg-slate-100 text-slate-500 p-2 rounded-full group-hover:bg-black group-hover:text-[#D4AF37] transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Formularios Adicionales */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Formularios Complementarios</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: 'Acuerdos', url: 'https://docs.google.com/forms/d/e/1FAIpQLSes5De0hiIcCtSE-tcaRhqlsbwoaVNFyQrq22ZiMGktuNZ2Lg/viewform' },
                    { title: 'Datos Personales', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfIDxGsiXPBZg2R-ziTR0Oz994gaY7G5hQ78kRVxJkEW90-Wg/viewform' },
                    { title: 'CPS', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfGpCZg_2wCHdE06kKiZa7CBjuCI5HoVSUHU-XYE8ZWtAThNQ/viewform' },
                    { title: 'CAACB', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe4EMEtYUbNbRD4IEajpSSu3OrC3DmLHX_XlPbD3iWqrBu8JA/viewform' },
                    { title: 'Retenciones', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdNq269UiWRQXEJ_3Yd4oqHxXiipD2trk3RcyR7WBLyIDZeoA/viewform' }
                  ].map((f, i) => (
                    <button key={`extra-${i}`} onClick={() => window.open(getFilledUrl(f.url, 0), '_blank')}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group">
                      <span className="font-bold text-xs uppercase text-slate-600">{f.title}</span>
                      <div className="text-slate-300 group-hover:text-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <Layout>
      {state.status === FormStatus.IDLE && (
        <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black bg-black text-[#D4AF37] px-5 py-2 rounded-full uppercase tracking-[0.4em] mb-6 inline-block shadow-xl">
              MICROEMPRESA UNORC
            </span>
            <h2 className="text-7xl font-black text-black tracking-tighter mb-4 leading-none uppercase">
              Expediente <span className="text-[#D4AF37] italic">CORE</span>
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-xl mx-auto italic leading-tight">Gestión inteligente de deudas y automatización educativa UNOREP.</p>
          </div>
          
          <div className="max-w-xl mx-auto mb-10">
            <FileUpload 
              label="Bóveda de Archivos" 
              description="Sube uno o varios archivos (PDF / Imagen)" 
              hasFile={state.files.length > 0} 
              onFileSelect={handleFileSelect} 
              icon="📂" 
            />
            
            {state.files.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-2">
                {state.files.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-white p-3 px-5 rounded-2xl border-2 border-slate-50 shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xl">📄</span>
                      <span className="text-[10px] font-black uppercase tracking-tight truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="text-slate-300 hover:text-red-500 font-black text-[9px] uppercase tracking-widest transition-colors">ELIMINAR</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-6 rounded-[28px] text-center mb-8 border border-red-100 font-black uppercase text-xs tracking-widest animate-shake">{error}</div>}

          <div className="flex justify-center">
            <button 
              onClick={startExtraction} 
              disabled={state.files.length === 0}
              className={`px-24 py-8 rounded-[48px] font-black text-3xl shadow-2xl transition-all flex items-center gap-6 uppercase tracking-tighter ${
                state.files.length > 0 
                  ? 'bg-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black hover:-translate-y-2 active:scale-95' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}>
              Analizar Expediente
            </button>
          </div>
        </div>
      )}

      {state.status === FormStatus.EXTRACTING && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-pulse">
          <div className="relative mb-12">
            <div className="w-32 h-32 border-[12px] border-black border-t-[#D4AF37] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-[#D4AF37] text-xl">CORE</div>
          </div>
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase mb-2">Inyectando Inteligencia...</h2>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Dpto. IA UNOREP • Google Collab</p>
        </div>
      )}

      {state.status === FormStatus.REVIEW && (
        <div className="flex flex-col lg:flex-row gap-10 py-6">
          <aside className="lg:w-80 space-y-2 animate-in slide-in-from-left duration-500">
            <div className="mb-10 p-7 bg-black rounded-[40px] border-2 border-[#D4AF37]/40 shadow-2xl">
              <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em] block mb-2 opacity-50">Registro del Titular</span>
              <p className="font-black text-white text-xl tracking-tight uppercase leading-tight truncate">{state.data.nombreCompleto || 'PROCESANDO'}</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#D4AF37]">FOLIO: {state.data.folio || '---'}</span>
                <span className="bg-[#D4AF37] text-black text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-lg">VIVO</span>
              </div>
            </div>
            
            {FORM_STEPS.map(s => (
              <button key={s.id} onClick={() => setState(p => ({...p, currentStep: s.id}))} 
                className={`w-full text-left p-5 rounded-[28px] flex items-center gap-5 transition-all border-2 ${
                  state.currentStep === s.id 
                    ? 'bg-black text-[#D4AF37] border-black shadow-2xl scale-105' 
                    : 'bg-white text-slate-300 border-transparent hover:bg-slate-50'
                }`}>
                <span className="text-2xl">{s.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{s.title}</span>
              </button>
            ))}
            
            <div className="pt-12">
              <button onClick={() => window.location.reload()} className="w-full text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors py-4 border-t border-slate-50">
                Reiniciar Proceso CORE
              </button>
            </div>
          </aside>

          <div className="flex-1 bg-white rounded-[60px] p-10 lg:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-50 relative flex flex-col animate-in slide-in-from-right duration-500 min-h-[700px]">
            <header className="mb-12 flex items-center justify-between border-b-8 border-black pb-10">
              <div className="flex items-center gap-6">
                <span className="text-5xl">{FORM_STEPS[state.currentStep-1].icon}</span>
                <h2 className="text-5xl font-black text-black tracking-tighter uppercase italic">
                  {FORM_STEPS[state.currentStep-1].title}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black bg-black text-[#D4AF37] px-6 py-2 rounded-full tracking-widest uppercase">Módulo {state.currentStep} / 6</span>
              </div>
            </header>

            <div className="flex-1">
              {renderCurrentForm()}
            </div>

            <footer className="flex justify-between mt-16 pt-10 border-t border-slate-100">
              <button onClick={() => setState(p => ({...p, currentStep: Math.max(1, p.currentStep - 1)}))} 
                className={`px-10 py-5 font-black text-slate-200 hover:text-black transition-all uppercase text-[11px] tracking-[0.3em] ${state.currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                Módulo Anterior
              </button>
              {state.currentStep < 6 ? (
                <button onClick={() => setState(p => ({...p, currentStep: p.currentStep + 1}))} 
                  className="bg-black text-[#D4AF37] px-16 py-6 rounded-[32px] font-black shadow-2xl hover:bg-[#D4AF37] hover:text-black hover:scale-105 transition-all text-xs tracking-[0.2em] uppercase">
                  Siguiente Módulo
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.5em] mb-2 animate-pulse">Datos Listos para Envío</span>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Utiliza los botones de arriba para abrir los formularios.</p>
                </div>
              )}
            </footer>
          </div>
        </div>
      )}
    </Layout>
  );
}
