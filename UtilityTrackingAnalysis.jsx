import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    category: '',
    paymentLink: ''
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.name || initialData.companyName || '',
        category: initialData.category || '',
        paymentLink: initialData.payment_portal_url || initialData.paymentLink || ''
      });
    } else {
      setFormData({ companyName: '', category: '', paymentLink: '' });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.paymentLink.trim()) {
      newErrors.paymentLink = 'Payment portal URL is required';
    } else {
      try {
        // Basic URL validation
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[AddServiceCompanyForm] Form submission started. Current data:', formData);

    if (!validate()) {
      console.warn('[AddServiceCompanyForm] Validation failed. Errors:', errors);
      return;
    }

    if (!currentUser) {
      toast({ title: "Authentication required", description: "Please log in to add a company.", variant: "destructive" });
      return;
    }

    console.log('[AddServiceCompanyForm] Validation passed.');
    setIsLoading(true);

    try {
      // Ensure URL has protocol
      let finalUrl = formData.paymentLink.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      const dataToSave = {
        companyName: formData.companyName,
        paymentLink: finalUrl,
        ownerId: currentUser.id
      };

      console.log('[AddServiceCompanyForm] Attempting to create service company with data:', dataToSave);

      // Create a new service company for the user's dashboard
      const record = await pb.collection('service_companies').create(dataToSave, { $autoCancel: false });
      
      console.log('[AddServiceCompanyForm] Successfully created service company:', record);
      
      toast({ 
        title: "Company added successfully",
        description: `${record.companyName} has been added to your dashboard.`
      });
      
      // Reset form fields after successful submission
      setFormData({ companyName: '', category: '', paymentLink: '' });
      setErrors({});
      
      // Trigger the refresh callback for the listing component
      if (onCompanyAdded) {
        onCompanyAdded();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[AddServiceCompanyForm] Error creating service company:', error);
      toast({ 
        title: "Error saving company", 
        description: error.message || "An unexpected error occurred while saving.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      console.log('[AddServiceCompanyForm] Form submission process completed.');
    }
  };

  const isPreFilled = initialData && !initialData.id && initialData.name;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-start gap-3 mb-2">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Add a utility provider to your dashboard. This information will be available to help you connect to their payment portals.
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
        <Label htmlFor="paymentLink">Payment Portal URL <span className="text-red-500">*</span></Label>
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
          Save Company
        </Button>
      </div>
    </form>
  );
};

export default AddServiceCompanyForm;