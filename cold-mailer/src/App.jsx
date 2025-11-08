import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Search, 
  Linkedin, 
  Copy, 
  Download, 
  Brain, 
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

// --- AI Simulation Functions ---

/**
 * Simulates an AI generating likely email permutations.
 * @param {string} firstName - The prospect's first name.
 * @param {string} lastName - The prospect's last name.
 * @param {string} domain - The company's domain.
 * @returns {string} A newline-separated string of email guesses.
 */
const generateAIGuesses = (firstName, lastName, domain) => {
  if (!firstName || !lastName || !domain) {
    return "Please enter a first name, last name, and domain to generate guesses.";
  }

  const fn = firstName.toLowerCase();
  const ln = lastName.toLowerCase();
  const fi = fn[0] || '';
  const li = ln[0] || '';

  const patterns = [
    `${fn}.${ln}@${domain}`,
    `${fi}${ln}@${domain}`,
    `${fn}${li}@${domain}`,
    `${fn}@${domain}`,
    `${ln}@${domain}`,
    `${fn}_${ln}@${domain}`,
    `${fi}.${ln}@${domain}`,
    `${fn}${ln}@${domain}`,
    `${ln}.${fn}@${domain}`,
    `${fn[0]}${ln[0]}@${domain}`,
  ];

  return patterns.join('\n');
};

/**
 * Simulates an AI drafting a cold email.
 * @param {string} firstName - The prospect's first name.
 * @param {string} company - The prospect's company.
 * @returns {string} A drafted cold email.
 */
const draftAIEmail = (firstName, company) => {
  const myService = "[Your Service, e.g., 'modern web design']";
  const myValueProp = "[Your Value Prop, e.g., 'help companies increase user engagement']";
  const myName = "[Your Name]";

  if (!firstName) {
    return "Please enter at least a first name to draft an email.";
  }

  return `Subject: Quick question re: ${company}

Hi ${firstName},

I was on ${company}'s website and noticed you're the [Prospect's Title].

I specialize in ${myService} and ${myValueProp}. I had a quick idea on how you could [Specific Idea for Them].

Would you be open to a 10-minute chat next week if you're interested?

Best,

${myName}
`;
};

// --- Main App Component ---

