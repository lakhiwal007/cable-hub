import React from "react";
import Header from "@/components/Header";

const Mentor: React.FC = () => {
  const dummyMentors = [
    {
      name: "Amit Sharma",
      title: "Senior Cable Manufacturing Consultant",
      description: "20+ years in cable plant setup, process optimization, and quality control. Helped 50+ companies scale production.",
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      name: "Priya Verma",
      title: "Materials Science Expert",
      description: "Specialist in raw material selection, cost reduction, and supplier management for cable industry.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Rakesh Patel",
      title: "Electrical Design Mentor",
      description: "Expert in cable design, testing, and compliance. Ex-CTO at major cable manufacturer.",
      image: "https://randomuser.me/api/portraits/men/65.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header title="Mentors" onBack={() => window.history.back()} logoSrc='/cableCartLogo.png' />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-1 sm:px-4 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Mentors</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Meet our industry experts and mentors who can guide you in cable manufacturing and business growth.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {dummyMentors.map((mentor, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center border border-gray-100">
              <img src={mentor.image} alt={mentor.name} className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-200" />
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{mentor.name}</h2>
              <h3 className="text-sm text-blue-600 mb-2">{mentor.title}</h3>
              <p className="text-gray-600 text-sm">{mentor.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Mentor; 