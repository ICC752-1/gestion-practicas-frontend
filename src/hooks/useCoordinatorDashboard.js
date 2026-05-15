import { useState } from 'react';

export const useCoordinatorDashboard = () => {
  const [students, setStudents] = useState([
    { id: '1', nombre: 'Camila Rojas', email: 'c.rojas01@ufromail.cl', carrera: 'Ingeniería Civil', empresa: 'Empresa A', estado: 'En curso' },
    { id: '2', nombre: 'Diego Valenzuela', email: 'd.valenzuela02@ufromail.cl', carrera: 'Ingeniería Informática', empresa: 'Empresa B', estado: 'Pendiente Inicio' },
    { id: '3', nombre: 'Valentina Soto', email: 'v.soto03@ufromail.cl', carrera: 'Ingeniería Civil', empresa: 'Empresa C', estado: 'Finalizada' },
    { id: '4', nombre: 'Sebastián Muñoz', email: 's.munoz04@ufromail.cl', carrera: 'Ingeniería Informática', empresa: 'Empresa D', estado: 'En curso' },
    { id: '5', nombre: 'Francisca Morales', email: 'f.morales05@ufromail.cl', carrera: 'Ingeniería Civil', empresa: 'Empresa E', estado: 'Pendiente Finalización' },
    { id: '6', nombre: 'Javiera Torres', email: 'j.torres06@ufromail.cl', carrera: 'Ingeniería Civil', empresa: 'Empresa F', estado: 'Pendiente Inicio' },
    { id: '7', nombre: 'Felipe Herrera', email: 'f.herrera07@ufromail.cl', carrera: 'Ingeniería Informática', empresa: 'Empresa G', estado: 'Pendiente Finalización' },
    { id: '8', nombre: 'Ignacio Castro', email: 'i.castro08@ufromail.cl', carrera: 'Ingeniería Civil', empresa: 'Empresa H', estado: 'En curso' },
  ]);

  const updateStudentStatus = (studentId, type, action) => {
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          if (action === 'approve') {
            return { 
              ...student, 
              estado: type === 'inicio' ? 'En curso' : 'Finalizada' 
            };
          } else {
            return { 
              ...student, 
              estado: type === 'inicio' ? 'Inicio Rechazado' : 'Finalización Rechazada' 
            };
          }
        }
        return student;
      })
    );
  };

  return {
    students,
    updateStudentStatus,
  };
};
