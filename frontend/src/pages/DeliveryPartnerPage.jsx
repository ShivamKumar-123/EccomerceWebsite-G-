import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Upload, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { canCallApi } from '../services/productsApi';
import { submitDeliveryPartnerApplication } from '../services/deliveryPartnerApi';

const initial = {
  full_name: '',
  age: '',
  email: '',
  phone: '',
  license_number: '',
  aadhar_number: '',
  pan_number: '',
  city: '',
  district: '',
  state: '',
};

const FILE_KEYS = [
  'license_image_front',
  'license_image_back',
  'aadhar_image_front',
  'aadhar_image_back',
  'pan_image_front',
  'pan_image_back',
];

export default function DeliveryPartnerPage() {
  const [fields, setFields] = useState(initial);
  const [files, setFiles] = useState({
    license_image_front: null,
    license_image_back: null,
    aadhar_image_front: null,
    aadhar_image_back: null,
    pan_image_front: null,
    pan_image_back: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const onFile = (key) => (e) => {
    const f = e.target.files?.[0];
    setFiles((prev) => ({ ...prev, [key]: f || null }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canCallApi()) {
      setError('API is not configured. Run the backend and set VITE_API_URL (or use npm run dev with proxy).');
      return;
    }
    for (const k of FILE_KEYS) {
      if (!files[k]) {
        setError('Please upload front and back photos for licence, Aadhaar, and PAN.');
        return;
      }
    }
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v).trim()));
    FILE_KEYS.forEach((k) => fd.append(k, files[k]));
    setSubmitting(true);
    try {
      await submitDeliveryPartnerApplication(fd);
      setDone(true);
      setFields(initial);
      setFiles({
        license_image_front: null,
        license_image_back: null,
        aadhar_image_front: null,
        aadhar_image_back: null,
        pan_image_front: null,
        pan_image_back: null,
      });
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const docRows = [
    {
      numKey: 'license_number',
      label: 'Driving licence number',
      frontKey: 'license_image_front',
      backKey: 'license_image_back',
      frontLabel: 'Licence — front',
      backLabel: 'Licence — back',
    },
    {
      numKey: 'aadhar_number',
      label: 'Aadhaar number',
      frontKey: 'aadhar_image_front',
      backKey: 'aadhar_image_back',
      frontLabel: 'Aadhaar — front',
      backLabel: 'Aadhaar — back',
    },
    {
      numKey: 'pan_number',
      label: 'PAN number',
      frontKey: 'pan_image_front',
      backKey: 'pan_image_back',
      frontLabel: 'PAN — front',
      backLabel: 'PAN — back',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 pb-16 dark:bg-dark">
      <SEOHead
        title="Become a delivery partner — Goldy Mart"
        description="Apply to join our delivery network. Submit your details and documents for verification."
        keywords="delivery partner, courier, Goldy Mart"
        url="https://www.goldymart.com/delivery-partner"
      />

      <div className="border-b border-stone-200/80 bg-gradient-to-r from-primary-900 via-primary-800 to-stone-900 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-secondary-300 ring-1 ring-white/20">
              <Truck className="h-7 w-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                Become a delivery partner
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-primary-200/90">
                Fill the form and upload clear photos of the front and back of each document. Our team will verify your
                application. If approved, you will receive your login password by email, then you can sign in at{' '}
                <Link to="/partner-login" className="font-semibold text-white underline underline-offset-2">
                  Partner login
                </Link>{' '}
                to open your delivery dashboard.
              </p>
              <p className="mt-3 text-xs text-primary-300/80">
                <Link to="/" className="font-semibold text-white underline-offset-2 hover:underline">
                  Home
                </Link>
                <span className="mx-2 opacity-60">/</span>
                <span className="text-white/90">Partner application</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {done ? (
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-8 text-center shadow-soft dark:border-emerald-900/50 dark:bg-emerald-950/40">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600 dark:text-emerald-400" />
            <h2 className="mt-4 text-xl font-bold text-stone-900 dark:text-white">Application received</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              We will review your details. If approved, your password will be sent to the email you provided.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white dark:bg-white dark:text-stone-900"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-stone-900/80 sm:p-8"
          >
            {error ? (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                Personal details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">Full name</span>
                  <input
                    required
                    name="full_name"
                    value={fields.full_name}
                    onChange={onChange}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">Age</span>
                  <input
                    required
                    type="number"
                    min={18}
                    max={80}
                    name="age"
                    value={fields.age}
                    onChange={onChange}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">Phone</span>
                  <input
                    required
                    name="phone"
                    value={fields.phone}
                    onChange={onChange}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={onChange}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                Documents
              </h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                JPG or PNG. Upload a separate photo for the front and back of each ID.
              </p>
              <div className="mt-4 space-y-6">
                {docRows.map((row) => (
                  <div
                    key={row.numKey}
                    className="rounded-xl border border-stone-200/80 p-4 dark:border-white/10"
                  >
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-400">
                        {row.label}
                      </span>
                      <input
                        required
                        name={row.numKey}
                        value={fields[row.numKey]}
                        onChange={onChange}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-stone-950 dark:text-white"
                      />
                    </label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[row.frontKey, row.backKey].map((fk, i) => (
                        <label
                          key={fk}
                          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50/80 px-3 py-5 dark:border-white/20 dark:bg-stone-950/50"
                        >
                          <Upload className="h-7 w-7 text-stone-400" />
                          <span className="text-center text-xs font-medium text-stone-700 dark:text-stone-300">
                            {i === 0 ? row.frontLabel : row.backLabel}
                          </span>
                          {files[fk] ? (
                            <span className="text-[10px] text-primary-700 dark:text-primary-400">{files[fk].name}</span>
                          ) : (
                            <span className="text-[10px] text-stone-500">Tap to upload</span>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={onFile(fk)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">Location</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {['city', 'district', 'state'].map((name) => (
                  <label key={name} className="block sm:col-span-1">
                    <span className="mb-1 block text-xs font-semibold capitalize text-stone-600 dark:text-stone-400">
                      {name}
                    </span>
                    <input
                      required
                      name={name}
                      value={fields[name]}
                      onChange={onChange}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 dark:border-white/10 dark:bg-stone-950 dark:text-white"
                    />
                  </label>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-800 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:brightness-105 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
