import React, { useState } from 'react';
import { X, Plus, Building2 } from 'lucide-react';
import { BusinessCategory, BusinessItem, OnlinePresenceType } from '../types';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (business: BusinessItem) => void;
  categories: BusinessCategory[];
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>(categories[0] || 'Trades & Home Services');
  const [area, setArea] = useState('Town Centre');
  const [fullAddress, setFullAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(4.8);
  const [reviewsCount, setReviewsCount] = useState(35);
  const [onlinePresence, setOnlinePresence] = useState<OnlinePresenceType>('Phone & Word-of-Mouth');
  const [services, setServices] = useState('');
  const [successProof, setSuccessProof] = useState('');
  const [whyNoWebsite, setWhyNoWebsite] = useState('');
  const [opportunityAngle, setOpportunityAngle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newBusiness: BusinessItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      area: area.trim() || 'Barnsley',
      fullAddress: fullAddress.trim() || `${area}, Barnsley, South Yorkshire`,
      postcode: postcode.trim() || 'S70',
      phone: phone.trim(),
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 20,
      statusTag: 'High Reputation',
      onlinePresence,
      primaryServices: services.split(',').map((s) => s.trim()).filter(Boolean),
      successProof: successProof.trim() || 'Strong word-of-mouth reputation and steady local patronage across Barnsley.',
      whyNoWebsite: whyNoWebsite.trim() || 'Operates exclusively via direct telephone inquiries and existing customer recommendations.',
      opportunityAngle: opportunityAngle.trim() || 'Direct online service requests, local Google Maps optimization, and customer review showcase.',
      opportunityScore: 90,
      recommendedPackage: 'Local Service Lead Generation & Direct Contact Hub',
    };

    onAdd(newBusiness);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Add Offline Business to Directory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dale Joinery & Carpentry"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Sector / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Barnsley Suburb / Area
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Wombwell, Penistone"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="e.g. S73 8AH"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01226 xxxxxx or 07xxxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Full Street Address
            </label>
            <input
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="e.g. High Street, Wombwell, Barnsley, South Yorkshire"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Rating (1-5★)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Review Count
              </label>
              <input
                type="number"
                value={reviewsCount}
                onChange={(e) => setReviewsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Current Setup
              </label>
              <select
                value={onlinePresence}
                onChange={(e) => setOnlinePresence(e.target.value as OnlinePresenceType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Phone & Word-of-Mouth">Phone & Word-of-Mouth</option>
                <option value="Facebook Only">Facebook Only</option>
                <option value="Market Counter & Footfall">Market Counter & Footfall</option>
                <option value="Directory Profile Only">Directory Profile Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Core Services (comma separated)
            </label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="e.g. Kitchen Fitting, Door Hanging, Bespoke Wardrobes"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Proof of Success & Reputation
            </label>
            <textarea
              rows={2}
              value={successProof}
              onChange={(e) => setSuccessProof(e.target.value)}
              placeholder="e.g. High Google rating, booked 4 weeks ahead, recommended across local groups."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Website Opportunity / Pitch Angle
            </label>
            <textarea
              rows={2}
              value={opportunityAngle}
              onChange={(e) => setOpportunityAngle(e.target.value)}
              placeholder="e.g. Online estimate request form, portfolio gallery, and instant callout quotes."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Save to Directory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
