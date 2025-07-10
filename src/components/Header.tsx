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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14 sm:h-16 gap-2 sm:gap-4 justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {showBack && (
            <button
              onClick={onBack ? onBack : () => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-1 sm:mr-2 transition-colors p-1"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Go to Home"
          >
            <img src={logoSrc} alt="Logo" className="h-auto w-16 sm:w-20 lg:w-24 select-none" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</span>
          </button>
        </div>
        {rightContent && (
          <div className="flex items-center gap-1 sm:gap-2">{rightContent}</div>
        )}
      </div>
    </header>
  );
};

export default Header; 