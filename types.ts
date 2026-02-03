
export interface Banco {
  acreedor: string;
  credito: string;
  monto: string;
}

export interface ExtractedData {
  // Identidad
  folio: string;
  fechaNegociacion: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  curp: string;
  claveElector: string;
  fechaNacimiento: string;
  edad: string;
  sexo: string;
  estadoCivil: string;
  ocupacion: string;
  nivelAcademico: string;
  nacionalidad: string;
  
  // Ubicación
  calle: string;
  numExt: string;
  colonia: string;
  municipio: string;
  estado: string;
  cp: string;
  tipoVivienda: string;
  añosVivienda: string;
  dependientes: string;

  // Financiero
  ingresoBruto: string;
  ingresoNeto: string;
  deudaTotal: string;
  deudaTotalLetra: string;
  montoLiquidas: string;
  montoLiquidasLetra: string;
  montoAporte: string;
  montoAporteLetra: string;
  fechaPrimerAporte: string;
  diaAporte: string;

  // Bancos (Lista dinámica)
  bancos: Banco[];

  // CPS y Otros
  valorCps: string;
  valorCpsLetra: string;

  // Contacto
  telefono: string;
  correo: string;
  
  observacionesIA: string;
}

export enum FormStatus {
  IDLE = 'IDLE',
  EXTRACTING = 'EXTRACTING',
  REVIEW = 'REVIEW',
}

export interface AppFile {
  base64: string;
  name: string;
  mimeType: string;
  id: string;
}

export interface AppState {
  status: FormStatus;
  currentStep: number;
  data: ExtractedData;
  files: AppFile[];
}

export const INITIAL_DATA: ExtractedData = {
  folio: '', fechaNegociacion: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', nombreCompleto: '', curp: '', claveElector: '', fechaNacimiento: '', edad: '', sexo: '', estadoCivil: '', ocupacion: '', nivelAcademico: '', nacionalidad: 'MEXICANA',
  calle: '', numExt: '', colonia: '', municipio: '', estado: '', cp: '', tipoVivienda: '', añosVivienda: '', dependientes: '',
  ingresoBruto: '', ingresoNeto: '', deudaTotal: '', deudaTotalLetra: '', montoLiquidas: '', montoLiquidasLetra: '', montoAporte: '', montoAporteLetra: '', fechaPrimerAporte: '', diaAporte: '',
  bancos: [],
  valorCps: '42', valorCpsLetra: 'CUARENTA Y DOS',
  telefono: '', correo: '', observacionesIA: ''
};

// IDs fijos para los 6 bloques de bancos en los formularios de Google
export const BANCO_ENTRY_IDS = [
  { acreedor: "entry.2141916609", credito: "entry.1594533517", monto: "entry.158260472" }, // B1
  { acreedor: "entry.493422700",  credito: "entry.1957573623", monto: "entry.1035572978" }, // B2
  { acreedor: "entry.1937563847", credito: "entry.698575090",  monto: "entry.688478285" }, // B3
  { acreedor: "entry.4042494",    credito: "entry.370218190",  monto: "entry.2129900619" }, // B4
  { acreedor: "entry.1440346470", credito: "entry.680591187",  monto: "entry.948747086" }, // B5
  { acreedor: "entry.1922739046", credito: "entry.95233042",   monto: "entry.509367085" }, // B6
];

export const CARTA_PODER_BANCO_IDS = [
  { acreedor: "entry.1217363705", monto: "entry.879306155" },
  { acreedor: "entry.69004546",   monto: "entry.1939408477" },
  { acreedor: "entry.489285289",  monto: "entry.191979165" },
  { acreedor: "entry.1758662077", monto: "entry.1718389505" },
  { acreedor: "entry.739499550",  monto: "entry.112350504" },
  { acreedor: "entry.294690435",  monto: "entry.629740178" },
];
