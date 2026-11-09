import React, { createContext, useContext, useState, useEffect } from 'react';
import companyProfileService, { DEFAULT_COMPANY_PROFILE } from '../services/companyProfileService';

const CompanyProfileContext = createContext({
  company: DEFAULT_COMPANY_PROFILE,
  loading: false,
  refreshCompanyProfile: async () => { },
  updateCompanyProfile: async () => { },
});

export const CompanyProfileProvider = ({ children }) => {
  const [company, setCompany] = useState(() => {
    try {
      const raw = localStorage.getItem('nac_company_profile_cache_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) return parsed.data;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_COMPANY_PROFILE;
  });
  const [loading, setLoading] = useState(false);

  const refreshCompanyProfile = async (force = true) => {
    try {
      setLoading(true);
      const fresh = await companyProfileService.getProfile(force);
      setCompany(fresh);
      return fresh;
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyProfile = async (payload) => {
    const updated = await companyProfileService.updateProfile(payload);
    setCompany(updated);
    return updated;
  };

  useEffect(() => {
    companyProfileService.getProfile(false).then((data) => {
      if (data) setCompany(data);
    });
  }, []);

  return (
    <CompanyProfileContext.Provider
      value={{
        company,
        loading,
        refreshCompanyProfile,
        updateCompanyProfile,
      }}
    >
      {children}
    </CompanyProfileContext.Provider>
  );
};

export const useCompanyProfile = () => useContext(CompanyProfileContext);
export default CompanyProfileContext;

