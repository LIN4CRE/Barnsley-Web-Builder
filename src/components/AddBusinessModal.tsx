import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from './Modal';
import { BUSINESS_CATEGORIES, ONLINE_PRESENCE_TYPES } from '@/types';
import type { BusinessItem, BusinessCategory, OnlinePresenceType } from '@/types';
import { parseBusinessItem } from '@/lib/schema';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (business: BusinessItem) => void;
}

const inputClasses =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600';

export function AddBusinessModal({ isOpen, onClose, onAdd }: AddBusinessModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>(BUSINESS_CATEGORIES[2]);
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState('4.8');
  const [reviewsCount, setReviewsCount] = useState('30');
  const [onlinePresence, setOnlinePresence] = useState<OnlinePresenceType>('Phone & Word-of-Mouth');
  const [services, setServices] = useState('');
  const [successProof, setSuccessProof] = useState('');
  const [whyNoWebsite, setWhyNoWebsite] = useState('');
  const [opportunityAngle, setOpportunityAngle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setName('');
    setArea('');
    setFullAddress('');
    setPostcode('');
    setPhone('');
    setRating('4.8');
    setReviewsCount('30');
    setServices('');
    setSuccessProof('');
    setWhyNoWebsite('');
    setOpportunityAngle('');
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the business name.';
    if (!phone.trim()) nextErrors.phone = 'Enter a phone number — it is the main call to action.';

    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      nextErrors.rating = 'Rating must be between 0 and 5.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Round-trip through the same validator used for API responses, so a
    // hand-entered record can never be structurally different from an imported one.
    const candidate = parseBusinessItem({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      area: area.trim() || 'Barnsley',
      fullAddress: fullAddress.trim() || `${area.trim() || 'Barnsley'}, South Yorkshire`,
      postcode: postcode.trim(),
      phone: phone.trim(),
      rating: parsedRating,
      reviewsCount: Number(reviewsCount) || 0,
      statusTag: 'High Reputation',
      onlinePresence,
      primaryServices: services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      successProof: successProof.trim(),
      whyNoWebsite: whyNoWebsite.trim(),
      opportunityAngle: opportunityAngle.trim(),
      opportunityScore: 75,
      recommendedPackage: 'Local lead-generation site with click-to-call',
      isUserAdded: true,
      addedAt: new Date().toISOString(),
    });

    if (!candidate) {
      setErrors({ name: 'That record could not be saved. Check the name and phone number.' });
      return;
    }

    onAdd({ ...candidate, isUserAdded: true });
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a business to the directory"
      description="Records you add are stored in this browser only. Use Export CSV to keep a backup."
      className="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-business-form"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add to directory</span>
          </button>
        </div>
      }
    >
      <form
        id="add-business-form"
        onSubmit={handleSubmit}
        noValidate
        className="p-5 space-y-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-name" className="block text-slate-700 font-semibold mb-1">
              Business name <span className="text-rose-600">*</span>
            </label>
            <input
              id="add-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'add-name-error' : undefined}
              className={inputClasses}
            />
            {errors.name && (
              <p id="add-name-error" className="mt-1 text-[11px] text-rose-700">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="add-category" className="block text-slate-700 font-semibold mb-1">
              Sector
            </label>
            <select
              id="add-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BusinessCategory)}
              className={inputClasses}
            >
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="add-area" className="block text-slate-700 font-semibold mb-1">
              Barnsley area
            </label>
            <input
              id="add-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Wombwell"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="add-postcode" className="block text-slate-700 font-semibold mb-1">
              Postcode
            </label>
            <input
              id="add-postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="S70 1GW"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="add-phone" className="block text-slate-700 font-semibold mb-1">
              Telephone <span className="text-rose-600">*</span>
            </label>
            <input
              id="add-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'add-phone-error' : undefined}
              className={inputClasses}
            />
            {errors.phone && (
              <p id="add-phone-error" className="mt-1 text-[11px] text-rose-700">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="add-rating" className="block text-slate-700 font-semibold mb-1">
              Rating (0–5)
            </label>
            <input
              id="add-rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              aria-invalid={Boolean(errors.rating)}
              aria-describedby={errors.rating ? 'add-rating-error' : undefined}
              className={inputClasses}
            />
            {errors.rating && (
              <p id="add-rating-error" className="mt-1 text-[11px] text-rose-700">
                {errors.rating}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="add-reviews" className="block text-slate-700 font-semibold mb-1">
              Review count
            </label>
            <input
              id="add-reviews"
              type="number"
              min="0"
              value={reviewsCount}
              onChange={(e) => setReviewsCount(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="add-presence" className="block text-slate-700 font-semibold mb-1">
              Current setup
            </label>
            <select
              id="add-presence"
              value={onlinePresence}
              onChange={(e) => setOnlinePresence(e.target.value as OnlinePresenceType)}
              className={inputClasses}
            >
              {ONLINE_PRESENCE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="add-address" className="block text-slate-700 font-semibold mb-1">
            Full address
          </label>
          <input
            id="add-address"
            type="text"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="add-services" className="block text-slate-700 font-semibold mb-1">
            Main services <span className="font-normal text-slate-500">(comma separated)</span>
          </label>
          <input
            id="add-services"
            type="text"
            value={services}
            onChange={(e) => setServices(e.target.value)}
            placeholder="MOT Testing, Clutch Replacements, Brake Servicing"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="add-proof" className="block text-slate-700 font-semibold mb-1">
            Why they are well regarded
          </label>
          <textarea
            id="add-proof"
            rows={2}
            value={successProof}
            onChange={(e) => setSuccessProof(e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="add-why" className="block text-slate-700 font-semibold mb-1">
            Why they have no website
          </label>
          <textarea
            id="add-why"
            rows={2}
            value={whyNoWebsite}
            onChange={(e) => setWhyNoWebsite(e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="add-angle" className="block text-slate-700 font-semibold mb-1">
            The web opportunity
          </label>
          <textarea
            id="add-angle"
            rows={2}
            value={opportunityAngle}
            onChange={(e) => setOpportunityAngle(e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>

        <p className="text-[11px] text-slate-500">
          Only add businesses you have a genuine reason to contact. This tool stores data in your
          browser — it is not synced anywhere.
        </p>
      </form>
    </Modal>
  );
}
