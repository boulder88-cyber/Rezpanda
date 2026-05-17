import { useState, useEffect } from 'react';

export const usePasswordValidation = (password) => {
  const [isValid, setIsValid] = useState(false);
  const [requirements, setRequirements] = useState([
    { name: 'At least 8 characters', met: false },
    { name: 'At least one uppercase letter', met: false },
    { name: 'At least one number', met: false },
    { name: 'At least one special character (!@#$%^&*)', met: false },
  ]);

  useEffect(() => {
    const currentPassword = password || '';
    const reqs = [
      { name: 'At least 8 characters', met: currentPassword.length >= 8 },
      { name: 'At least one uppercase letter', met: /[A-Z]/.test(currentPassword) },
      { name: 'At least one number', met: /[0-9]/.test(currentPassword) },
      { name: 'At least one special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(currentPassword) },
    ];
    
    setRequirements(reqs);
    setIsValid(reqs.every(r => r.met));
  }, [password]);

  const validatePasswordMatch = (pass, confirmPass) => {
    if (!pass || !confirmPass) return false;
    return pass === confirmPass;
  };

  return { 
    isValid, 
    requirements, 
    validatePasswordMatch 
  };
};