export default function App() {
  // --- State ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  
  const [prospects, setProspects] = useState([]);
  const [showHelpers, setShowHelpers] = useState(true);
  const [aiGuesses, setAiGuesses] = useState('');
  const [aiDraft, setAiDraft] = useState('');

  // --- Load from LocalStorage on mount ---
  useEffect(() => {
    const storedProspects = localStorage.getItem('prospects');
    if (storedProspects) {
      setProspects(JSON.parse(storedProspects));
    }
  }, []);

  // --- Save to LocalStorage on change ---
  useEffect(() => {
    localStorage.setItem('prospects', JSON.stringify(prospects));
  }, [prospects]);

  // --- Event Handlers ---

  const handleMagicSearch = (service) => {
    let query = '';
    let url = '';

    switch (service) {
      case 'linkedin':
        query = `${firstName} ${lastName} ${company}`;
        url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
        break;
      case 'google':
        query = `${firstName} ${lastName} ${company} linkedin`;
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'domain':
        query = `${company} website`;
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGenerateAIGuesses = () => {
    const guesses = generateAIGuesses(firstName, lastName, domain);
    setAiGuesses(guesses);
  };
  
  const handleDraftAIEmail = () => {
    const draft = draftAIEmail(firstName, company);
    setAiDraft(draft);
  };

  const handleLogProspect = (e) => {
    e.preventDefault();
    if (!email || !firstName || !company) {
      alert('Please fill in at least First Name, Company, and Email to log a prospect.');
      return;
    }
    const newProspect = {
      id: Date.now(),
      firstName,
      lastName,
      company,
      domain,
      email,
      title,
      status: 'Not Contacted',
    };
    setProspects([newProspect, ...prospects]);
    
    // Clear the form
    setFirstName('');
    setLastName('');
    setCompany('');
    setDomain('');
    setEmail('');
    setTitle('');
    setAiGuesses('');
    setAiDraft('');
  };

  const handleDeleteProspect = (id) => {
    if (window.confirm('Are you sure you want to delete this prospect?')) {
      setProspects(prospects.filter(p => p.id !== id));
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setProspects(prospects.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
  };
  
  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }, () => {
      alert('Failed to copy.');
    });
  };

  const exportToCSV = () => {
    if (prospects.length === 0) {
      alert('No prospects to export!');
      return;
    }

    const headers = 'firstName,lastName,company,domain,email,title,status\n';
    const csvContent = prospects
      .map(p => 
        `"${p.firstName}","${p.lastName}","${p.company}","${p.domain}","${p.email}","${p.title}","${p.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-IS;,utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'prospect_list.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render ---
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* --- Main Input Panel --- */}
      <div className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-gray-950 flex flex-col space-y-6 shadow-2xl lg:h-screen lg:overflow-y-auto">
        
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Brain className="mr-3 text-indigo-400" size={32} />
          AI Prospecting Hub
        </h1>
        
        {/* --- Prospect Input Form --- */}
        <form onSubmit={handleLogProspect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Jane" 
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Doe" 
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Acme Inc." 
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company Domain</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="acme.com" 
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          {/* --- Magic Search Buttons --- */}
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => handleMagicSearch('linkedin')} className="flex items-center justify-center text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-all">
              <Linkedin size={16} className="mr-1.5" /> LinkedIn
            </button>
            <button type="button" onClick={() => handleMagicSearch('google')} className="flex items-center justify-center text-sm px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-all">
              <Search size={16} className="mr-1.5" /> Google
            </button>
            <button type="button" onClick={() => handleMagicSearch('domain')} className="flex items-center justify-center text-sm px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-all">
              <ExternalLink size={16} className="mr-1.5" /> Domain
            </button>
          </div>

          {/* --- AI Helper Tools --- */}
          <div className="pt-4 space-y-4">
            <h3 className="text-lg font-semibold text-indigo-300 border-b border-gray-700 pb-2">AI Helpers</h3>
            
            {/* AI Guesses */}
            <div className="space-y-2">
              <button type="button" onClick={handleGenerateAIGuesses} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-all">
                <Brain size={16} className="mr-1.5" /> Generate AI Guesses
              </button>
              <div className="relative">
                <textarea
                  readOnly
                  value={aiGuesses}
                  placeholder="AI-generated email patterns will appear here..."
                  className="w-full h-28 p-3 bg-gray-800 rounded-md border border-gray-700 text-sm resize-none"
                />
                <button type="button" onClick={() => handleCopyText(aiGuesses)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white bg-gray-700 rounded-md">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            
            {/* AI Draft */}
            <div className="space-y-2">
              <button type="button" onClick={handleDraftAIEmail} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-all">
                <Mail size={16} className="mr-1.5" /> Draft AI Email
              </button>
              <div className="relative">
                <textarea
                  value={aiDraft}
                  onChange={(e) => setAiDraft(e.target.value)}
                  placeholder="AI-drafted cold email will appear here..."
                  className="w-full h-40 p-3 bg-gray-800 rounded-md border border-gray-700 text-sm"
                />
                <button type="button" onClick={() => handleCopyText(aiDraft)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white bg-gray-700 rounded-md">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-700" />
          
          {/* --- Final Logging Form --- */}
          <h3 className="text-lg font-semibold text-green-300 pt-2">Log Verified Prospect</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
            <input 
              type="text" 
              placeholder="e.g., CEO, Head of Marketing" 
              className="w-full px-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Verified Email</label>
            <input 
              type="email" 
              placeholder="jane.doe@acme.com" 
              required
              className="w-full px-4 py-2 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 rounded-md text-lg font-bold transition-all">
            <Plus size={20} className="mr-2" /> Log Prospect
          </button>
        </form>

      </div>
      
      {/* --- Prospect List Panel --- */}
      <div className="w-full lg:w-2/3 xl:w-3/4 p-6 lg:h-screen lg:overflow-y-auto">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white">Prospect List ({prospects.length})</h2>
          <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all">
            <Download size={18} className="mr-2" /> Export to CSV
          </button>
        </div>
        
        {/* --- How To Use Section --- */}
        <div className="mb-6">
          <button 
            onClick={() => setShowHelpers(!showHelpers)} 
            className="text-lg font-semibold text-gray-300 flex items-center cursor-pointer"
          >
            How To Use This App
            {showHelpers ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
          </button>
          {showHelpers && (
            <div className="mt-2 p-4 bg-gray-800 rounded-md text-gray-300 space-y-2 text-sm">
              <p><strong>1. Find Target:</strong> Manually find a prospect on LinkedIn (e.g., Jane Doe @ Acme Inc.).</p>
              <p><strong>2. Enter Info:</strong> Fill in the First Name, Last Name, and Company in the form.</p>
              <p><strong>3. Search:</strong> Use the "Magic Search" buttons to find their company domain and confirm their profile.</p>
              <p><strong>4. Generate:</strong> Use "Generate AI Guesses" to get likely email patterns.</p>
              <p><strong>5. Verify:</strong> Use the "Gmail Hover Trick" or a free tool (like EXPERTE.com) to find the *real* email from the guess list.</p>
              <p><strong>6. Log:</strong> Enter the Verified Email and Job Title, then click "Log Prospect".</p>
              <p><strong>7. Draft & Send:</strong> Use "Draft AI Email" to get a template, copy it, and send your cold email!</p>
            </div>
          )}
        </div>

        {/* --- Prospect Table --- */}
        <div className="w-full overflow-x-auto">
          {prospects.length === 0 ? (
            <div className="text-center py-10 bg-gray-800 rounded-md">
              <FileText size={48} className="mx-auto text-gray-500" />
              <p className="mt-4 text-gray-400">Your logged prospects will appear here.</p>
            </div>
          ) : (
            <table className="min-w-full bg-gray-800 rounded-lg shadow">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 uppercase hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 uppercase hidden lg:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {prospects.map(prospect => (
                  <tr key={prospect.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{prospect.firstName} {prospect.lastName}</div>
                      <div className="text-sm text-gray-400 md:hidden">{prospect.company}</div>
                      <div className="text-sm text-gray-400">{prospect.title}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">{prospect.company}</td>
                    <td className="px-4 py-3 text-sm text-indigo-300 hidden lg:table-cell">{prospect.email}</td>
                    <td className="px-4 py-3">
                      <select 
                        value={prospect.status}
                        onChange={(e) => handleUpdateStatus(prospect.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>Not Contacted</option>
                        <option>Contacted</option>
                        <option>Replied</option>
                        <option>Meeting Set</option>
                        <option>Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteProspect(prospect.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
