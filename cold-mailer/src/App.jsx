import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Plus, 
  Search, 
  Linkedin, 
  FileDown,
  ExternalLink,
  Users
} from 'lucide-react';

// --- Helper Functions ---

/**
 * Generates the search URLs for different services
 * @param {string} service - 'google', 'linkedin', 'experte'
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} company
 * @param {string} companyDomain
 * @returns {string} The full URL to open in a new tab
 */
const generateSearchUrl = (service, firstName, lastName, company, companyDomain) => {
  const fullName = `${firstName} ${lastName}`.trim();

  switch(service) {
    case 'google_company':
      // Searches Google for the company name to find its domain
      return `https://www.google.com/search?q=${encodeURIComponent(company + ' official website')}`;
    
    case 'linkedin':
      // Searches LinkedIn for the person at that company
      return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(fullName + ' ' + company)}`;
      
    case 'experte':
      // Searches EXPERTE.com's email finder (needs a domain)
      if (!companyDomain) return null;
      return `https://www.experte.com/email-finder?name=${encodeURIComponent(fullName)}&domain=${encodeURIComponent(companyDomain)}`;
      
    default:
      return null;
  }
};

/**
 * Generates a CSV file from the prospect list and triggers a download.
 * This is the "Export to Google Sheets" feature.
 * @param {object[]} prospects - The array of prospect objects
 */
const exportToCSV = (prospects) => {
  if (prospects.length === 0) {
    alert("Your prospect list is empty!");
    return;
  }

  // 1. Create the CSV headers
  const headers = "firstName,lastName,company,companyDomain,verifiedEmail,dateAdded";
  
  // 2. Create the data rows
  const rows = prospects.map(p => 
    [
      `"${p.firstName}"`,
      `"${p.lastName}"`,
      `"${p.company}"`,
      `"${p.companyDomain}"`,
      `"${p.email}"`,
      `"${p.dateAdded}"`
    ].join(',')
  ).join('\n');

  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;

  // 3. Create a link and trigger the download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "prospect_list.csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
};


// --- Main App Component ---
export default function App() {
  
  // --- State ---
  
  // State for the main form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [companyDomain, setCompanyDomain] = useState(''); // New field!
  const [verifiedEmail, setVerifiedEmail] =useState(''); // For the final logging
  
  // State for the prospect list (loaded from localStorage)
  const [prospects, setProspects] = useState(() => {
    try {
      const saved = localStorage.getItem('workflowProspects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [error, setError] = useState(null);

  // --- Effect ---
  // Save prospects to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('workflowProspects', JSON.stringify(prospects));
  }, [prospects]);
  

  // --- Handlers ---

  /**
   * Opens the search URL in a new tab
   */
  const handleSearch = (service) => {
    const url = generateSearchUrl(service, firstName, lastName, company, companyDomain);
    
    if (url) {
      window.open(url, '_blank');
    } else {
      setError(`You must enter a 'Company Domain' to use that search!`);
    }
  };

  /**
   * Saves the completed prospect to the list
   */
  const handleLogProspect = (e) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !company || !verifiedEmail) {
      setError("First Name, Company, and Verified Email are required to log a prospect.");
      return;
    }

    const newProspect = {
      id: Date.now().toString(),
      firstName,
      lastName,
      company,
      companyDomain,
      email: verifiedEmail,
      dateAdded: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    setProspects(prev => [newProspect, ...prev]);

    // Reset form fields for the next prospect
    setFirstName('');
    setLastName('');
    setCompany('');
    setCompanyDomain('');
    setVerifiedEmail('');
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-900 font-inter text-gray-200 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Prospecting Workflow Helper
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column (Input & Actions) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-5 text-white">1. Enter Prospect Info</h2>
              <form className="space-y-4">
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 left-3 top-3.5" />
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-gray-400 left-3 top-3.5" />
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <Building className="absolute w-5 h-5 text-gray-400 left-3 top-3.5" />
                  <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </form>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-5 text-white">2. Auto-Search (New Tab)</h2>
              <p className="text-sm text-gray-400 mb-4">Use these to find the info. New tabs will open.</p>
              <div className="space-y-3">
                <button onClick={() => handleSearch('google_company')} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span>Find Company Domain (Google)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button onClick={() => handleSearch('linkedin')} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Linkedin className="w-5 h-5" />
                  <span>Find Profile (LinkedIn)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                {/* This is the Email Verification step */}
                <p className="text-sm text-gray-400 pt-4">After finding the domain, enter it below:</p>
                <div className="relative">
                  <Building className="absolute w-5 h-5 text-gray-400 left-3 top-3.5" />
                  <input type="text" placeholder="company-domain.com" value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={() => handleSearch('experte')} disabled={!companyDomain} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                  <Search className="w-5 h-5" />
                  <span>Verify Email (EXPERTE.com)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-5 text-white">3. Log Verified Prospect</h2>
              <form onSubmit={handleLogProspect} className="space-y-4">
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 left-3 top-3.5" />
                  <input type="email" placeholder="Paste Verified Email Here" value={verifiedEmail} onChange={(e) => setVerifiedEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <Plus className="w-5 h-5 mr-2" />
                  Log Prospect to List
                </button>
              </form>
            </div>
          </div>

          {/* Right Column (Prospect List & Export) */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center mb-4 sm:mb-0">
                  <Users className="w-6 h-6 mr-3 text-white" />
                  My Prospect List ({prospects.length})
                </h2>
                {/* This is your Google Sheets feature! */}
                <button 
                  onClick={() => exportToCSV(prospects)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
                  >
                  <FileDown className="w-5 h-5" />
                  <span>Export to CSV (for Google Sheets)</span>
                </button>
              </div>
              
              <div className="flow-root">
                {prospects.length > 0 ? (
                  <ul className="divide-y divide-gray-700">
                    {prospects.map(p => (
                      <li key={p.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-white truncate">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              <Building className="w-4 h-4 inline -mt-1 mr-1.5" />
                              {p.company}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-400 truncate">
                              <Mail className="w-4 h-4 inline -mt-1 mr-1.5" />
                              {p.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.dateAdded}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-200">No prospects logged</h3>
                    <p className="mt-1 text-sm text-gray-400">Use the form to add your first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}