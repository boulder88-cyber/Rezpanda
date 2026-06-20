import React, { useState } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY / HOME FORM
//
// Writes to the `homes` collection (id, name, propertyType, personal,
// address, bedrooms, bathrooms, squareFootage, ownerId, ownerPersonId)
// plus the structured address fields added by migration:
//   street · city · state · zip
//
// Address is captured as separate fields (street / city / state / zip) for
// consistency — no guessing a freeform convention. The single `address`
// string is AUTO-COMPOSED from those parts on save so existing display code
// (profile page, HomeSwitcher, bill card property labels) keeps working
// unchanged.
//
// NOTE — rental mode is PARKED, not removed. This form was originally a
// landlord/rental form (rentPrice, vacant/occupied status). CasaCEO is
// homeowner-first for v1, so those inputs are gone — but the propertyType
// list stays rental-compatible (Apartment / Multi-family / Townhouse), and
// this is the natural place a future rental mode would re-attach its fields.
// ═══════════════════════════════════════════════════════════════════════

// 50 states + DC. Stored as the 2-letter code so "GA" is the single source of
// truth — kills "Georgia" / "GA" / "Ga." drift the same way sender-domain
// detection sidesteps the payee-name problem.
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'manufactured', label: 'Manufactured / Mobile' },
  { value: 'multi_family', label: 'Multi-family' },
  { value: 'other', label: 'Other' },
];

// Compose the legacy single-line address from the structured parts, e.g.
// "123 Oakwood Lane, St. Simons Island, GA 31522". Skips empty pieces so a
// partially-filled address still reads cleanly.
const composeAddress = ({ street, city, state, zip }) => {
  const cityStateZip = [city, [state, zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [street, cityStateZip].filter(Boolean).join(', ').trim();
};

const PropertyForm = ({ onSuccess, onCancel, initialData = null }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    propertyType: initialData?.propertyType || 'house',
    bedrooms: initialData?.bedrooms || '',
    bathrooms: initialData?.bathrooms || '',
    squareFootage: initialData?.squareFootage || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a home.",
        variant: "destructive"
      });
      return;
    }

    // At minimum we want a street + city so the home is identifiable.
    if (!formData.street.trim() || !formData.city.trim()) {
      toast({
        title: "Address needed",
        description: "Please enter at least a street and city.",
        variant: "destructive"
      });
      return;
    }

    // ZIP, if provided, must be exactly 5 digits (matches the field pattern).
    if (formData.zip && !/^\d{5}$/.test(formData.zip.trim())) {
      toast({
        title: "Check the ZIP code",
        description: "ZIP should be 5 digits.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const street = formData.street.trim();
      const city = formData.city.trim();
      const state = formData.state.trim();
      const zip = formData.zip.trim();

      const dataToSubmit = {
        // A home name is optional; fall back to the street so the home always
        // has a readable label in the switcher.
        name: formData.name.trim() || street,
        street,
        city,
        state,
        zip,
        // Keep the single-line address in sync for existing display code.
        address: composeAddress({ street, city, state, zip }),
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0,
        squareFootage: formData.squareFootage ? Number(formData.squareFootage) : 0,
        ownerId: currentUser.id,
      };

      let record;
      if (initialData?.id) {
        // On edit, preserve fields this form doesn't manage (personal flag,
        // person link) so updating an address never wipes them.
        record = await pb.collection('homes').update(initialData.id, dataToSubmit, { $autoCancel: false });
        toast({ title: "Saved", description: "Home updated." });
      } else {
        record = await pb.collection('homes').create(dataToSubmit, { $autoCancel: false });
        toast({ title: "Added", description: "Home added." });
      }

      if (onSuccess) onSuccess(record);
    } catch (error) {
      console.error("Error saving home:", error);
      toast({
        title: "Error",
        description: error.message || "Could not save the home.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {/* Home name — optional friendly label ("Lake House", "Mom's Place"). */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-700">Home name <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Lake House"
          className="text-slate-900"
        />
      </div>

      {/* Structured address — street / city / state / zip. */}
      <div className="space-y-2">
        <Label htmlFor="street" className="text-slate-700">Street address *</Label>
        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="123 Main St"
          required
          className="text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="city" className="text-slate-700">City *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="state" className="text-slate-700">State</Label>
          <Select value={formData.state} onValueChange={(val) => handleSelectChange('state', val)}>
            <SelectTrigger className="text-slate-900">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {US_STATES.map(st => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="zip" className="text-slate-700">ZIP</Label>
          <Input
            id="zip"
            name="zip"
            inputMode="numeric"
            maxLength={5}
            value={formData.zip}
            onChange={handleChange}
            placeholder="31522"
            className="text-slate-900"
          />
        </div>
      </div>

      {/* Property type — homeowner-flavored, but the list stays rental-friendly
          (Apartment / Multi-family) so a future rental mode fits without a
          schema change. */}
      <div className="space-y-2">
        <Label htmlFor="propertyType" className="text-slate-700">Property type</Label>
        <Select value={formData.propertyType} onValueChange={(val) => handleSelectChange('propertyType', val)}>
          <SelectTrigger className="text-slate-900">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="text-slate-700">Bedrooms</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            value={formData.bedrooms}
            onChange={handleChange}
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="text-slate-700">Bathrooms</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            step="0.5"
            value={formData.bathrooms}
            onChange={handleChange}
            className="text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="squareFootage" className="text-slate-700">Sq Ft</Label>
          <Input
            id="squareFootage"
            name="squareFootage"
            type="number"
            min="0"
            value={formData.squareFootage}
            onChange={handleChange}
            className="text-slate-900"
          />
        </div>
      </div>

      {/* ── Rental mode parked here ──
          Earlier versions collected rentPrice + a vacant/occupied status.
          Removed for the homeowner-first v1 (those fields don't exist on the
          `homes` collection). If a rental/property-manager mode returns, its
          fields re-attach at this point. */}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="text-white hover:opacity-90" style={{ background: '#1e3a5f' }}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Save home' : 'Add home'
          )}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
