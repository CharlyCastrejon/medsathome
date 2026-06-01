"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Medication } from "@/types/database";
import MedicationForm from "@/components/MedicationForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EditMedicationPage() {
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMedication = async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setMedication(data);
      setLoading(false);
    };

    fetchMedication();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !medication) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg">
          {error || t.medication.notFound}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          {t.medication.goBack}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t.medication.editMedication}
        </h1>
        <p className="text-gray-600 mt-2">
          {t.medication.updateInfo} {medication.name}.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <MedicationForm initialData={medication} isEditing />
      </div>
    </div>
  );
}
