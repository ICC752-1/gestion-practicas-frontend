import { useState } from "react";
import { UserHeader } from "../../components/Header/UserHeader";
import { RegistrationStepper } from "../../components/Registration/RegistrationStepper";
import { StudentInfoForm } from "../../components/Registration/StudentInfoForm";
import { OrganizationInfoForm } from "../../components/Registration/OrganizationInfoForm";
import { SupervisorInfoForm } from "../../components/Registration/SupervisorInfoForm";
import { PracticeDetailsForm } from "../../components/Registration/PracticeDetailsForm";
import { ActivitiesForm } from "../../components/Registration/ActivitiesForm";
import { RegistrationSuccess } from "../../components/Registration/RegistrationSuccess";
import { RegistrationInfoCard } from "../../components/Registration/RegistrationInfoCard";
import { Footer } from "../../components/Footer/Footer";
import { User, Building2, UserRound, ClipboardList, FileText } from "lucide-react";
import api from "../../services/api";

export const RegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [internshipResult, setInternshipResult] = useState(null);

  const handleNext = async (stepData) => {
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    if (currentStep === 5) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = {
          // Paso 2 - Organización
          org_name:   updatedFormData.org_name,
          sector:     updatedFormData.sector,
          address:    updatedFormData.address,
          city:       updatedFormData.city,
          org_phone:  updatedFormData.org_phone,
          web:        updatedFormData.web,

          // Paso 3 - Supervisor
          supervisor_name:       updatedFormData.supervisorName,
          supervisor_profession: updatedFormData.supervisorProfession,
          supervisor_position:   updatedFormData.supervisorPosition,
          supervisor_department: updatedFormData.supervisorDepartment,
          supervisor_email:      updatedFormData.supervisorEmail,
          supervisor_phone:      updatedFormData.supervisorPhone,

          // Paso 4 - Detalles práctica
          start_date:          updatedFormData.startDate,
          end_date:            updatedFormData.endDate,
          schedule:            `${updatedFormData.startTime} - ${updatedFormData.endTime}`,
          days:                updatedFormData.days.join(", "),
          modality:            updatedFormData.practiceType,
          internship_address:  updatedFormData.internship_address,

          // Paso 5 - Actividades
          act_description: updatedFormData.act_description,
          ben_description: Array.isArray(updatedFormData.ben_description)
                            ? updatedFormData.ben_description.join(", ")
                            : updatedFormData.ben_description,
          amount: Number(updatedFormData.amount) || 0,

          // Campos del paso 1 (estudiante y práctica)
          internship_period:     updatedFormData.internship_period,
          internship_type:       updatedFormData.internship_type,
          // Para períodos estivales (Verano/Invierno) el backend exige has_school_insurance=true
          // Para Semestre se envía true por defecto ya que el checkbox no se muestra
          has_school_insurance: (updatedFormData.internship_period === 'Semestre')
            ? true
            : (updatedFormData.has_school_insurance ?? true),
        };

        console.log("Payload enviado:", JSON.stringify(payload, null, 2));

        const response = await api.post("/internships", payload);
        
        // Guardar resultado para mostrar en página de éxito
        const result = response.data;
        setInternshipResult(result);
        setIsFinished(true);

      } catch (err) {
        console.error("Error de red:", err);
        console.error("Error completo:", err.response?.data || err);

        if (!err.response) {
          setSubmitError("No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.");
        } else {
          const status = err.response.status;
          const errorData = err.response.data;

          if (status === 400) {
            setSubmitError("Error en los datos enviados. Verifica que todos los campos sean correctos.");
          } else if (status === 401) {
            setSubmitError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else if (status === 422) {
            // Error de validación del backend - mostrar detalles si están disponibles
            const detail = errorData?.detail;
            if (Array.isArray(detail)) {
              const messages = detail.map(d => d.msg).join(", ");
              setSubmitError(`Error de validación: ${messages}`);
            } else {
              setSubmitError("Error de validación. Revisa los campos e intenta nuevamente.");
            }
          } else if (status === 500) {
            setSubmitError("Error interno del servidor. Por favor, intenta más tarde.");
          } else {
            setSubmitError("Hubo un error al registrar la práctica. Por favor, intenta nuevamente.");
          }
        }
        setIsSubmitting(false);
        return;
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }

    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const getStepConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Información Personal",
          description: "Complete sus datos personales y de contacto. Esta información será utilizada para comunicarnos con usted durante el periodo de práctica.",
          icon: User,
          checklist: [
            "Verifique que su correo está actualizado",
            "Use su correo institucional (@ufromail.cl)"
          ],
          form: <StudentInfoForm onNext={handleNext} initialData={formData} />
        };
      case 2:
        return {
          title: "Información de la Organización",
          description: "Ingrese los datos de la organización donde realizará su práctica profesional.",
          icon: Building2,
          checklist: [
            "Verifique la dirección completa de la empresa",
            "Asegúrese de que la información sea precisa para evitar inconvenientes durante el proceso de validación"
          ],
          form: <OrganizationInfoForm onNext={handleNext} onBack={handleBack} initialData={formData} />
        };
      case 3:
        return {
          title: "Información del supervisor/a",
          description: "Especifique las datos del supervisor/a que estará a cargo de su práctica.",
          icon: UserRound,
          checklist: [
            "El email del supervisor será el medio por donde se le contactará directamente",
            "Asegúrese de los datos del supervisor estén completos y sin errores"
          ],
          form: <SupervisorInfoForm onNext={handleNext} onBack={handleBack} initialData={formData} />
        };
      case 4:
        return {
          title: "Detalles de la Práctica",
          description: "Especifique las fechas, horarios y actividades que realizará durante su práctica I o II",
          icon: ClipboardList,
          checklist: [
            "Duración practica I : 176 horas",
            "Duración practica II : 168 horas",
            "Considere el formato 24 horas"
          ],
          form: <PracticeDetailsForm onNext={handleNext} onBack={handleBack} initialData={formData} />
        };
      case 5:
        return {
          title: "Actividades a Realizar y Beneficios de la organización",
          description: "Complete la información de manera clara y precisa. Estos antecedentes serán utilizados para validar la práctica.",
          icon: FileText,
          checklist: [
            "Marque solo beneficios confirmados",
            "Ingrese $0 si no existe ayuda económica"
          ],
          form: <ActivitiesForm onNext={handleNext} onBack={handleBack} initialData={formData} />
        };
      default:
        return {
          title: "Información del Proceso",
          description: "Complete los datos solicitados para continuar.",
          icon: User,
          checklist: [],
          form: null
        };
    }
  };

  const stepConfig = getStepConfig();

  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col font-sans">
      <UserHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-[20px] p-6 max-w-[600px] mx-auto">
            <p className="text-red-700 font-bold text-lg mb-2">Error al registrar</p>
            <p className="text-red-600">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="mt-4 text-red-700 font-semibold hover:underline"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!isFinished && (
          <>
            {/* Stepper Section */}
            <RegistrationStepper currentStep={currentStep} />

            {/* Content Section */}
            <div className="flex flex-col items-center gap-12 mt-4 pb-16">
              {/* Top: Info Card */}
              <div className="w-full flex justify-center">
                <RegistrationInfoCard 
                  title={stepConfig.title}
                  description={stepConfig.description}
                  icon={stepConfig.icon}
                  checklist={stepConfig.checklist}
                />
              </div>

              {/* Bottom: Main Form */}
              <div className="w-full flex justify-center">
                {stepConfig.form}
              </div>
            </div>
          </>
        )}

        {isFinished && internshipResult ? (
          <div className="flex justify-center py-12">
            <RegistrationSuccess 
              internshipId={internshipResult.id}
              uploadDate={internshipResult.created_at}
              status="Pendiente de revisión"
              internshipData={internshipResult}
            />
          </div>
        ) : isFinished ? (
          <div className="flex justify-center py-12">
            <RegistrationSuccess />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationPage;


