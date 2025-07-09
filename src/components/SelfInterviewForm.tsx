import React, { useState } from "react";

interface SelfInterviewFormProps {
  roles: string[];
}

const SelfInterviewForm: React.FC<SelfInterviewFormProps> = ({ roles }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  return (
    <form className="space-y-4 sm:space-y-6 w-full max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Job Application</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Full Name:</span>
          <input type="text" name="name" required className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Email:</span>
          <input type="email" name="email" required className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Phone Number:</span>
          <input type="tel" name="phone" required className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Role Applying For:</span>
          <select name="role" required className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base">
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Current Location/City:</span>
          <input type="text" name="location" required className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Years of Experience:</span>
          <input type="number" name="experience" min={0} className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm sm:text-base font-medium">Education:</span>
          <input type="text" name="education" placeholder="e.g. B.Tech, XYZ University, 2020" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm sm:text-base font-medium">Skills:</span>
          <input type="text" name="skills" placeholder="Comma separated" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm sm:text-base font-medium">Previous Company/Experience:</span>
          <textarea name="experience_details" rows={3} className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base resize-none" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-2">
          <span className="text-sm sm:text-base font-medium">LinkedIn Profile:</span>
          <input type="url" name="linkedin" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="text-sm sm:text-base font-medium">Portfolio/Website:</span>
          <input type="url" name="portfolio" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm sm:text-base font-medium">Cover Letter / Why should we hire you?</span>
          <textarea name="cover_letter" rows={4} className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base resize-none" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Expected Salary:</span>
          <input type="text" name="salary" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Notice Period:</span>
          <input type="text" name="notice_period" className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base" />
        </label>
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-sm sm:text-base font-medium">References:</span>
          <textarea name="references" rows={3} className="input w-full mt-1 border rounded px-2 py-2 text-sm sm:text-base resize-none" />
        </label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Upload Resume:</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={e => setResume(e.target.files?.[0] || null)}
            required
            className="block mt-1 w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {resume && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">
                ✓ Resume uploaded: {resume.name}
              </p>
            </div>
          )}
        </label>
        <label className="block">
          <span className="text-sm sm:text-base font-medium">Upload Self-Interview Video:</span>
          <input
            type="file"
            accept="video/*"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setVideo(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setVideoPreview(url);
              } else {
                setVideoPreview(null);
              }
            }}
            required
            className="block mt-1 w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {video && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700 mb-2">
                ✓ Video uploaded: {video.name}
              </p>
              {videoPreview && (
                <video 
                  controls 
                  width="100%" 
                  className="rounded border max-w-full"
                  src={videoPreview}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </label>
      </div>
      <button type="submit" className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded text-sm sm:text-base font-medium">
        Submit Application
      </button>
    </form>
  );
};

export default SelfInterviewForm; 