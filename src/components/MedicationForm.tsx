"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserFamily } from "@/lib/family";
import { CreateMedication, Medication } from "@/types/database";
import { useLanguage } from "@/contexts/LanguageContext";

interface MedicationFormProps {
  initialData?: Medication;
  isEditing?: boolean;
}

const administrationRoutes = [
  "oral",
  "topical",
  "injectable",
  "sublingual",
  "rectal",
  "vaginal",
  "ophthalmic",
  "otic",
  "nasal",
  "inhalation",
  "transdermal",
];

export default function MedicationForm({
  initialData,
  isEditing = false,
}: MedicationFormProps) {
  const [formData, setFormData] = useState<CreateMedication>({
    name: initialData?.name || "",
    laboratory: initialData?.laboratory || "",
    administration_route: initialData?.administration_route || "",
    quantity: initialData?.quantity || "",
    expiration_date: initialData?.expiration_date || "",
    recommendations: initialData?.recommendations || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError(t.medication.nameRequired);
      return;
    }

    if (!formData.expiration_date) {
      setError(t.medication.expirationRequired);
      return;
    }

    setLoading(true);

    if (isEditing && initialData) {
      const { error } = await supabase
        .from("medications")
        .update(formData)
        .eq("id", initialData.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(t.medication.noUser);
        setLoading(false);
        return;
      }

      const { data: family } = await getUserFamily();
      if (!family) {
        setError(t.medication.familyNotFound);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("medications").insert({
        ...formData,
        user_id: user.id,
        family_id: family.id,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.medication.nameLabel}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder={t.medication.namePlaceholder}
          required
        />
      </div>

      <div>
        <label
          htmlFor="laboratory"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.medication.laboratory}
        </label>
        <input
          type="text"
          id="laboratory"
          name="laboratory"
          value={formData.laboratory || ""}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder={t.medication.laboratoryPlaceholder}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="administration_route"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t.medication.administrationRoute}
          </label>
          <select
            id="administration_route"
            name="administration_route"
            value={formData.administration_route || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="">{t.medication.selectRoute}</option>
            {administrationRoutes.map((route) => (
              <option key={route} value={route}>
                {t.routes[route as keyof typeof t.routes]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t.medication.quantityLabel}
          </label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={formData.quantity || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            placeholder={t.medication.quantityPlaceholder}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.medication.expirationDate}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formData.expiration_date ? formData.expiration_date.substring(5, 7) : ""}
            onChange={(e) => {
              const year = formData.expiration_date
                ? formData.expiration_date.substring(0, 4)
                : String(new Date().getFullYear());
              const month = e.target.value;
              if (month) {
                setFormData((prev) => ({
                  ...prev,
                  expiration_date: `${year}-${month}-01`,
                }));
              } else {
                setFormData((prev) => ({ ...prev, expiration_date: "" }));
              }
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
            required
          >
            <option value="">{t.medication.month}</option>
            <option value="01">{t.months.january}</option>
            <option value="02">{t.months.february}</option>
            <option value="03">{t.months.march}</option>
            <option value="04">{t.months.april}</option>
            <option value="05">{t.months.may}</option>
            <option value="06">{t.months.june}</option>
            <option value="07">{t.months.july}</option>
            <option value="08">{t.months.august}</option>
            <option value="09">{t.months.september}</option>
            <option value="10">{t.months.october}</option>
            <option value="11">{t.months.november}</option>
            <option value="12">{t.months.december}</option>
          </select>
          <select
            value={formData.expiration_date ? formData.expiration_date.substring(0, 4) : ""}
            onChange={(e) => {
              const month = formData.expiration_date
                ? formData.expiration_date.substring(5, 7)
                : "";
              const year = e.target.value;
              if (year && month) {
                setFormData((prev) => ({
                  ...prev,
                  expiration_date: `${year}-${month}-01`,
                }));
              } else if (year) {
                setFormData((prev) => ({
                  ...prev,
                  expiration_date: `${year}-01-01`,
                }));
              }
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
            required
          >
            <option value="">{t.medication.year}</option>
            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="recommendations"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t.medication.recommendations}
        </label>
        <textarea
          id="recommendations"
          name="recommendations"
          value={formData.recommendations || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder={t.medication.recommendationsPlaceholder}
        />
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          {t.medication.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditing
              ? t.medication.updating
              : t.medication.saving
            : isEditing
            ? t.medication.update
            : t.medication.save}
        </button>
      </div>
    </form>
  );
}
