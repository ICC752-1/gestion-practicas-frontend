import { UserHeader } from "../../components/Header/UserHeader";
import { Footer } from "../../components/Footer/Footer";
import { motion } from "motion/react";

export const CoordinatorDashboardPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col relative overflow-x-hidden font-sans selection:bg-brand-medium selection:text-white">
      <UserHeader userName="Coordinador FICA" userRole="Coordinador" />
      <main className="flex-grow flex flex-col w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="max-w-7xl mx-auto py-12 px-6 space-y-12 w-full flex-grow flex items-center justify-center"
        >
          <section className="flex flex-col items-center gap-6 px-12 py-16 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50 text-center max-w-2xl">
            <h1 className="text-4xl font-bold text-brand-medium">
              Panel de Coordinador
            </h1>
            <p className="text-gray-500 text-xl leading-relaxed">
              Bienvenido al panel de coordinación. Aquí podrás revisar y aprobar solicitudes de prácticas, supervisar los estados de los alumnos y generar reportes.
            </p>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
