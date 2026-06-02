"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Medication } from "@/types/database";
import Modal from "./Modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

type ExpirationStatus = "expired" | "danger" | "warning" | "safe";

interface MedicationCardProps {
  medication: Medication;
  expirationStatus: ExpirationStatus;
  onDelete: (id: string) => void;
  viewMode?: "grid" | "list";
}

const statusConfig = {
  expired: {
    border: "border-danger-500",
    bg: "bg-danger-50",
    badge: "bg-danger-100 text-danger-800",
    badgeTextKey: "expired" as const,
    text: "text-danger-600",
  },
  danger: {
    border: "border-danger-500",
    bg: "bg-danger-50",
    badge: "bg-danger-100 text-danger-800",
    badgeTextKey: "expiresThisMonth" as const,
    text: "text-danger-600",
  },
  warning: {
    border: "border-orange-400",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    badgeTextKey: "expiresIn2Months" as const,
    text: "text-orange-600",
  },
  safe: {
    border: "border-green-400",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-800",
    badgeTextKey: "ok" as const,
    text: "text-green-600",
  },
};

function formatMonthYear(dateStr: string, locale: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

export default function MedicationCard({
  medication,
  expirationStatus,
  onDelete,
  viewMode = "grid",
}: MedicationCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const config = statusConfig[expirationStatus];
  const locale = language === "es" ? "es-MX" : "en-US";

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", medication.id);

    if (error) {
      console.error("Error deleting:", error);
      setDeleting(false);
      setShowModal(false);
      return;
    }

    onDelete(medication.id);
    setShowModal(false);
    showToast(t.toast.medicationDeleted);
  };

  if (viewMode === "list") {
    return (
      <>
        <div
          className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${config.border} transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center gap-4`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {medication.name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
              >
                {t.dashboard[config.badgeTextKey]}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {medication.laboratory && (
                <span>
                  <span className="font-medium">{t.dashboard.lab}</span> {medication.laboratory}
                </span>
              )}
              {medication.administration_route && (
                <span>
                  <span className="font-medium">{t.dashboard.route}</span>{" "}
                  {t.routes[medication.administration_route as keyof typeof t.routes] || medication.administration_route}
                </span>
              )}
              {medication.quantity && (
                <span>
                  <span className="font-medium">{t.dashboard.quantity}</span> {medication.quantity}
                </span>
              )}
              <span>
                <span className="font-medium">{t.dashboard.expires}</span>{" "}
                <span className={config.text}>
                  {formatMonthYear(medication.expiration_date, locale)}
                </span>
              </span>
            </div>
            {medication.recommendations && (
              <p className="text-sm text-gray-500 italic mt-1 line-clamp-1">
                {medication.recommendations}
              </p>
            )}
          </div>
          <div className="flex gap-2 sm:flex-shrink-0">
            <Link
              href={`/dashboard/medications/${medication.id}/edit`}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t.dashboard.edit}
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-danger-300 text-sm font-medium rounded-lg text-danger-700 bg-white hover:bg-danger-50 transition-colors"
            >
              {t.dashboard.delete}
            </button>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleDelete}
          title={t.deleteModal.title}
          message={t.deleteModal.message.replace("{{name}}", medication.name)}
          confirmText={t.deleteModal.confirm}
          loading={deleting}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-xl p-6 shadow-sm border-2 ${config.border} transition-all hover:shadow-md`}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
            {medication.name}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
          >
            {t.dashboard[config.badgeTextKey]}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {medication.laboratory && (
            <p>
              <span className="font-medium">{t.dashboard.lab}</span> {medication.laboratory}
            </p>
          )}
          {medication.administration_route && (
            <p>
              <span className="font-medium">{t.dashboard.route}</span>{" "}
              {t.routes[medication.administration_route as keyof typeof t.routes] || medication.administration_route}
            </p>
          )}
          {medication.quantity && (
            <p>
              <span className="font-medium">{t.dashboard.quantity}</span> {medication.quantity}
            </p>
          )}
          <p>
            <span className="font-medium">{t.dashboard.expires}</span>{" "}
            <span className={config.text}>
              {formatMonthYear(medication.expiration_date, locale)}
            </span>
          </p>
          {medication.recommendations && (
            <p className="text-gray-500 italic line-clamp-2">
              {medication.recommendations}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/dashboard/medications/${medication.id}/edit`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1.5"
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
            {t.dashboard.edit}
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-danger-300 text-sm font-medium rounded-lg text-danger-700 bg-white hover:bg-danger-50 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t.dashboard.delete}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title={t.deleteModal.title}
        message={t.deleteModal.message.replace("{{name}}", medication.name)}
        confirmText={t.deleteModal.confirm}
        loading={deleting}
      />
    </>
  );
}
