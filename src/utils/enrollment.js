export const MIN_ADMISSION_YEAR = 2015;

export const cleanEnrollment = (value) => String(value || '').replace(/\D/g, '');

const calculateRutVerifier = (number) => {
  let total = 0;
  let multiplier = 2;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    total += Number(number[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (total % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
};

const formatNumericRut = (rutDigits) => {
  if (rutDigits.length < 2) return '';

  const number = rutDigits.slice(0, -1).replace(/^0+/, '');
  const verifier = rutDigits.slice(-1);
  if (!number) return '';

  return `${Number(number).toLocaleString('es-CL')}-${verifier}`;
};

export const analyzeEnrollment = (value) => {
  const enrollment = cleanEnrollment(value);
  const hasYear = enrollment.length >= 2;
  const rutDigits = hasYear ? enrollment.slice(0, -2) : '';
  const admissionYear = hasYear
    ? 2000 + Number(enrollment.slice(-2))
    : null;
  const rutNumber = rutDigits.slice(0, -1).replace(/^0+/, '');
  const rutVerifier = rutDigits.slice(-1);
  const isRutValid = Boolean(rutNumber)
    && /^\d+$/.test(rutNumber)
    && calculateRutVerifier(rutNumber) === rutVerifier;
  const isAdmissionYearValid = admissionYear !== null
    && admissionYear >= MIN_ADMISSION_YEAR;

  return {
    enrollment,
    rut: formatNumericRut(rutDigits),
    admissionYear,
    isRutValid,
    isAdmissionYearValid,
    isValid: Boolean(enrollment) && isRutValid && isAdmissionYearValid,
  };
};

export const getEnrollmentError = (value) => {
  const details = analyzeEnrollment(value);

  if (!details.enrollment) {
    return 'Ingresa la matrícula del estudiante.';
  }
  if (details.enrollment.length < 4) {
    return 'La matrícula está incompleta.';
  }
  if (!details.isRutValid) {
    return 'El RUT contenido en la matrícula no es válido.';
  }
  if (!details.isAdmissionYearValid) {
    return `El año de ingreso no puede ser anterior a ${MIN_ADMISSION_YEAR}.`;
  }

  return '';
};
