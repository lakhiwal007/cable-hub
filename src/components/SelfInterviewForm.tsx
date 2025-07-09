import React, { useState } from "react";

interface SelfInterviewFormProps {
  roles: string[];
}

const SelfInterviewForm: React.FC<SelfInterviewFormProps> = ({ roles }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  return (
    <form className="space-y-4 max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Job Application</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          Full Name:
          <input type="text" name="name" required className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Email:
          <input type="email" name="email" required className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Phone Number:
          <input type="tel" name="phone" required className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Role Applying For:
          <select name="role" required className="input w-full mt-1 border rounded px-2 py-1">
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="block">
          Current Location/City:
          <input type="text" name="location" required className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Years of Experience:
          <input type="number" name="experience" min={0} className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          Education:
          <input type="text" name="education" placeholder="e.g. B.Tech, XYZ University, 2020" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          Skills:
          <input type="text" name="skills" placeholder="Comma separated" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          Previous Company/Experience:
          <textarea name="experience_details" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          LinkedIn Profile:
          <input type="url" name="linkedin" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          Portfolio/Website:
          <input type="url" name="portfolio" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          Cover Letter / Why should we hire you?
          <textarea name="cover_letter" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Expected Salary:
          <input type="text" name="salary" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block">
          Notice Period:
          <input type="text" name="notice_period" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="block md:col-span-2">
          References:
          <textarea name="references" className="input w-full mt-1 border rounded px-2 py-1" />
        </label>
      </div>
      <label className="block">
        Upload Resume:
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={e => setResume(e.target.files?.[0] || null)}
          required
          className="block mt-1"
        />
        {resume && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              ✓ Resume uploaded: {resume.name}
            </p>
          </div>
        )}
      </label>
      <label className="block">
        Upload Self-Interview Video:
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
          className="block mt-1"
        />
        {video && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700 mb-2">
              ✓ Video uploaded: {video.name}
            </p>
            {videoPreview && (
              <video 
                controls 
                width="100%" 
                className="rounded border max-w-md"
                src={videoPreview}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}
      </label>
      <button type="submit" className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        Submit Application
      </button>
    </form>
  );
};

export default SelfInterviewForm; 