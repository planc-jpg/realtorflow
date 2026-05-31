// src/pages/AIListing.jsx

import { useState } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function generateMockDescription(form) {
  return `Welcome to ${form.address}, a stunning ${form.beds}-bedroom, ${form.baths}-bathroom home${form.sqft ? ` spanning ${form.sqft} square feet` : ''}. This exceptional property offers the perfect blend of comfort and style, making it an ideal choice for those seeking a place to call home.

${form.features ? `The home boasts impressive features including ${form.features}, adding both value and charm to this already remarkable property.` : 'The home features thoughtful design throughout, with attention to detail evident in every room.'}

Nestled in a desirable location, this property presents a rare opportunity for discerning buyers. Don't miss your chance to own this incredible home - schedule your private showing today.`;
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
        <h2 className="rf-page-title">AI Listing Generator</h2>
        <p className="rf-page-subtitle">Fill in the property details and generate a listing description.</p>
      </div>

      <div className="rf-card p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="rf-field-label">Address</label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Maple Street, Austin, TX"
            />
          </div>

          <div>
            <label className="rf-field-label">Price</label>
            <Input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="$450,000"
            />
          </div>

          <div>
            <label className="rf-field-label">Square Footage</label>
            <Input
              name="sqft"
              value={form.sqft}
              onChange={handleChange}
              placeholder="2,100"
            />
          </div>

          <div>
            <label className="rf-field-label">Bedrooms</label>
            <Input
              name="beds"
              value={form.beds}
              onChange={handleChange}
              placeholder="3"
            />
          </div>

          <div>
            <label className="rf-field-label">Bathrooms</label>
            <Input
              name="baths"
              value={form.baths}
              onChange={handleChange}
              placeholder="2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="rf-field-label">Special Features</label>
            <Input
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder="Pool, updated kitchen, hardwood floors, large backyard..."
            />
          </div>

          <div>
            <label className="rf-field-label">Tone</label>
            <select
              name="tone"
              value={form.tone}
              onChange={handleChange}
              className="rf-native-input"
            >
              <option value="professional">Professional</option>
              <option value="luxury">Luxury</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !form.address || !form.beds || !form.baths}
          className="w-full gap-1.5"
        >
          <Sparkles size={16} />
          {loading ? 'Generating...' : 'Generate Listing Description'}
        </Button>
      </div>

      {result && (
        <div className="rf-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Generated Description</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              <Copy size={14} />
              Copy
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
