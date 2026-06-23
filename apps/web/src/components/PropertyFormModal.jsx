import React, { useState, useEffect } from 'react';
import pb from '@/lib/horizonsBackend.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTY / HOME FORM MODAL  — the single source of truth for adding AND
// editing a home. (Replaces the old duplicate landlord forms; the standalone
// PropertyForm.jsx is now redundant and can be deleted.)
//
// Writes to the `homes` collection:
//   name · propertyType · address · street · apt · city · state · zip
//   bedrooms · bathrooms · squareFootage · ownerId
// On edit, `personal` and `ownerPersonId` are preserved untouched.
//
// Address is captured as separate fields (street / apt / city / state / zip)
// for consistency — no guessing a freeform convention. The single `address`
// string is AUTO-COMPOSED from the parts on save so existing display code
// (profile page, HomeSwitcher, bill card property labels) keeps working.
//
// propertyType is a USE category — Home / Vacation / Rental — not a building
// structure. Rental stays in the list as the natural seam for a future
// rental/property-manager mode (its old rentPrice + occupancy fields were
// removed for the homeowner-first v1).
// ═══════════════════════════════════════════════════════════════════════

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY',
];

const PROPERTY_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'rental', label: 'Rental' },
];

// Compose the legacy single-line address from the structured parts, e.g.
// "123 Oakwood Lane, Apt 4B, St. Simons Island, GA 31522". Empty pieces are
// skipped so a partially-filled address still reads cleanly.
const composeAddress = ({ street, apt, city, state, zip }) => {
  const cityStateZip = [city, [state, zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [street, apt, cityStateZip].filter(Boolean).join(', ').trim();
};

const EMPTY = {
  name: '',
  street: '',
  apt: '',
  city: '',
  state: '',
  zip: '',
  propertyType: 'home',
  bedrooms: '',
  bathrooms: '',
  squareFootage: '',
};

const PropertyFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY);

  const isEdit = Boolean(initialData?.id);

  // Load the home's values when opening in edit mode; reset to empty for add.
  // Runs whenever the dialog opens or the target home changes.
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        street: initialData.street || '',
        apt: initialData.apt || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip: initialData.zip || '',
        propertyType: initialData.propertyType || 'home',
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        squareFootage: initialData.squareFootage || '',
      });
    } else {
      setFormData(EMPTY);
    }
  }, [isOpen, initialData]);

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
        description: "You must be logged in to save a home.",
        variant: "destructive"
      });
      return;
    }

    // Address is required: street + city at minimum.
    if (!formData.street.trim() || !formData.city.trim()) {
      toast({
        title: "Address needed",
        description: "Please enter at least a street and city.",
        variant: "destructive"
      });
      return;
    }

    // ZIP, if provided, must be exactly 5 digits.
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
      const apt = formData.apt.trim();
      const city = formData.city.trim();
      const state = formData.state.trim();
      const zip = formData.zip.trim();

      const dataToSubmit = {
        // Optional name; fall back to the street so the home always has a
        // readable label in the switcher.
        name: formData.name.trim() || street,
        street,
        // NOTE: `apt` is intentionally NOT sent as its own field — the `homes`
        // collection has no apt column, and PocketBase rejects writes with
        // unknown fields. The apartment/unit still rides along inside the
        // composed `address` line below, so nothing is lost.
        city,
        state,
        zip,
        // Keep the single-line address in sync for existing display code.
        address: composeAddress({ street, apt, city, state, zip }),
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0,
        squareFootage: formData.squareFootage ? Number(formData.squareFootage) : 0,
        ownerId: currentUser.id,
      };

      let record;
      if (isEdit) {
        // Update preserves fields this form doesn't manage (personal flag,
        // person link) — PocketBase only changes the keys we send.
        record = await pb.collection('homes').update(initialData.id, dataToSubmit, { $autoCancel: false });
        toast({ title: "Saved", description: "Home updated." });
      } else {
        record = await pb.collection('homes').create(dataToSubmit, { $autoCancel: false });
        toast({ title: "Added", description: "Home added." });
      }

      if (onSuccess) onSuccess(record);
      onClose();
    } catch (error) {
      console.error("Error saving home:", error);
      // PocketBase puts field-level validation reasons in response.data; the
      // top-level message is often just "Failed to create record." Pull the
      // first field error out so the user (and we) see what actually failed.
      const fieldErrors = error?.response?.data || error?.data || null;
      let detail = error.message || "Could not save the home.";
      if (fieldErrors && typeof fieldErrors === 'object') {
        const first = Object.entries(fieldErrors)[0];
        if (first) {
          const [field, info] = first;
          const msg = info && typeof info === 'object' ? (info.message || '') : String(info);
          detail = `${field}: ${msg}`.trim();
        }
      }
      toast({
        title: "Error",
        description: detail,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit home' : 'Add a home'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this home.'
              : 'Enter the details of your home below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Home name — optional friendly label ("Lake House", "Mom's Place"). */}
          <div className="space-y-2">
            <Label htmlFor="name">Home name <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Lake House"
            />
          </div>

          {/* Structured address. */}
          <div className="space-y-2">
            <Label htmlFor="street">Street address *</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apt">Apt / Suite / Unit <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Input
              id="apt"
              name="apt"
              value={formData.apt}
              onChange={handleChange}
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={(val) => handleSelectChange('state', val)}>
                <SelectTrigger>
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
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                name="zip"
                inputMode="numeric"
                maxLength={5}
                value={formData.zip}
                onChange={handleChange}
                placeholder="31522"
              />
            </div>
          </div>

          {/* Property type — USE category (Home / Vacation / Rental). */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type</Label>
            <Select value={formData.propertyType} onValueChange={(val) => handleSelectChange('propertyType', val)}>
              <SelectTrigger>
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
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min="0" value={formData.bedrooms} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" value={formData.bathrooms} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareFootage">Sq Ft</Label>
              <Input id="squareFootage" name="squareFootage" type="number" min="0" value={formData.squareFootage} onChange={handleChange} />
            </div>
          </div>

          {/* ── Rental mode parked here ──
              Earlier versions collected rentPrice + a vacant/occupied status.
              Removed for the homeowner-first v1 (those fields don't exist on
              the `homes` collection). 'Rental' stays in the type list; if a
              rental/property-manager mode returns, its fields re-attach here. */}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-white hover:opacity-90" style={{ background: '#1e3a5f' }}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Save home' : 'Add home'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;
