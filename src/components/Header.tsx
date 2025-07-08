import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  logoSrc?: string;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, showBack = true, logoSrc = '/logo.svg', rightContent }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 w-full">
      <div className="mx-auto px-8 flex items-center h-16 gap-4 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {showBack && (
            <button
              onClick={onBack ? onBack : () => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-2 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <img src={logoSrc} alt="Logo" className="h-auto w-24 mr-3 select-none" />
          <span className="text-xl font-bold text-gray-900 truncate">{title}</span>
        </div>
        {rightContent && (
          <div className="flex items-center gap-2">{rightContent}</div>
        )}
      </div>
    </header>
  );
};

export default Header; 