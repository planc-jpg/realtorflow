// src/pages/AIListing.jsx

import { useState } from 'react';

function generateMockDescription(form) {
  return `Welcome to ${form.address}, a stunning ${form.beds}-bedroom, ${form.baths}-bathroom home${form.sqft ? ` spanning ${form.sqft} square feet` : ''}. This exceptional property offers the perfect blend of comfort and style, making it an ideal choice for those seeking a place to call home.

${form.features ? `The home boasts impressive features including ${form.features}, adding both value and charm to this already remarkable property.` : 'The home features thoughtful design throughout, with attention to detail evident in every room.'}

Nestled in a desirable location, this property presents a rare opportunity for discerning buyers. Don't miss your chance to own this incredible home — schedule your private showing today.`;
}

export default function AIListing() {
  const [form, setForm] = useState({
    address: '',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    features: '',
    tone: 'professional',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGenerate() {
    if (!form.address || !form.beds || !form.baths) return;
    setLoading(true);
    setResult('');

    // Simulate a short delay like a real API call
    setTimeout(() => {
      setResult(generateMockDescription(form));
      setLoading(false);
    }, 1500);
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">AI Listing Generator</h2>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the property details and generate a listing description.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Maple Street, Austin, TX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="$450,000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
            <input
              name="sqft"
              value={form.sqft}
              onChange={handleChange}
              placeholder="2,100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              name="beds"
              value={form.beds}
              onChange={handleChange}
              placeholder="3"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              name="baths"
              value={form.baths}
              onChange={handleChange}
              placeholder="2"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Features</label>
            <input
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder="Pool, updated kitchen, hardwood floors, large backyard..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              name="tone"
              value={form.tone}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="luxury">Luxury</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !form.address || !form.beds || !form.baths}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Listing Description'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Generated Description</h3>
            <button
              onClick={handleCopy}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}