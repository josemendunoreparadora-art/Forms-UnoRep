
import React from 'react';

interface FileUploadProps {
  label: string;
  description: string;
  onFileSelect: (base64: string, mimeType: string, name: string) => void;
  icon: string;
  hasFile: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, description, onFileSelect, icon, hasFile }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onFileSelect(base64, file.type, file.name);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className={`relative group border-[4px] border-dashed rounded-[48px] p-16 transition-all duration-500 ${
      hasFile 
        ? 'border-black bg-slate-50 shadow-inner' 
        : 'border-slate-100 hover:border-[#D4AF37] hover:bg-white hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)]'
    }`}>
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 text-4xl transition-all duration-700 ${
          hasFile 
            ? 'bg-black text-[#D4AF37] scale-110 shadow-2xl' 
            : 'bg-slate-50 text-slate-300 group-hover:text-black group-hover:bg-[#D4AF37] group-hover:rotate-6'
        }`}>
          {icon}
        </div>
        <h3 className={`text-2xl font-black uppercase tracking-tighter transition-colors duration-500 ${
          hasFile ? 'text-black' : 'text-slate-400'
        }`}>{label}</h3>
        <p className="text-xs text-slate-400 font-bold mt-3 leading-relaxed max-w-[240px] uppercase tracking-widest">{description}</p>
        
        {hasFile && (
          <div className="mt-10 flex items-center gap-3 bg-black text-[#D4AF37] px-6 py-2.5 rounded-full border border-[#D4AF37]/30 shadow-2xl animate-bounce">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full shadow-[0_0_10px_#D4AF37]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando Expediente...</span>
          </div>
        )}
      </div>
    </div>
  );
};
