import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { RatingMatrix } from '../../components/Evaluation/RatingMatrix';
import { SupervisorSection } from '../../components/Evaluation/SupervisorSection';
import { ReflectionSection } from '../../components/Evaluation/ReflectionSection';
import { EVALUATION_SECTIONS } from './constants/evaluationData';

export const SelfEvaluationPage = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    supervisorName: '',
    supervisorEmail: '',
    ratings: {},
    strengths: '',
    weaknesses: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateRating = (qid, val) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [qid]: val }
    }));
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const nextStep = () => {
    // Basic validation for Step 1
    if (step === 1) {
      if (!formData.supervisorName || !formData.supervisorEmail) {
        alert('Por favor complete la información del supervisor.');
        return;
      }
      
      if (!validateEmail(formData.supervisorEmail)) {
        alert('Por favor ingrese un correo electrónico válido.');
        return;
      }

      // Check if all ratings for step 1 are filled
      const step1Questions = EVALUATION_SECTIONS.filter(s => s.step === 1).flatMap(s => s.questions);
      const allRated = step1Questions.every(q => formData.ratings[q.id]);
      if (!allRated) {
        alert('Por favor complete todas las evaluaciones de la primera sección.');
        return;
      }
    }
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    // Check if all ratings for step 2 are filled
    const step2Questions = EVALUATION_SECTIONS.filter(s => s.step === 2).flatMap(s => s.questions);
    const allRated = step2Questions.every(q => formData.ratings[q.id]);
    if (!allRated || !formData.strengths) {
      alert('Por favor complete todas las evaluaciones y mencione sus fortalezas.');
      return;
    }
    
    console.log('Enviando datos:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <UserHeader />
        <main className="flex-grow flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Autoevaluación Enviada!</h2>
            <p className="text-gray-500 mb-8">Tus respuestas han sido registradas correctamente en el sistema.</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-4 bg-[#d22864] text-white rounded-2xl font-bold hover:bg-[#b01e52] transition-colors shadow-lg shadow-[#d22864]/20"
            >
              Volver al Dashboard
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <UserHeader />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 text-[#d22864] font-bold text-sm uppercase tracking-widest mb-4">
            <span className="bg-[#d22864] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
              {step}
            </span>
            Paso {step} de 2
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
            {step === 1 ? 'Autoevaluación de Práctica I' : 'Reflexión y Ética'}
          </h2>
          <p className="text-gray-500 mt-4 text-lg">
            {step === 1 
              ? 'Complete la información de su supervisor y evalúe sus competencias transversales.' 
              : 'Evalúe su compromiso ético y reflexione sobre su desempeño general.'}
          </p>
        </header>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-12 overflow-hidden">
          <motion.div 
            className="h-full bg-[#d22864]"
            initial={{ width: '0%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {step === 1 ? (
              <>
                <SupervisorSection 
                  data={formData} 
                  onChange={handleInputChange} 
                />
                
                <div className="space-y-6">
                  {EVALUATION_SECTIONS.filter(s => s.step === 1).map(section => (
                    <RatingMatrix 
                      key={section.id}
                      title={section.title}
                      questions={section.questions}
                      currentRatings={formData.ratings}
                      onRate={updateRating}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  {EVALUATION_SECTIONS.filter(s => s.step === 2).map(section => (
                    <RatingMatrix 
                      key={section.id}
                      title={section.title}
                      questions={section.questions}
                      currentRatings={formData.ratings}
                      onRate={updateRating}
                    />
                  ))}
                </div>
                <ReflectionSection 
                  data={formData} 
                  onChange={handleInputChange} 
                />
              </>
            )}

            <footer className="flex justify-between items-center mt-16 pt-10 border-t border-gray-200">
              {step > 1 ? (
                <button 
                  onClick={prevStep}
                  className="flex items-center gap-2 px-8 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-10 py-4 bg-[#d22864] text-white font-bold rounded-2xl hover:bg-[#b01e52] transition-all shadow-lg shadow-[#d22864]/20 group"
                >
                  Siguiente paso
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                >
                  <CheckCircle size={20} />
                  Finalizar Evaluación
                </button>
              )}
            </footer>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};
