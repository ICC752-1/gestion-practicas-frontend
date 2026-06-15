import { FileSearch } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';

export const SecretaryDashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader />
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-12">
        <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0f6] text-[#d22864]">
              <FileSearch size={32} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-[#d22864]">
                Panel Secretaría
              </p>
              <h1 className="mt-2 text-3xl font-black text-gray-900">
                Expedientes documentales
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-gray-500">
                Secretaría gestiona documentos y expedientes, pero no puede aprobar,
                rechazar ni alterar el resultado académico de una práctica. El listado
                documental completo se implementará sobre los endpoints de documentos/DIRAE.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SecretaryDashboardPage;
