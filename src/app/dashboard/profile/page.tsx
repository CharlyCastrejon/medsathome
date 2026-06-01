"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserProfile, updateProfile } from "@/lib/profiles";
import { getUserFamily } from "@/lib/family";
import { Profile, Family } from "@/types/database";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data: profileData } = await getUserProfile();
      setProfile(profileData);

      const { data: familyData } = await getUserFamily();
      setFamily(familyData);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);

      setLoading(false);
    };

    getData();
  }, [supabase]);

  const startEditing = () => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setEditing(true);
      setError(null);
      setSuccess(false);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError(t.profile.nameRequired);
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error } = await updateProfile(firstName.trim(), lastName.trim());

    if (error) {
      setError(error);
      setSaving(false);
      return;
    }

    if (data) {
      setProfile(data as Profile);
    }

    setEditing(false);
    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 2000);
  };

  const copyCode = async () => {
    if (family?.code) {
      await navigator.clipboard.writeText(family.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t.profile.title}</h1>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
          {t.profile.saved}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.auth.firstName}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.auth.lastName}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? t.profile.saving : t.profile.save}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                {t.medication.cancel}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {t.profile.name}
                </label>
                <p className="text-gray-900 text-lg">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              <button
                onClick={startEditing}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t.profile.edit}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {t.profile.email}
              </label>
              <p className="text-gray-900 text-lg">{email}</p>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.profile.family}</h2>

        {family ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {t.profile.familyCode}
              </label>
              <div className="flex items-center gap-3">
                <code className="text-lg font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                  {family.code}
                </code>
                <button
                  onClick={copyCode}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {copied ? t.profile.copied : t.profile.copy}
                </button>
              </div>
            </div>

            <Link
              href="/family"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {t.profile.editFamily}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">{t.profile.noFamily}</p>
            <Link
              href="/family"
              className="inline-block bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {t.profile.joinFamily}
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.profile.language}</h2>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
