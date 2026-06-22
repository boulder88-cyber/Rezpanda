import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useHome } from '@/contexts/HomeContext.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2, Building2, Info } from 'lucide-react';

const CATEGORIES = [
  'Electric',
  'Gas',
  'Water',
  'Internet/Cable',
  'Phone',
  'Trash/Recycling',
  'Pest Control',
  'Security',
  'Other'
];

const AddServiceCompanyForm = ({ onSuccess, onCancel, onCompanyAdded, initialData = null }) => {
  const { currentUser } = useAuth();
  const { selectedHome, homes } = useHome();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Are we editing an existing bill, or creating a new one?
  const isEditing = Boolean(initialData && initialData.id);

  // Only offer a property picker when there's a real choice to make.
  const multiHome = Array.isArray(homes) && homes.length > 1;

  // Sentinel for the "no property" choice. shadcn's SelectItem can't hold an
  // empty-string value, so we use a non-empty marker in the dropdown and
  // translate it back to '' (the real unassigned/"Other bills" state) on save.
  const NO_PROPERTY = '__none__';

  const [formData, setFormData] = useState({
    companyName: '',
    category: '',
    paymentLink: '',
    homeId: ''
  });

  // Seed the form when initialData changes.
  // - Editing: keep the bill's existing homeId/category (don't clobber).
  // - Creating: default homeId to the currently selected property.
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.name || initialData.companyName || '',
        category: initialData.category || '',
        paymentLink: initialData.payment_portal_url || initialData.paymentLink || '',
        homeId: initialData.homeId || (initialData.id ? '' : (selectedHome?.id || ''))
      });
    } else {
      setFormData({
        companyName: '',
        category: '',
        paymentLink: '',
        homeId: selectedHome?.id || ''
      });
    }
  }, [initialData, selectedHome]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    // Payment link is optional — emailed bills often arrive without one, and a
    // bill is still trackable and payable without it. Validate only if provided.
    if (formData.paymentLink.trim()) {
      try {
        let urlToTest = formData.paymentLink;
        if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
          urlToTest = 'https://' + urlToTest;
        }
        new URL(urlToTest);
      } catch (e) {
        newErrors.paymentLink = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  const handleHomeChange = (value) => {
    // Map the sentinel back to '' so the form's homeId stays the real value.
    const next = value === NO_PROPERTY ? '' : value;
    setFormData(prev => ({ ...prev, homeId: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!currentUser) {
      toast({ title: "Authentication required", description: "Please log in to add a company.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Ensure URL has protocol
      let finalUrl = formData.paymentLink.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      // ── Resolve or create the vendor (manual add) ──────────────────────
      // The pay URL belongs to the vendor, not the invoice. Manual entry has no
      // sender email, so we match the vendor by name only (case-insensitive),
      // scoped to this owner. Create one if absent; enrich an empty payUrl if we
      // now have one. Fail open: if vendor handling errors, the bill still saves
      // unlinked rather than blocking the user.
      let vendorId = '';
      try {
        const nameTrimmed = formData.companyName.trim();
        if (isEditing && initialData && initialData.vendorId) {
          // Editing an existing bill: keep its vendor link. Just enrich the
          // vendor's payUrl if the user supplied one and it was empty.
          vendorId = initialData.vendorId;
          if (formData.paymentLink.trim()) {
            await pb.collection('vendors').update(vendorId, { payUrl: finalUrl }, { $autoCancel: false });
          }
        } else if (nameTrimmed) {
          const found = await pb.collection('vendors').getList(1, 5, {
            filter: `ownerId = "${currentUser.id}" && name ~ "${nameTrimmed.replace(/"/g, '\\"')}"`,
            $autoCancel: false,
          });
          const exact = (found.items || []).find(
            (v) => (v.name || '').trim().toLowerCase() === nameTrimmed.toLowerCase()
          );
          const vendor = exact || (found.items && found.items[0]) || null;
          if (vendor) {
            vendorId = vendor.id;
            if (!vendor.payUrl && formData.paymentLink.trim()) {
              await pb.collection('vendors').update(vendor.id, { payUrl: finalUrl }, { $autoCancel: false });
            }
          } else {
            const created = await pb.collection('vendors').create({
              ownerId: currentUser.id,
              name: nameTrimmed,
              senderDomain: '',
              payUrl: formData.paymentLink.trim() ? finalUrl : '',
              phone: '', address: '', accountLast4: '',
            }, { $autoCancel: false });
            vendorId = created.id;
          }
        }
      } catch {
        vendorId = ''; // fail open — unlinked invoice beats a blocked save
      }

      // Base fields written on both create and edit. paymentLink lives on the
      // vendor now, so it is NOT written to the invoice.
      const dataToSave = {
        companyName: formData.companyName,
        ownerId: currentUser.id,
      };
      // Only write vendorId when we actually resolved one — never blank an
      // existing link because a lookup happened to fail.
      if (vendorId) {
        dataToSave.vendorId = vendorId;
      }

      // Category: save it (previously collected but dropped on save).
      // Only write when set, so we never overwrite an existing value with ''.
      if (formData.category) {
        dataToSave.category = formData.category;
      }

      // Property assignment:
      //  - Creating: only attach when a property is chosen/defaulted (don't
      //    write an empty string on create).
      //  - Editing: always write homeId — including '' — so choosing
      //    "Other bills (no property)" actually clears an existing assignment
      //    instead of being silently dropped.
      if (isEditing) {
        dataToSave.homeId = formData.homeId || '';
      } else if (formData.homeId) {
        dataToSave.homeId = formData.homeId;
      }

      let record;
      if (isEditing) {
        record = await pb.collection('invoices').update(initialData.id, dataToSave, { $autoCancel: false });
      } else {
        record = await pb.collection('invoices').create(dataToSave, { $autoCancel: false });
      }

      toast({
        title: isEditing ? "Bill updated" : "Company added successfully",
        description: `${record.companyName} has been ${isEditing ? 'updated' : 'added to your dashboard'}.`
      });

      // Reset form fields after a successful create (keep current-home default).
      if (!isEditing) {
        setFormData({ companyName: '', category: '', paymentLink: '', homeId: selectedHome?.id || '' });
      }
      setErrors({});

      if (onCompanyAdded) {
        onCompanyAdded();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[AddServiceCompanyForm] Error saving service company:', error);
      toast({
        title: "Error saving company",
        description: error.message || "An unexpected error occurred while saving.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPreFilled = initialData && !initialData.id && initialData.name;

  // Label for the home currently chosen — used in the single-home hint.
  const homeLabel = (h) => (h ? (h.name || h.address || 'Property') : '');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-start gap-3 mb-2">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add a provider to your dashboard. This information helps you connect to their payment portals.
        </p>
      </div>

      {isPreFilled && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3 mb-2">
          <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Setting up <span className="font-semibold text-primary">{formData.companyName}</span>. Please verify their details to complete the setup.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
        <Input
          id="companyName"
          name="companyName"
          placeholder="e.g., City Water Utility"
          value={formData.companyName}
          onChange={handleChange}
          className={errors.companyName ? "border-red-500" : ""}
        />
        {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
      </div>

      {/* Property assignment.
          - Multiple homes: show a picker, pre-selected to the current property.
          - Single home: no picker (nothing to choose); the bill silently
            defaults to that home via formData.homeId. */}
      {multiHome && (
        <div className="space-y-2">
          <Label htmlFor="homeId">Property</Label>
          <Select value={formData.homeId || NO_PROPERTY} onValueChange={handleHomeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {homes.map(h => (
                <SelectItem key={h.id} value={h.id}>{homeLabel(h)}</SelectItem>
              ))}
              <SelectItem value={NO_PROPERTY}>Other bills (no property)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">You can reassign this later in review.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentLink">Payment portal URL <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input
          id="paymentLink"
          name="paymentLink"
          placeholder="https://..."
          value={formData.paymentLink}
          onChange={handleChange}
          className={errors.paymentLink ? "border-red-500" : ""}
        />
        {errors.paymentLink && <p className="text-sm text-red-500">{errors.paymentLink}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Save Company'}
        </Button>
      </div>
    </form>
  );
};

export default AddServiceCompanyForm;
