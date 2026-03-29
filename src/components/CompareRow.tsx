import { ReactNode } from 'react';
import { School } from '@/types/school';

interface CompareRowProps {
  label: string;
  schools: School[];
  getValue: (school: School) => string | ReactNode;
}

const CompareRow: React.FC<CompareRowProps> = ({ label, schools, getValue }) => {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm font-medium text-gray-700 text-left w-32">
        {label}
      </td>
      {schools.map((school) => (
        <td key={school.basic.id} className="px-4 py-3 text-sm text-gray-600">
          {getValue(school)}
        </td>
      ))}
    </tr>
  );
};

export default CompareRow;
