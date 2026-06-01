"use client";

import MedicationForm from "@/components/MedicationForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewMedicationPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.dashboard.addMedication}
        </h1>
        <p className="text-gray-600 mt-2">
          {t.medication.addDescription}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <MedicationForm />
      </div>
    </div>
  );
}
