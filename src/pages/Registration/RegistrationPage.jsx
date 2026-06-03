import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserHeader } from "../../components/Header/UserHeader";
import { RegistrationStepper } from "../../components/Registration/RegistrationStepper";
import { PracticeTypeForm } from "../../components/Registration/PracticeTypeForm";
import { StudentInfoForm } from "../../components/Registration/StudentInfoForm";
import { OrganizationInfoForm } from "../../components/Registration/OrganizationInfoForm";
import { SupervisorInfoForm } from "../../components/Registration/SupervisorInfoForm";
import { PracticeDetailsForm } from "../../components/Registration/PracticeDetailsForm";
import { ActivitiesForm } from "../../components/Registration/ActivitiesForm";
import { RegistrationSuccess } from "../../components/Registration/RegistrationSuccess";
import { RegistrationInfoCard } from "../../components/Registration/RegistrationInfoCard";
import { Footer } from "../../components/Footer/Footer";
import { User, Building2, UserRound, ClipboardList, FileText } from "lucide-react";
import { internshipService } from "../../services/internshipService";

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPracticeType, setShowPracticeType] = useState(true);
  const [formData, setFormData] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internshipResult, setInternshipResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleNext = async (stepData) => {
  
    const updatedFormData = { ...formData, ...stepData };

    const modalityMap = {
      presencial: "Presencial",
      remoto: "Remoto",
      hibrido: "Híbrido",
    };

    setFormData(updatedFormData);

    if (currentStep === 5) {
      setIsSubmitting(true);
      setSubmitError(null);
      setFieldErrors({});

      try {
        const payload = {
          // Paso Inicial - Tipo y período de práctica
          internship_type:       updatedFormData.internship_type,
          internship_period:     updatedFormData.internship_period,

          // Paso 2 - Organización
          org_name:              updatedFormData.organizationName,
          sector:                updatedFormData.sector,
          address:               updatedFormData.address,
          city:                  updatedFormData.city,
          org_phone:             updatedFormData.phone,
          web:                   updatedFormData.website,

          // Paso 3 - Supervisor
          supervisor_name:       updatedFormData.supervisorName,
          supervisor_profession: updatedFormData.supervisorProfession,
          supervisor_position:   updatedFormData.supervisorPosition,
          supervisor_department: updatedFormData.supervisorDepartment,
          supervisor_email:      updatedFormData.supervisorEmail,
          supervisor_phone:      updatedFormData.supervisorPhone,

          // Paso 4 - Detalles práctica
          start_date:            updatedFormData.startDate,
          end_date:              updatedFormData.endDate,
          schedule:              `${updatedFormData.startTime} - ${updatedFormData.endTime}`,
          days:                  updatedFormData.days?.join(", "),
          modality: modalityMap[updatedFormData.practiceType],
          internship_address:    updatedFormData.internshipAddress,

          // Paso 5 - Actividades
          act_description:       updatedFormData.activities,
          ben_description:       Array.isArray(updatedFormData.benefits)
                                   ? updatedFormData.benefits.join(", ")
                                   : updatedFormData.benefits,
          amount:                Number(updatedFormData.paymentAmount) || 0,

          has_school_insurance: true,
        };
        
        const result = await internshipService.createInternship(payload);
        

        setInternshipResult(result);
        setIsFinished(true);

      } catch (err) {
        console.log("Error completo:", err);
        console.log("err.response:", err.response);

        if (!err.response) {
          setSubmitError("No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.");
        } else {
          const status = err.response.status;

          if (status === 400) {
            const detail = err.response.data?.detail;
            if (Array.isArray(detail)) {
              const mapped = {};
              detail.forEach(({ loc, msg }) => {
                const field = loc?.[loc.length - 1];
                if (field) mapped[field] = msg;
              });
              setFieldErrors(mapped);
              setSubmitError("Por favor corrige los errores antes de continuar.");
            } else {
              setSubmitError("Datos inválidos. Revisa el formulario.");
            }
          } else if (status === 401) {
            navigate("/login");
          } else if (status === 403) {
            setSubmitError("No tiene permisos para registrar prácticas.");
          } else {
            setSubmitError("Ocurrió un error inesperado. Intenta nuevamente.");
          }
        }
      } finally {
        setIsSubmitting(false);
      }

    } else {
      setCurrentStep((prev) => prev + 1);
    }

    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmitError(null);
    setFieldErrors({});
    window.scrollTo(0, 0);
  };

  const getStepConfig = () => {
    switch (currentStep) {


      case 1:
        return {
          title: "Información Personal",
          description:
            "Complete los antecedentes iniciales y sus datos personales.",
          icon: User,
          checklist: [
            "Seleccione el tipo de práctica",
            "Verifique que su correo está actualizado",
            "Use su correo institucional (@ufromail.cl)",
          ],
          form: showPracticeType ? (
            <PracticeTypeForm
              initialData={formData}
              onBack={() => navigate('/dashboard')}
              onNext={(data) => {
                setFormData((prev) => ({ ...prev, ...data }));
                setShowPracticeType(false);
                window.scrollTo(0, 0);
              }}
            />
          ) : (
            <StudentInfoForm
              initialData={formData}
              onNext={handleNext}
              onBack={() => {
                setShowPracticeType(true);
                window.scrollTo(0, 0);
              }}
            />
          ),
        };

      case 2:
        return {
          title: "Información de la Organización",
          description: "Ingrese los datos de la organización donde realizará su práctica profesional.",
          icon: Building2,
          checklist: [
            "Verifique la dirección completa de la empresa",
            "Asegúrese de que la información sea precisa para evitar inconvenientes durante el proceso de validación",
          ],
          form: <OrganizationInfoForm onNext={handleNext} onBack={handleBack} initialData={formData} />,
        };
      case 3:
        return {
          title: "Información del supervisor/a",
          description: "Especifique las datos del supervisor/a que estará a cargo de su práctica.",
          icon: UserRound,
          checklist: [
            "El email del supervisor será el medio por donde se le contactará directamente",
            "Asegúrese de los datos del supervisor estén completos y sin errores",
          ],
          form: <SupervisorInfoForm onNext={handleNext} onBack={handleBack} initialData={formData} />,
        };
      case 4:
        return {
          title: "Detalles de la Práctica",
          description: "Especifique las fechas, horarios y actividades que realizará durante su práctica I o II",
          icon: ClipboardList,
          checklist: [
            "Duración practica I : 176 horas",
            "Duración practica II : 168 horas",
            "Considere el formato 24 horas",
          ],
          form: <PracticeDetailsForm onNext={handleNext} onBack={handleBack} initialData={formData} />,
        };
      case 5:
        return {
          title: "Actividades a Realizar y Beneficios de la organización",
          description: "Complete la información de manera clara y precisa. Estos antecedentes serán utilizados para validar la práctica.",
          icon: FileText,
          checklist: [
            "Marque solo beneficios confirmados",
            "Ingrese $0 si no existe ayuda económica",
          ],
          form: <ActivitiesForm onNext={handleNext} onBack={handleBack} initialData={formData} isSubmitting={isSubmitting} />,
        };
      default:
        return {
          title: "Información del Proceso",
          description: "Complete los datos solicitados para continuar.",
          icon: User,
          checklist: [],
          form: null,
        };
    }
  };

  const stepConfig = getStepConfig();

  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col font-sans">
      <UserHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        {!isFinished && (
          <>
            <RegistrationStepper currentStep={currentStep} />
            <div className="flex flex-col items-center gap-12 mt-4 pb-16">
              <div className="w-full flex justify-center">
                <RegistrationInfoCard
                  title={stepConfig.title}
                  description={stepConfig.description}
                  icon={stepConfig.icon}
                  checklist={stepConfig.checklist}
                />
              </div>

              {submitError && (
                <div className="w-full max-w-[650px] bg-red-50 border border-red-300 rounded-[20px] px-6 py-4 text-red-700 text-base">
                  {submitError}
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                      {Object.entries(fieldErrors).map(([field, msg]) => (
                        <li key={field}>
                          <span className="font-semibold">{field}:</span> {msg}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="w-full flex justify-center">
                {stepConfig.form}
              </div>
            </div>
          </>
        )}

        {isFinished && (
          <div className="flex justify-center py-12">
            <RegistrationSuccess
              internshipId={internshipResult?.id}
              uploadDate={internshipResult?.upload_date}
              status="Pendiente de revisión"
              internshipData={internshipResult}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationPage;