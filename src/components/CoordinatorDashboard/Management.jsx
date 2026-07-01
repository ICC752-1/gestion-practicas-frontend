import { StudentTable } from '../coordinador/StudentTable';

const Management = ({ students }) => {
  return (
    <div className="rounded-2xl border border-gray-100/50 bg-white p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
      <StudentTable students={students} />
    </div>
  );
};

export default Management;
