import CategoryDetails from '@/components/dashboard/forms/categoryDetails';
import React, { use } from 'react';

// Form handling utilities
import * as z from 'zod';
import { useForm } from 'react-hook-form';

export default function AdminNewCategoryPage() {
  // Form hook form managing form state and validation
  const form = userForm<z.infer<typeof CategoryFormSchema>>;
  return (
    <div className="w-full">
      <CategoryDetails />
    </div>
  );
}
