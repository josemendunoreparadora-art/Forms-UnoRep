
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, AppFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractDocumentData(
  files: AppFile[]
): Promise<Partial<ExtractedData>> {
  // Usamos gemini-3-flash-preview para balancear costo cero y alta precisión en extracción de tablas
  const model = 'gemini-3-flash-preview'; 
  
  const prompt = `
    ACTÚA COMO UN ANALISTA DE DATOS SENIOR PARA UNOREP CORE (UNO REPARADORA UNORC).
    ESTE PROYECTO ES UNA COLABORACIÓN CON GOOGLE IA STUDIO PARA EL DEPARTAMENTO DE INTELIGENCIA ARTIFICIAL DE UNOREP CORE.

    Tu misión es extraer datos de un expediente que puede estar compuesto por múltiples archivos (INE, Plan de Liquidación, Estudio Socioeconómico).
    
    INSTRUCCIONES CRÍTICAS PARA DEUDAS:
    - Analiza exhaustivamente el Plan de Liquidación. EXTRAE TODAS LAS DEUDAS PRESENTES EN LA TABLA SIN EXCEPCIÓN.
    - El array "bancos" debe contener cada fila de la tabla detectada.
    - Por cada deuda extrae: Acreedor (ej: DIMEX, PLAN CREDI), Número de Crédito/Folio y Monto total adeudado.
    
    INSTRUCCIONES DE IDENTIDAD Y FINANZAS:
    - Extrae de la INE: Nombre, Apellido Paterno, Apellido Materno, CURP, Clave Elector, Sexo (MASCULINO/FEMENINO).
    - Extrae del Socioeconómico/Plan: Folio (ej: 07995), Fecha de Negociación, Edad, Estado Civil, Ocupación, Nivel Académico, Datos de Domicilio.
    - Genera los montos en letra en MAYÚSCULAS con formato legal: "X MIL X PESOS 00/100 M.N.".
    
    REGLAS DE FORMATO:
    - MONTOS: Formato "15,000.00" (numérico con coma y dos decimales, sin símbolo de pesos).
    - FECHAS: Formato DD/MM/AAAA.
    - ESTADO CIVIL: SOLTERO, CASADO, UNION LIBRE.
    - VIVIENDA: PROPIA, RENTADA, FAMILIARES.
  `;

  const parts = [
    { text: prompt },
    ...files.map(f => ({
      inlineData: { mimeType: f.mimeType, data: f.base64 }
    }))
  ];

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          folio: { type: Type.STRING },
          fechaNegociacion: { type: Type.STRING },
          nombre: { type: Type.STRING },
          apellidoPaterno: { type: Type.STRING },
          apellidoMaterno: { type: Type.STRING },
          curp: { type: Type.STRING },
          claveElector: { type: Type.STRING },
          fechaNacimiento: { type: Type.STRING },
          edad: { type: Type.STRING },
          sexo: { type: Type.STRING },
          estadoCivil: { type: Type.STRING },
          ocupacion: { type: Type.STRING },
          nivelAcademico: { type: Type.STRING },
          calle: { type: Type.STRING },
          numExt: { type: Type.STRING },
          colonia: { type: Type.STRING },
          municipio: { type: Type.STRING },
          estado: { type: Type.STRING },
          cp: { type: Type.STRING },
          tipoVivienda: { type: Type.STRING },
          añosVivienda: { type: Type.STRING },
          dependientes: { type: Type.STRING },
          ingresoBruto: { type: Type.STRING },
          ingresoNeto: { type: Type.STRING },
          deudaTotal: { type: Type.STRING },
          deudaTotalLetra: { type: Type.STRING },
          montoLiquidas: { type: Type.STRING },
          montoLiquidasLetra: { type: Type.STRING },
          montoAporte: { type: Type.STRING },
          montoAporteLetra: { type: Type.STRING },
          fechaPrimerAporte: { type: Type.STRING },
          diaAporte: { type: Type.STRING },
          telefono: { type: Type.STRING },
          correo: { type: Type.STRING },
          bancos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                acreedor: { type: Type.STRING },
                credito: { type: Type.STRING },
                monto: { type: Type.STRING },
              }
            }
          }
        },
      },
    },
  });

  return JSON.parse(response.text.trim()) as Partial<ExtractedData>;
}
