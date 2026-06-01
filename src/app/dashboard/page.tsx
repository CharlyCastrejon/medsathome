"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserFamily } from "@/lib/family";
import { Medication, Family } from "@/types/database";
import MedicationCard from "@/components/MedicationCard";
import SearchBar from "@/components/SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";

type ExpirationStatus = "expired" | "danger" | "warning" | "safe";
type ViewMode = "grid" | "list";

function getExpirationStatus(expirationDate: string): ExpirationStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expirationDate + "T00:00:00");
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today) return "expired";

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return "danger";
  if (diffDays <= 60) return "warning";
  return "safe";
}

function sortMedications(meds: Medication[]): Medication[] {
  return [...meds].sort((a, b) => {
    const nameComparison = a.name.localeCompare(b.name);
    if (nameComparison !== 0) return nameComparison;
    return (
      new Date(a.expiration_date).getTime() -
      new Date(b.expiration_date).getTime()
    );
  });
}

export default function DashboardPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);

    const { data: familyData } = await getUserFamily();
    if (!familyData) {
      setError(t.medication.familyNotFound);
      setLoading(false);
      return;
    }
    setFamily(familyData);

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("family_id", familyData.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const sorted = sortMedications(data || []);
    setMedications(sorted);
    setFilteredMedications(sorted);
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    const filtered = medications.filter((med) =>
      med.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMedications(sortMedications(filtered));
  };

  const handleDelete = (id: string) => {
    setMedications((prev) => sortMedications(prev.filter((med) => med.id !== id)));
    setFilteredMedications((prev) =>
      sortMedications(prev.filter((med) => med.id !== id))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.medications}</h1>
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-48 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.dashboard.medications} {family ? `${t.dashboard.of} ${family.name}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredMedications.length}{" "}
            {filteredMedications.length === 1
              ? t.dashboard.medication
              : t.dashboard.medicationsPlural}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t.dashboard.grid}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t.dashboard.list}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          <Link
            href="/dashboard/medications/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.dashboard.add}
          </Link>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {filteredMedications.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t.dashboard.noMedications}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.dashboard.getStarted}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/medications/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t.dashboard.addMedication}
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              expirationStatus={getExpirationStatus(medication.expiration_date)}
              onDelete={handleDelete}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              expirationStatus={getExpirationStatus(medication.expiration_date)}
              onDelete={handleDelete}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
