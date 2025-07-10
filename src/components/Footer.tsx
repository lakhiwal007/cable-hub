import React from "react";

const navLinks = [
  { name: "Dashboard", to: "/" },
  { name: "Marketplace", to: "/marketplace" },
  { name: "Pricing", to: "/pricing" },
  { name: "Privacy Policy", to: "/privacy-policy" },
  { name: "Terms & Conditions", to: "/terms" },
];

const Footer = () => (
  <footer className="w-full bg-gray-50 border-t border-gray-200 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 text-sm">
      {/* Logo and Brand */}
      <div className="flex flex-col items-center md:items-start gap-2">
        <img src="/cableCartLogo.png" alt="Cable Hub Logo" className="h-20 w-auto" />
      </div>
      {/* Navigation Links */}
      <nav className="flex flex-col items-center md:items-start gap-2">
        {navLinks.map(link => (
          <a key={link.name} href={link.to} className="hover:text-blue-600 transition-colors font-medium">
            {link.name}
          </a>
        ))}
        
      </nav>
      {/* Company Info */}
      <div className="flex flex-col items-center md:items-start gap-2 text-sm text-gray-500 min-w-[180px]">
        <span className="font-semibold text-gray-700">Cable Kart Connect Pvt. Ltd.</span>
        <span>123 Industrial Park, Sector 45</span>
        <span>New Delhi, India 110001</span>
        <span>Email: <a href="mailto:info@cablehub.com" className="text-blue-600 hover:underline">info@cablehub.com</a></span>
        <span>Phone: <a href="tel:+911234567890" className="text-blue-600 hover:underline">+91 12345 67890</a></span>
      </div>
      {/* Play Store QR */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400">Download App</span>
        <img src="/placeholder.svg" alt="Play Store APK QR" className="h-20 w-20 bg-white rounded p-1 border border-gray-200" />
        
      </div>
      
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-6 text-center text-xs text-gray-400">
      &copy; {new Date().getFullYear()} Cable Hub Connect. All rights reserved. Made with <span className="text-red-500">♥</span> for the cable industry.
    </div>
  </footer>
);

export default Footer; 