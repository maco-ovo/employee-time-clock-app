import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
     <LogOut className="w-5 h-5" />
    </button>
  );
}
