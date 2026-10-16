import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Globe, 
  Camera, 
  Trash2, 
  Check, 
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name || '');
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
  const [organization, setOrganization] = useState(user.organization || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [timezone, setTimezone] = useState(user.timezone || 'America/New_York (EST)');
  const [bio, setBio] = useState(user.bio || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');

  const [preferredDays, setPreferredDays] = useState<string[]>(
    user.meetingPreferences?.preferredDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  );
  const [preferredHours, setPreferredHours] = useState(
    user.meetingPreferences?.preferredHours || '9:00 AM – 5:00 PM EST'
  );
  const [defaultDuration, setDefaultDuration] = useState(
    user.meetingPreferences?.defaultMeetingDuration || 30
  );

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture('');
  };

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdateProfile({
        name,
        jobTitle,
        organization,
        phone,
        timezone,
        bio,
        profilePicture,
        meetingPreferences: {
          preferredDays,
          preferredHours,
          bufferMinutes: 10,
          defaultMeetingDuration: defaultDuration,
          defaultReminderTime: user.meetingPreferences?.defaultReminderTime || '15 minutes before',
        },
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Edit Personal Profile
              </h2>
              <p className="text-xs text-slate-500">
                Update your professional details and meeting preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Profile Picture Upload & Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                  {name.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="font-semibold text-slate-800 block text-xs">
                Profile Photo
              </span>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Work Email (Primary)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          {/* Job Title & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Job Title / Designation
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. VP of Product"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Calist Systems"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Time Zone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              >
                <option value="America/New_York (EST)">Eastern Time (US & Canada)</option>
                <option value="America/Chicago (CST)">Central Time (US & Canada)</option>
                <option value="America/Denver (MST)">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles (PST)">Pacific Time (US & Canada)</option>
                <option value="Europe/London (GMT)">London / GMT</option>
                <option value="Europe/Paris (CET)">Central European Time</option>
                <option value="Asia/Tokyo (JST)">Japan / Tokyo</option>
                <option value="Asia/Kolkata (IST)">India Standard Time</option>
              </select>
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Short Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief intro visible to team members..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
            />
          </div>

          {/* Meeting Preferences */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <span className="font-bold text-slate-800 block text-xs">
              Meeting Scheduling Preferences
            </span>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Preferred Meeting Days:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const isChecked = preferredDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Preferred Hours:
                </label>
                <input
                  type="text"
                  value={preferredHours}
                  onChange={(e) => setPreferredHours(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Default Duration:
                </label>
                <select
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value={15}>15 mins</option>
                  <option value={25}>25 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Profile changes saved!
              </span>
            ) : <span></span>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
