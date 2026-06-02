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
type FilterStatus = "all" | ExpirationStatus;

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

const statusOrder: Record<ExpirationStatus, number> = {
  expired: 0,
  danger: 1,
  warning: 2,
  safe: 3,
};

function sortMedications(meds: Medication[]): Medication[] {
  return [...meds].sort((a, b) => {
    const statusA = statusOrder[getExpirationStatus(a.expiration_date)];
    const statusB = statusOrder[getExpirationStatus(b.expiration_date)];
    if (statusA !== statusB) return statusA - statusB;
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
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMedications = async () => {
    setLoading(true);

    const { data: familyData } = await getUserFamily();
    if (!familyData) {
      setError(t.medication.familyNotFound);
      setLoading(false);
      return;
    }
    
    const currentFamily = Array.isArray(familyData) ? familyData[0] : familyData;
    setFamily(currentFamily as Family);

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("family_id", currentFamily.id);

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

  const applyFilters = (query: string, filter: FilterStatus) => {
    let result = medications;

    if (query) {
      result = result.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filter !== "all") {
      result = result.filter((med) => getExpirationStatus(med.expiration_date) === filter);
    }

    setFilteredMedications(sortMedications(result));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, activeFilter);
  };

  const handleFilter = (filter: FilterStatus) => {
    setActiveFilter(filter);
    applyFilters(searchQuery, filter);
  };

  const handleDelete = (id: string) => {
    const next = medications.filter((med) => med.id !== id);
    setMedications(next);
    applyFilters(searchQuery, activeFilter);
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
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
    <div className="space-y-6 pb-20" aria-live="polite">
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
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t.dashboard.grid}
              aria-label={t.dashboard.grid}
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
              aria-label={t.dashboard.list}
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
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
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

      <SearchBar onSearch={handleSearch} resultCount={filteredMedications.length} />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", t.dashboard.filterAll],
            ["expired", t.dashboard.filterExpired],
            ["danger", t.dashboard.filterThisMonth],
            ["warning", t.dashboard.filterIn2Months],
            ["safe", t.dashboard.filterOk],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeFilter === key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      <Link
        href="/dashboard/medications/new"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-105 sm:hidden"
        aria-label={t.dashboard.addMedication}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
