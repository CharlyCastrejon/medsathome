"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFamily, joinFamily, getUserFamily, updateFamilyName } from "@/lib/family";
import { Family } from "@/types/database";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const checkFamily = async () => {
      const { data } = await getUserFamily();
      if (data) {
        setFamily(data);
      }
      setLoading(false);
    };

    checkFamily();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError(t.family.nameRequired);
      return;
    }

    setSubmitting(true);

    const { data, error } = await createFamily(name.trim());

    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }

    setFamily(data);
    setSuccess(t.family.familyCreated);
    setSubmitting(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code.trim()) {
      setError(t.family.codeRequired);
      return;
    }

    setSubmitting(true);

    const { data, error } = await joinFamily(code.trim());

    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }

    setFamily(data);
    setSuccess(t.family.joinedFamily);
    setSubmitting(false);
  };

  const handleUpdateName = async () => {
    if (!family || !newName.trim()) return;

    setUpdatingName(true);
    setError(null);
    setSuccess(null);

    const { data, error } = await updateFamilyName(family.id, newName.trim());

    if (error) {
      setError(error);
      setUpdatingName(false);
      return;
    }

    setFamily(data);
    setEditingName(false);
    setSuccess(t.family.familyCreated);
    setUpdatingName(false);
  };

  const startEditingName = () => {
    if (family) {
      setNewName(family.name);
      setEditingName(true);
      setError(null);
      setSuccess(null);
    }
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNewName("");
  };

  const handleContinue = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const copyCode = async () => {
    if (family?.code) {
      await navigator.clipboard.writeText(family.code);
      setSuccess(t.family.codeCopied);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (family) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-end mb-4">
              <LanguageSwitcher />
            </div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              {editingName ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 text-center w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={t.family.familyName}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3 justify-center">
                    <button
                      onClick={handleUpdateName}
                      disabled={updatingName || !newName.trim()}
                      className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {updatingName ? "..." : t.family.save}
                    </button>
                    <button
                      onClick={cancelEditingName}
                      disabled={updatingName}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                      {t.family.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <h1 className="text-2xl font-bold text-gray-900 inline">
                    {family.name}
                  </h1>
                  <button
                    onClick={startEditingName}
                    className="ml-2 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t.family.editName}
                  >
                    <svg
                      className="w-5 h-5 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <p className="text-gray-500 mt-2">{t.family.familyReady}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">{t.family.codeLabel}</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-primary-600">
                  {family.code}
                </code>
                <button
                  onClick={copyCode}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t.family.copy}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}

            <p className="text-sm text-gray-600 text-center mb-6">
              {t.family.shareCode}
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              {t.family.goToDashboard}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">MedsAtHome</h1>
            <p className="text-gray-500 mt-2">{t.family.setupTitle}</p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "create"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.family.createFamily}
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "join"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.family.joinFamily}
            </button>
          </div>

          {tab === "create" ? (
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t.family.familyName}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder={t.family.familyNamePlaceholder}
                  required
                />
              </div>

              {error && (
                <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.family.creating : t.family.createFamily}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t.family.familyCode}
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-center text-lg tracking-wider"
                  placeholder={t.family.familyCodePlaceholder}
                  required
                />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  {t.family.enterCode}
                </p>
              </div>

              {error && (
                <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.family.joining : t.family.joinFamily}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
