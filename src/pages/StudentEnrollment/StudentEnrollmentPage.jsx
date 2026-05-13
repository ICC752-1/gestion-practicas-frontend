import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Building2, 
  UserRound, 
  ClipboardList,
  Calendar,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";

const STEPS = [
  { id: 1, label: "Información personal", icon: <User size={24} /> },
  { id: 2, label: "Información de la Organización", icon: <Building2 size={24} /> },
  { id: 3, label: "Información del Supervisor/a", icon: <UserRound size={24} /> },
  { id: 4, label: "Detalles de la práctica", icon: <Calendar size={24} /> },
  { id: 5, label: "Actividades a Realizar", icon: <ClipboardList size={24} /> },
];

export const StudentEnrollmentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    matricula: "123456789YY",
    codigoCarrera: "3095",
    carrera: "",
    nombre: "María Gómez",
    genero: "",
    // Step 2
    organizacion: "",
    rubro: "",
    direccion: "",
    telefono: "",
    web: "",
    // Step 3
    nombreSupervisor: "",
    profesionSupervisor: "",
    cargoSupervisor: "",
    departamentoSupervisor: "",
    emailSupervisor: "",
    telefonoSupervisor: "",
    // Step 4
    tipoPractica: "",
    fechaInicio: "",
    fechaTermino: "",
    diasSemana: [],
    horaInicio: "",
    horaTermino: "",
    direccionPractica: "",
    region: "",
    comuna: "",
    // Step 5
    actividades: "",
    beneficios: [],
    cantidadDinero: ""
  });

  const [isFinished, setIsFinished] = useState(false);

  const nextStep = () => {
    if (currentStep === STEPS.length) {
      setIsFinished(true);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  let mainContent;

  if (isFinished) {
    mainContent = (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl mx-auto py-24 px-6 text-center space-y-8 w-full"
      >
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-gray-50 flex flex-col items-center">
          <div className="bg-green-100 text-green-600 w-32 h-32 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¡Práctica inscrita con éxito!</h2>
          <p className="text-xl text-gray-500 max-w-lg mx-auto">
            Tu solicitud de práctica ha sido enviada correctamente. El coordinador revisará la información y recibirás una notificación pronto.
          </p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="mt-12 bg-brand-medium text-white px-12 py-4 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all shadow-lg cursor-pointer"
          >
            Volver al Panel Principal
          </button>
        </div>
      </motion.div>
    );
  } else {
    mainContent = (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-7xl mx-auto py-12 px-6 space-y-12 w-full"
      >
        {/* Stepper */}
        <div className="flex justify-between items-start relative max-w-5xl mx-auto">
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`flex flex-col items-center gap-4 group transition-opacity ${step.id <= currentStep ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center transition-all ${
                currentStep === step.id 
                  ? 'bg-white border-brand-medium text-brand-medium shadow-lg scale-110' 
                  : currentStep > step.id 
                  ? 'bg-brand-medium border-brand-medium text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {step.icon}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-center max-w-[100px] leading-tight ${
                currentStep === step.id ? 'text-brand-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-pink-50/50 border border-pink-100 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8">
                  <div className="flex items-center gap-4 text-brand-medium">
                    <div className="bg-white p-3 rounded-2xl shadow-sm">
                      <User size={32} />
                    </div>
                    <h3 className="text-xl font-bold">Información Personal</h3>
                  </div>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Complete sus datos personales y de contacto. Esta información será utilizada para comunicarnos con usted durante el periodo de práctica.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        "Verifique que su correo está actualizado",
                        "Use su correo institucional (@ufromail.cl)",
                        "Asegurese de tener un número de contacto válido"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium italic">
                          <CheckCircle2 size={16} className="text-brand-medium shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">Información del estudiante</h2>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Matricula</label>
                      <input type="text" value={formData.matricula} readOnly className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white text-lg text-gray-400 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Código de la carrera</label>
                      <input type="text" value={formData.codigoCarrera} readOnly className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-lg text-gray-400 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione su carrera</label>
                      <div className="relative">
                        <select 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg appearance-none bg-white cursor-pointer"
                          value={formData.carrera}
                          onChange={(e) => setFormData({...formData, carrera: e.target.value})}
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="civil_informatica">Ingeniería Civil Informática</option>
                          <option value="civil_industrial">Ingeniería Civil Industrial</option>
                          <option value="civil_mecanica">Ingeniería Civil Mecánica</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 text-gray-400"><ChevronRight size={24} /></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Nombre y apellido</label>
                      <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Género con el que se identifica</label>
                      <div className="relative">
                        <select 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg appearance-none bg-white cursor-pointer"
                          value={formData.genero}
                          onChange={(e) => setFormData({...formData, genero: e.target.value})}
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro / Prefiero no decir</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 text-gray-400"><ChevronRight size={24} /></div>
                      </div>
                    </div>
                    <div className="pt-6">
                      <button onClick={nextStep} className="w-full bg-brand-medium text-white py-4 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all transform hover:scale-[1.02] shadow-lg cursor-pointer">Siguiente</button>
                      <button onClick={() => navigate("/dashboard")} className="w-full mt-4 text-brand-medium font-bold text-lg hover:underline transition-colors cursor-pointer">Cancelar y Volver</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-pink-50/50 border border-pink-100 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8">
                  <div className="flex items-center gap-4 text-brand-medium">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-medium/10">
                      <Building2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold">Información de la Organización</h3>
                  </div>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      Ingrese los datos de la organización donde realizará su práctica profesional y del supervisor que lo acompañará durante el proceso.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-bold italic">
                      <CheckCircle2 size={16} className="text-brand-medium shrink-0" />
                      Verifique la dirección completa de la empresa
                    </div>
                  </div>
                </div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">Información de la organización</h2>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Organización</label>
                      <input type="text" placeholder="Nombre Organización S.A" value={formData.organizacion} onChange={(e) => setFormData({...formData, organizacion: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Rubro</label>
                      <input type="text" placeholder="Rubro en que opera la empresa" value={formData.rubro} onChange={(e) => setFormData({...formData, rubro: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Dirección casa matriz</label>
                      <input type="text" placeholder="Av. Francisco Salazar 01145, Temuco..." value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Teléfono</label>
                      <input type="tel" placeholder="123456789" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Página web</label>
                      <input type="url" placeholder="https://fica.ufro.cl/" value={formData.web} onChange={(e) => setFormData({...formData, web: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <button onClick={prevStep} className="w-full bg-brand-medium/10 text-brand-medium py-3 rounded-2xl font-bold text-xl hover:bg-brand-medium hover:text-white transition-all shadow-sm cursor-pointer">Anterior</button>
                      <button onClick={nextStep} className="w-full bg-brand-medium text-white py-3 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all shadow-lg cursor-pointer">Siguiente</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-pink-50/50 border border-pink-100 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8">
                  <div className="flex items-center gap-4 text-brand-medium">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-medium/10">
                      <UserRound size={32} />
                    </div>
                    <h3 className="text-xl font-bold">Información del supervisor/a</h3>
                  </div>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      Especifique las fechas, horarios y actividades que realizará durante su práctica I o II.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-bold italic">
                      <CheckCircle2 size={16} className="text-brand-medium shrink-0" />
                      El email del supervisor será el medio por donde se le contactará directamente
                    </div>
                  </div>
                </div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">Información del supervisor/a</h2>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese nombre completo del Supervisor de Práctica</label>
                      <input type="text" placeholder="Nombre supervisor/a" value={formData.nombreSupervisor} onChange={(e) => setFormData({...formData, nombreSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese profesión del Supervisor de Práctica</label>
                      <input type="text" placeholder="Profesión supervisor/a" value={formData.profesionSupervisor} onChange={(e) => setFormData({...formData, profesionSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese cargo del Supervisor de Práctica</label>
                      <input type="text" placeholder="Cargo supervisor/a" value={formData.cargoSupervisor} onChange={(e) => setFormData({...formData, cargoSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Departamento o Sección donde se desempeña el Supervisor de Práctica</label>
                      <input type="text" placeholder="Departamento Supervisor/a" value={formData.departamentoSupervisor} onChange={(e) => setFormData({...formData, departamentoSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese correo electrónico del Supervisor de Práctica</label>
                      <input type="email" placeholder="Correo electrónico supervisor/a" value={formData.emailSupervisor} onChange={(e) => setFormData({...formData, emailSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese número de teléfono del Supervisor de Práctica</label>
                      <input type="tel" placeholder="Número de teléfono supervisor/a" value={formData.telefonoSupervisor} onChange={(e) => setFormData({...formData, telefonoSupervisor: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" />
                    </div>
                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <button type="button" onClick={prevStep} className="w-full bg-brand-medium/10 text-brand-medium py-3 rounded-2xl font-bold text-xl hover:bg-brand-medium hover:text-white transition-all shadow-sm cursor-pointer">Anterior</button>
                      <button type="button" onClick={nextStep} className="w-full bg-brand-medium text-white py-3 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all shadow-lg cursor-pointer">Siguiente</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-pink-50/50 border border-pink-100 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8">
                  <div className="flex items-center gap-4 text-brand-medium">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-medium/10">
                      <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold">Detalles de la Práctica</h3>
                  </div>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      Especifique las fechas, horarios y actividades que realizará durante su práctica I o II.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Duración practica I : 176 horas",
                        "Duración practica II : 168 horas",
                        "Considere el formato 24 horas"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-bold italic">
                          <CheckCircle2 size={16} className="text-brand-medium shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">Información de la Práctica</h2>
                  
                  <div className="space-y-10">
                    {/* Tipo de Práctica */}
                    <div className="space-y-4">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione el tipo de práctica que realizará</label>
                      <div className="grid grid-cols-1 gap-4">
                        {["Presencial", "Virtual"].map((tipo) => (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => setFormData({...formData, tipoPractica: tipo.toLowerCase()})}
                            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                              formData.tipoPractica === tipo.toLowerCase()
                                ? "border-brand-medium bg-brand-medium/5 ring-1 ring-brand-medium"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              formData.tipoPractica === tipo.toLowerCase() ? "border-brand-medium bg-brand-medium" : "border-gray-300"
                            }`}>
                              {formData.tipoPractica === tipo.toLowerCase() && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <span className={`text-xl font-medium ${formData.tipoPractica === tipo.toLowerCase() ? "text-brand-medium" : "text-gray-400"}`}>
                              {tipo}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese fecha de inicio de la Práctica</label>
                        <input 
                          type="date" 
                          value={formData.fechaInicio} 
                          onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})} 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg uppercase" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese fecha de término de la Práctica</label>
                        <input 
                          type="date" 
                          value={formData.fechaTermino} 
                          onChange={(e) => setFormData({...formData, fechaTermino: e.target.value})} 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg uppercase" 
                        />
                      </div>
                    </div>

                    {/* Días Senana */}
                    <div className="space-y-4">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione los días regulares de la semana en que realizará su práctica</label>
                      <div className="grid grid-cols-1 gap-3">
                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => {
                          const isSelected = formData.diasSemana.includes(dia);
                          return (
                            <button
                              key={dia}
                              type="button"
                              onClick={() => {
                                const newDias = isSelected 
                                  ? formData.diasSemana.filter(d => d !== dia)
                                  : [...formData.diasSemana, dia];
                                setFormData({...formData, diasSemana: newDias});
                              }}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-brand-medium bg-brand-medium/5 ring-1 ring-brand-medium"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-brand-medium bg-brand-medium" : "border-gray-300"
                              }`}>
                                {isSelected && <CheckCircle2 size={16} className="text-white" />}
                              </div>
                              <span className={`text-xl font-medium ${isSelected ? "text-brand-medium" : "text-gray-400"}`}>
                                {dia}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horarios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Hora de inicio jornada de práctica</label>
                        <input 
                          type="time" 
                          value={formData.horaInicio} 
                          onChange={(e) => setFormData({...formData, horaInicio: e.target.value})} 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Hora de término jornada de práctica</label>
                        <input 
                          type="time" 
                          value={formData.horaTermino} 
                          onChange={(e) => setFormData({...formData, horaTermino: e.target.value})} 
                          className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" 
                        />
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese la dirección donde realizará su Práctica</label>
                      <input 
                        type="text" 
                        placeholder="Calle y número. Ej. Av. francia 01145" 
                        value={formData.direccionPractica} 
                        onChange={(e) => setFormData({...formData, direccionPractica: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" 
                      />
                    </div>

                    {/* Región y Comuna */}
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione la región donde realizará su Práctica</label>
                        <div className="relative">
                          <select 
                            className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg appearance-none bg-white cursor-pointer"
                            value={formData.region}
                            onChange={(e) => setFormData({...formData, region: e.target.value})}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="araucania">Región de La Araucanía</option>
                            <option value="metropolitana">Región Metropolitana</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 text-gray-400"><ChevronRight size={24} /></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione la comuna donde realizará su Práctica</label>
                        <div className="relative">
                          <select 
                            className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg appearance-none bg-white cursor-pointer"
                            value={formData.comuna}
                            onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="temuco">Temuco</option>
                            <option value="santiago">Santiago</option>
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none rotate-90 text-gray-400"><ChevronRight size={24} /></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <button type="button" onClick={prevStep} className="w-full bg-brand-medium/10 text-brand-medium py-3 rounded-2xl font-bold text-xl hover:bg-brand-medium hover:text-white transition-all shadow-sm cursor-pointer">Anterior</button>
                      <button type="button" onClick={nextStep} className="w-full bg-brand-medium text-white py-3 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all shadow-lg cursor-pointer">Siguiente</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div 
                key="step5"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-pink-50/50 border border-pink-100 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8">
                  <div className="flex items-center gap-4 text-brand-medium">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-medium/10">
                      <ClipboardList size={32} />
                    </div>
                    <h3 className="text-xl font-bold leading-tight">Actividades a Realizar y Beneficios de la organización</h3>
                  </div>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      Complete la información de manera clara y precisa. Estos antecedentes serán utilizados para validar la práctica.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Marque solo beneficios confirmados",
                        "Ingrese $0 si no existe ayuda económica"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-bold italic">
                          <CheckCircle2 size={16} className="text-brand-medium shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50">
                  <h2 className="text-3xl font-bold text-gray-900 mb-10 leading-tight">Actividades a Realizar y Beneficios de la organización</h2>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Mencione las principales actividades a realizar en su práctica</label>
                      <textarea 
                        placeholder="Recuerde que las actividades a realizar deben tributar a los resultados de aprendizaje del programa de asignatura de su práctica"
                        value={formData.actividades} 
                        onChange={(e) => setFormData({...formData, actividades: e.target.value})} 
                        className="w-full px-6 py-6 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg min-h-[200px] resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Seleccione el o los beneficios que se le entregarán por parte de la Organización (sólo si los hay)</label>
                      <div className="grid grid-cols-1 gap-3">
                        {["Bono locomoción", "Movilización organización", "Bono colación", "Colación organización", "Bono alojamiento", "Ayuda económica"].map((beneficio) => {
                          const isSelected = formData.beneficios.includes(beneficio);
                          return (
                            <button
                              key={beneficio}
                              type="button"
                              onClick={() => {
                                const newBeneficios = isSelected 
                                  ? formData.beneficios.filter(b => b !== beneficio)
                                  : [...formData.beneficios, beneficio];
                                setFormData({...formData, beneficios: newBeneficios});
                              }}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-brand-medium bg-brand-medium/5 ring-1 ring-brand-medium"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-brand-medium bg-brand-medium" : "border-gray-300"
                              }`}>
                                {isSelected && <CheckCircle2 size={16} className="text-white" />}
                              </div>
                              <span className={`text-xl font-medium ${isSelected ? "text-brand-medium" : "text-gray-400"}`}>
                                {beneficio}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xl font-bold text-gray-900 block ml-1">Ingrese una cantidad de dinero</label>
                      <input 
                        type="text" 
                        placeholder="$XYZ" 
                        value={formData.cantidadDinero} 
                        onChange={(e) => setFormData({...formData, cantidadDinero: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-medium text-lg" 
                      />
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <button type="button" onClick={prevStep} className="w-full bg-brand-medium/10 text-brand-medium py-3 rounded-2xl font-bold text-xl hover:bg-brand-medium hover:text-white transition-all shadow-sm cursor-pointer">Anterior</button>
                      <button type="button" onClick={nextStep} className="w-full bg-brand-medium text-white py-3 rounded-2xl font-bold text-xl hover:bg-brand-dark transition-all shadow-lg cursor-pointer">Finalizar</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col relative overflow-x-hidden">
      <UserHeader />
      <main className="flex-grow flex flex-col w-full">
        {mainContent}
      </main>
      <Footer />
    </div>
  );
};

export default StudentEnrollmentPage;
