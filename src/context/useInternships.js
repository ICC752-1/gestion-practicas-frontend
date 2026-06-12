import { useContext } from 'react';
import { InternshipContext } from './internship-context';

export const useInternships = () => useContext(InternshipContext);
