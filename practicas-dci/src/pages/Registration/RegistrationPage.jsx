import { UserHeader } from "../../components/Header/UserHeader";
import { RegistrationStepper } from "../../components/Registration/RegistrationStepper";
import { StudentInfoForm } from "../../components/Registration/StudentInfoForm";
import { RegistrationInfoCard } from "../../components/Registration/RegistrationInfoCard";
import { Footer } from "../../components/Footer/Footer";

export const RegistrationPage = () => {
  return (
    <div className="bg-[#f3f3f3] min-h-screen flex flex-col font-sans">
      <UserHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Stepper Section */}
        <RegistrationStepper currentStep={1} />

        {/* Content Section */}
        <div className="flex flex-col items-center gap-12 mt-4 pb-16">
          {/* Top: Info Card */}
          <div className="w-full flex justify-center">
            <RegistrationInfoCard />
          </div>

          {/* Bottom: Main Form */}
          <div className="w-full flex justify-center">
            <StudentInfoForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationPage;
