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
import { useToast } from "../../context/useToast";
import { internshipService } from "../../services/internshipService";

const FIELD_LABELS = {
  org_name: "Nombre de la organización",
  sector: "Rubro de la organización",
  address: "Dirección de la organización",
  city: "Ciudad",
  org_phone: "Teléfono de la organización",
  web: "Página web",
  supervisor_name: "Nombre del supervisor/a",
  supervisor_profession: "Profesión del supervisor/a",
  supervisor_position: "Cargo del supervisor/a",
  supervisor_department: "Departamento del supervisor/a",
  supervisor_email: "Correo del supervisor/a",
  supervisor_phone: "Teléfono del supervisor/a",
  start_date: "Fecha de inicio",
  end_date: "Fecha de término",
  schedule: "Horario",
  days: "Días de práctica",
  modality: "Modalidad",
  internship_address: "Dirección de la práctica",
  act_description: "Actividades a realizar",
  ben_description: "Beneficios",
  amount: "Monto de apoyo económico",
  internship_period: "Período académico",
  internship_type: "Tipo de práctica",
};

const FIELD_STEPS = {
  org_name: 2,
  sector: 2,
  address: 2,
  city: 2,
  org_phone: 2,
  web: 2,
  supervisor_name: 3,
  supervisor_profession: 3,
  supervisor_position: 3,
  supervisor_department: 3,
  supervisor_email: 3,
  supervisor_phone: 3,
  start_date: 4,
  end_date: 4,
  schedule: 4,
  days: 4,
  modality: 4,
  internship_address: 4,
  act_description: 5,
  ben_description: 5,
  amount: 5,
  internship_period: 1,
  internship_type: 1,
};

const getValidationField = (validationItem) => {
  const loc = validationItem?.loc;
  return Array.isArray(loc) ? loc[loc.length - 1] : null;
};

const getFriendlyValidationMessage = (validationItem) => {
  const field = getValidationField(validationItem);
  const label = FIELD_LABELS[field] || field || "Campo";

  if (field?.includes("email")) {
    return `${label}: ingresa un correo válido, por ejemplo supervisor@empresa.cl.`;
  }

  if (validationItem?.type === "missing") {
    return `${label}: este dato es obligatorio.`;
  }

  return `${label}: ${validationItem?.msg || "revisa el valor ingresado."}`;
};

const getApiValidationMessages = (detail) => {
  if (!Array.isArray(detail)) return [];
  return detail.map(getFriendlyValidationMessage);
};

const getApiErrorStep = (error) => {
  const detail = error.response?.data?.detail;
  if (!Array.isArray(detail) || detail.length === 0) return null;

  const field = getValidationField(detail[0]);
  return FIELD_STEPS[field] || null;
};

const getApiErrorMessage = (error) => {
  if (!error.response) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
  }

  const detail = error.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.code === "duplicate_internship_type") {
    return "Ya existe una solicitud vigente para este tipo de práctica. Revisa el registro existente antes de crear una nueva solicitud.";
  }
  if (detail?.message) return detail.message;
  if (Array.isArray(detail)) {
    const validationMessages = getApiValidationMessages(detail);
    return validationMessages.length > 0
      ? validationMessages.join(" ")
      : "Revisa los datos ingresados e intenta nuevamente.";
  }

  if (error.response.status === 401) {
    return "Sesión expirada. Por favor, inicia sesión nuevamente.";
  }

  if (error.response.status === 409) {
    return "La solicitud entra en conflicto con el estado actual de la práctica o sus datos.";
  }

  return "Hubo un error al registrar la práctica. Por favor, intenta nuevamente.";
};

export const RegistrationPage = () => {
  const { showToast } = useToast();
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
        };

        const result = await internshipService.createInternship(payload);
        
        // Guardar resultado para mostrar en página de éxito
        setInternshipResult(result);
        setIsFinished(true);

        showToast({
          type: "success",
          title: "Práctica registrada",
          message: "Tu solicitud fue enviada y quedó pendiente de revisión.",
        });

      } catch (err) {
        console.error("Error de red:", err);
        console.error("Error completo:", err.response?.data || err);

        if (!err.response) {
          const message = "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.";
          setSubmitError(message);
          showToast({
            type: "error",
            title: "No se pudo enviar la solicitud",
            message,
            duration: 8000,
          });
        } else {
          const status = err.response.status;

          if (status === 401) {
            setSubmitError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else {
            const message = getApiErrorMessage(err);
            const targetStep = getApiErrorStep(err);

            setSubmitError(message);
            if (targetStep) {
              setCurrentStep(targetStep);
            }
            showToast({
              type: "error",
              title: status === 422 ? "Revisa los datos de la solicitud" : "No se pudo enviar la solicitud",
              message,
              duration: 9000,
            });
          }
        }
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } else {
      setSubmitError(null);
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
          form: <ActivitiesForm onNext={handleNext} onBack={handleBack} initialData={formData} isSubmitting={isSubmitting} />
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
