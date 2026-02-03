
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, AppFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractDocumentData(
  files: AppFile[]
): Promise<Partial<ExtractedData>> {
  // Usamos gemini-3-flash-preview para balancear costo cero y alta precisión
  const model = 'gemini-3-flash-preview'; 
  
  const prompt = `
    ACTÚA COMO UN ANALISTA DE DATOS SENIOR PARA UNOREP CORE (UNO REPARADORA UNORC).
    SISTEMA: UnoRep Forms IA.

    TU MISIÓN ES EXTRAER DATOS PRECISOS DE UN EXPEDIENTE (INE, PLAN DE LIQUIDACIÓN, ESTUDIO SOCIOECONÓMICO).
    
    INSTRUCCIONES DE IDENTIDAD Y SOCIOECONÓMICO:
    - Extrae de la INE: Nombre, Apellidos, CURP, Clave Elector, Sexo y Fecha de Nacimiento.
    - DEL ESTUDIO SOCIOECONÓMICO:
      * FOLIO: (ej. 08112)
      * EDAD: (ej. 44)
      * NIVEL ACADÉMICO / ESCOLARIDAD: ¡CRÍTICO! Aplica interpretación flexible. 
        REGLA: Si el documento menciona "Universidad", "Universitario", "Universitaria", "Lic.", "Licenciado", "Licenciatura", "Ing.", "Ingeniería", "Ingeniero", "Licenciatura trunca" o cualquier profesión de grado superior, DEBES colocar estrictamente "UNIVERSIDAD".
      * ESTADO CIVIL: ¡CRÍTICO! 
        REGLA: Si el documento menciona "VIUDO" o "VIUDA", DEBES colocar estrictamente "CASADO". Otros valores: SOLTERO, CASADO, UNION LIBRE.
      * OCUPACIÓN: Extrae el cargo o puesto laboral.
    
    INSTRUCCIONES CRÍTICAS PARA DEUDAS:
    - ANALIZA LA TABLA DE "DEUDAS NEGOCIADAS".
    - EXTRAE ABSOLUTAMENTE TODAS LAS FILAS. NO IMPORTA SI SON 1, 19, O 50.
    - El array "bancos" debe contener cada registro con Acreedor, Crédito y Monto.
    
    INSTRUCCIONES FINANCIERAS:
    - Genera montos en letra en MAYÚSCULAS con formato legal: "X MIL X PESOS 00/100 M.N.".
    
    REGLAS DE FORMATO:
    - MONTOS: Formato "15,000.00" (numérico, sin $).
    - FECHAS: Formato DD/MM/AAAA.
    - SEXO: MASCULINO o FEMENINO.
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
