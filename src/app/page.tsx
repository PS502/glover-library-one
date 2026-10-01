'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, MapPin, HeartHandshake, CheckCircle2, X, AlertCircle, RotateCcw, Gift, ShieldCheck, Lock, Download, RefreshCw, Calendar, UserCheck, ScanBarcode, QrCode } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  tags: string[];
  shelf: string;
  recommendedBy?: string;
  isWhartonFaculty?: boolean;
  isCheckedOut: boolean;
  checkedOutBy?: string;
  borrowerEmail?: string;
  dueDate?: string;
}

export default function Home() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    pennKey: '',
    isVerified: false,
  });

  const [verificationError, setVerificationError] = useState('');
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // RFID / Optical Scan Simulator States
  const [scannedCode, setScannedCode] = useState('');
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'success' | 'not-found'>('idle');

  // Admin Mode States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminError, setAdminError] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('glover_library_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.isVerified && parsed.email?.toLowerCase().endsWith('penn.edu')) {
          setUser(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved user state", e);
      }
    }
  }, []);

  const [activeModal, setActiveModal] = useState<'verify' | 'pdp' | 'checkout-confirm' | 'return-confirm' | 'scan' | 'donate' | 'admin-login' | 'admin-panel' | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [adminStockFilter, setAdminStockFilter] = useState<'all' | 'in-stock' | 'checked-out'>('all');

  const [donationForm, setDonationForm] = useState({
    title: '',
    author: '',
    tag: 'Strategic Management',
    donorName: '',
    donorCohort: "WG'26"
  });

  const whartonTags = [
    'All',
    'Wharton Faculty',
    'Strategic Management',
    'Macroeconomics',
    'Behavioral & Decision Science',
    'Operations',
    'Scaling',
    'Leadership & Culture',
    'Venture & Entrepreneurship',
    'Marketing',
    'AI for Business',
    'Finance',
    'Literature & Society'
  ];

  const handleTagToggle = (tag: string) => {
    if (tag === 'All') {
      setSelectedTags([]);
      return;
    }
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getCalculatedDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const extractPennKey = (emailAddress: string) => {
    if (!emailAddress.includes('@')) return '';
    return emailAddress.split('@')[0].trim().toLowerCase();
  };

  // Complete Catalog of 91 Books
  const [books, setBooks] = useState<Book[]>([
    { id: '1', title: "A Culture of Growth", author: "Joel Mokyr", isbn: "978-0691168883", tags: ["Strategic Management", "Macroeconomics"], shelf: "Dewey 330 - Economics", isCheckedOut: false },
    { id: '2', title: "A Giant Leap", author: "Robert Wachter", isbn: "978-0071840118", tags: ["Operations", "Scaling"], shelf: "Dewey 658 - Operations", isCheckedOut: false },
    { id: '3', title: "A Wonderful Life", author: "Frank Martela", isbn: "978-0062958440", tags: ["Literature & Society"], shelf: "Dewey 170 - Philosophy", isCheckedOut: false },
    { id: '4', title: "Bad Samaritans", author: "Ha-Joon Chang", isbn: "978-1596915985", tags: ["Macroeconomics"], shelf: "Dewey 330 - Global Economy", isCheckedOut: false },
    { id: '5', title: "Brick by Brick", author: "David Robertson", isbn: "978-0307951601", tags: ["Wharton Faculty", "Scaling", "Strategic Management"], shelf: "Dewey 658 - Strategy", isWhartonFaculty: true, isCheckedOut: false },
    { id: '6', title: "Change by Design", author: "Tim Brown", isbn: "978-0061766084", tags: ["Behavioral & Decision Science", "Marketing"], shelf: "Dewey 658 - Design Thinking", isCheckedOut: false },
    { id: '7', title: "Chokepoints", author: "Edward Fishman", isbn: "978-0063236028", tags: ["Strategic Management", "Macroeconomics"], shelf: "Dewey 320 - Geopolitics", isCheckedOut: false },
    { id: '8', title: "Clear Thinking", author: "Shane Parrish", isbn: "978-0593086193", tags: ["Behavioral & Decision Science"], shelf: "Dewey 153 - Cognition", recommendedBy: "Gerald Glover (WG'26)", isCheckedOut: false },
    { id: '9', title: "Close the Gap & Get Your Share", author: "A. J. Cacho", tags: ["Marketing", "Finance"], shelf: "Dewey 658 - Sales", isCheckedOut: false },
    { id: '10', title: "Culpability", author: "Bruce Holsinger", isbn: "978-0593491416", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '11', title: "Dark Horse", author: "Todd Rose & Ogi Ogas", isbn: "978-0062683632", tags: ["Leadership & Culture"], shelf: "Dewey 158 - Performance", isCheckedOut: false },
    { id: '12', title: "Democracy's Detectives", author: "James T. Hamilton", isbn: "978-0674545588", tags: ["Literature & Society"], shelf: "Dewey 070 - Media", isCheckedOut: false },
    { id: '13', title: "Do the Right Thing", author: "Parker", tags: ["Leadership & Culture"], shelf: "Dewey 174 - Ethics", isCheckedOut: false },
    { id: '14', title: "Excellent Advice for Living", author: "Kevin Kelly", isbn: "978-0593654521", tags: ["Leadership & Culture"], shelf: "Dewey 170 - Life Strategy", isCheckedOut: false },
    { id: '15', title: "Finding My Virginity", author: "Richard Branson", isbn: "978-1524760205", tags: ["Venture & Entrepreneurship", "Scaling"], shelf: "Dewey 920 - Biography", isCheckedOut: false },
    { id: '16', title: "First, Break All the Rules", author: "Marcus Buckingham & Curt Coffman", isbn: "978-1599928968", tags: ["Leadership & Culture", "Operations"], shelf: "Dewey 658 - Management", isCheckedOut: false },
    { id: '17', title: "Fizz", author: "Zyman", tags: ["Marketing"], shelf: "Dewey 658 - Branding", isCheckedOut: false },
    { id: '18', title: "Good Boss, Bad Boss", author: "Robert I. Sutton", isbn: "978-0446556408", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Leadership", isCheckedOut: false },
    { id: '19', title: "High Output Management", author: "Andrew S. Grove", isbn: "978-0679762881", tags: ["Operations", "Scaling"], shelf: "Dewey 658 - Operations", isCheckedOut: false },
    { id: '20', title: "High-Hanging Fruit", author: "Mark Rampolla", isbn: "978-1101980751", tags: ["Venture & Entrepreneurship"], shelf: "Dewey 658 - Startups", isCheckedOut: false },
    { id: '21', title: "History Has Begun", author: "Bruno Maçães", isbn: "978-0197546505", tags: ["Macroeconomics", "Literature & Society"], shelf: "Dewey 320 - Political Theory", isCheckedOut: false },
    { id: '22', title: "How to American", author: "Jimmy O. Yang", isbn: "978-0316562560", tags: ["Literature & Society"], shelf: "Dewey 792 - Memoir", isCheckedOut: false },
    { id: '23', title: "How We Work", author: "Leah Weiss", isbn: "978-0062688002", tags: ["Leadership & Culture", "Behavioral & Decision Science"], shelf: "Dewey 158 - Mindfulness", isCheckedOut: false },
    { id: '24', title: "Interior Chinatown", author: "Charles Yu", isbn: "978-0525521198", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '25', title: "It's Your Ship", author: "Michael Abrashoff", isbn: "978-0937552131", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Command", isCheckedOut: false },
    { id: '26', title: "Klara and the Sun", author: "Kazuo Ishiguro", isbn: "978-0593318171", tags: ["AI for Business", "Literature & Society"], shelf: "Dewey 823 - Fiction", isCheckedOut: false },
    { id: '27', title: "Lead with a Story", author: "Paul Smith", isbn: "978-0814420300", tags: ["Leadership & Culture", "Marketing"], shelf: "Dewey 658 - Communication", isCheckedOut: false },
    { id: '28', title: "Leading Change", author: "John P. Kotter", isbn: "978-1422186435", tags: ["Leadership & Culture", "Strategic Management"], shelf: "Dewey 658 - Change Management", isCheckedOut: false },
    { id: '29', title: "Leading Out Loud", author: "Terry Pearce", isbn: "978-1118430880", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Executive Presence", isCheckedOut: false },
    { id: '30', title: "Looptail", author: "Bruce Poon Tip", isbn: "978-0241969243", tags: ["Venture & Entrepreneurship", "Leadership & Culture"], shelf: "Dewey 658 - Social Enterprise", isCheckedOut: false },
    { id: '31', title: "Man's Search for Meaning", author: "Viktor E. Frankl", isbn: "978-0807014295", tags: ["Behavioral & Decision Science", "Literature & Society"], shelf: "Dewey 150 - Psychology", isCheckedOut: false },
    { id: '32', title: "Meditations for Mortals", author: "Oliver Burkeman", isbn: "978-0593443316", tags: ["Behavioral & Decision Science"], shelf: "Dewey 158 - Time & Life", isCheckedOut: false },
    { id: '33', title: "Moneyball", author: "Michael Lewis", isbn: "978-0393324815", tags: ["Behavioral & Decision Science", "Operations"], shelf: "Dewey 796 - Analytics", isCheckedOut: false },
    { id: '34', title: "Move", author: "Parag Khanna", isbn: "978-1982146634", tags: ["Macroeconomics"], shelf: "Dewey 304 - Demographics", isCheckedOut: false },
    { id: '35', title: "No Fear of Failure", author: "Gary Burnison", isbn: "978-1118105740", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Executive Leadership", isCheckedOut: false },
    { id: '36', title: "North Woods", author: "Daniel Mason", isbn: "978-0593597033", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '37', title: "Obviously Awesome", author: "April Dunford", isbn: "978-1999023003", tags: ["Marketing", "Scaling"], shelf: "Dewey 658 - Product Positioning", isCheckedOut: false },
    { id: '38', title: "Operations Strategy", author: "Jan A. Van Mieghem", isbn: "978-0982828601", tags: ["Wharton Faculty", "Operations"], shelf: "Dewey 658 - Operations", isWhartonFaculty: true, isCheckedOut: false },
    { id: '39', title: "Our Least Important Asset", author: "Peter Cappelli", isbn: "978-0190000000", tags: ["Wharton Faculty", "Leadership & Culture", "Finance"], shelf: "Dewey 658 - Human Capital", isWhartonFaculty: true, isCheckedOut: false },
    { id: '40', title: "Out of the Gobi", author: "Weijian Shan", isbn: "978-1119529125", tags: ["Finance", "Macroeconomics"], shelf: "Dewey 920 - Private Equity", isCheckedOut: false },
    { id: '41', title: "Outside In / Inside Out", author: "Lance Mortlock", isbn: "978-1988383200", tags: ["Strategic Management"], shelf: "Dewey 658 - Strategy", isCheckedOut: false },
    { id: '42', title: "Parachuting Cats Into Borneo", author: "Alan Kline & Rick Thoman", isbn: "978-1599920115", tags: ["Strategic Management"], shelf: "Dewey 658 - Systems Thinking", isCheckedOut: false },
    { id: '43', title: "Pedal to the Metal Leadership", author: "Arlen Burger", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Executive Coaching", isCheckedOut: false },
    { id: '44', title: "Platform Revolution", author: "Geoffrey G. Parker et al.", isbn: "978-0393249132", tags: ["Scaling", "AI for Business", "Strategic Management"], shelf: "Dewey 658 - Platform Business Models", isCheckedOut: false },
    { id: '45', title: "Playground", author: "Richard Powers", isbn: "978-0393868142", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '46', title: "Poverty, by America", author: "Matthew Desmond", isbn: "978-0593239919", tags: ["Macroeconomics", "Literature & Society"], shelf: "Dewey 362 - Social Policy", isCheckedOut: false },
    { id: '47', title: "Read Write Own", author: "Chris Dixon", isbn: "978-0593731512", tags: ["AI for Business", "Venture & Entrepreneurship"], shelf: "Dewey 004 - Decentralized Tech", isCheckedOut: false },
    { id: '48', title: "Repeatability", author: "Chris Zook & James Allen", isbn: "978-1422173305", tags: ["Scaling", "Strategic Management"], shelf: "Dewey 658 - Business Models", isCheckedOut: false },
    { id: '49', title: "Samuelson Friedman", author: "Nicholas Wapshott", isbn: "978-0393245110", tags: ["Macroeconomics", "Finance"], shelf: "Dewey 330 - Economic Thought", isCheckedOut: false },
    { id: '50', title: "Scaling Up Excellence", author: "Robert I. Sutton & Huggy Rao", isbn: "978-0385348362", tags: ["Scaling", "Operations"], shelf: "Dewey 658 - Organizational Scale", isCheckedOut: false },
    { id: '51', title: "Stacking the Deck", author: "David Geffen", tags: ["Venture & Entrepreneurship"], shelf: "Dewey 658 - Negotiation", isCheckedOut: false },
    { id: '52', title: "Stocks for the Long Run", author: "Jeremy Siegel", isbn: "978-0071800518", tags: ["Wharton Faculty", "Finance", "Macroeconomics"], shelf: "Dewey 332 - Investments", isWhartonFaculty: true, isCheckedOut: false },
    { id: '53', title: "Strategy from the Outside In", author: "George S. Day & Christine Moorman", isbn: "978-0071739344", tags: ["Wharton Faculty", "Strategic Management", "Marketing"], shelf: "Dewey 658 - Market-Driven Strategy", isWhartonFaculty: true, isCheckedOut: false },
    { id: '54', title: "This Time Is Different", author: "Carmen M. Reinhart & Kenneth S. Rogoff", isbn: "978-0691143583", tags: ["Finance", "Macroeconomics"], shelf: "Dewey 332 - Financial Crises", isCheckedOut: false },
    { id: '55', title: "The Art of Work", author: "Jeff Goins", isbn: "978-0718022075", tags: ["Leadership & Culture"], shelf: "Dewey 158 - Career Calling", isCheckedOut: false },
    { id: '56', title: "The Culture Code", author: "Daniel Coyle", isbn: "978-0804176989", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Group Dynamics", isCheckedOut: false },
    { id: '57', title: "The Diary of Anaïs Nin", author: "Anaïs Nin", isbn: "978-0156260275", tags: ["Literature & Society"], shelf: "Dewey 818 - Autobiography", isCheckedOut: false },
    { id: '58', title: "The Fire Next Time", author: "James Baldwin", isbn: "978-0679744726", tags: ["Literature & Society"], shelf: "Dewey 305 - Social Criticism", isCheckedOut: false },
    { id: '59', title: "The Future of the Office", author: "Peter Cappelli", isbn: "978-1586480000", tags: ["Wharton Faculty", "Operations", "Leadership & Culture"], shelf: "Dewey 658 - Future of Work", isWhartonFaculty: true, isCheckedOut: false },
    { id: '60', title: "The Go Point", author: "Michael Useem", isbn: "978-1400080618", tags: ["Wharton Faculty", "Behavioral & Decision Science", "Leadership & Culture"], shelf: "Dewey 658 - Decision Making", isWhartonFaculty: true, isCheckedOut: false },
    { id: '61', title: "The Growth Dilemma", author: "Clayton M. Christensen", isbn: "978-0875845852", tags: ["Scaling", "Strategic Management"], shelf: "Dewey 658 - Innovation", isCheckedOut: false },
    { id: '62', title: "The Hard Thing About Hard Things", author: "Ben Horowitz", isbn: "978-0062273208", tags: ["Venture & Entrepreneurship", "Leadership & Culture"], shelf: "Dewey 658 - Startup Execution", isCheckedOut: false },
    { id: '63', title: "The Hidden Life of Trees", author: "Peter Wohlleben", isbn: "978-1771642484", tags: ["Literature & Society"], shelf: "Dewey 582 - Ecology", isCheckedOut: false },
    { id: '64', title: "The High-Velocity Edge", author: "Steven J. Spear", isbn: "978-0071741125", tags: ["Operations", "Scaling"], shelf: "Dewey 658 - Agile Operations", isCheckedOut: false },
    { id: '65', title: "The Inevitable", author: "Kevin Kelly", isbn: "978-0525428084", tags: ["AI for Business", "Scaling"], shelf: "Dewey 303 - Tech Trends", isCheckedOut: false },
    { id: '66', title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", isbn: "978-0765387561", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '67', title: "The Leadership Challenge", author: "James Kouzes & Barry Posner", isbn: "978-0787984922", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Leadership", isCheckedOut: false },
    { id: '68', title: "The Life Cycle of a CEO", author: "Kohllesen & Stark", tags: ["Leadership & Culture"], shelf: "Dewey 658 - CEO Dynamics", isCheckedOut: false },
    { id: '69', title: "The McKinsey Mind", author: "Ethan M. Rasiel & Paul N. Friga", isbn: "978-0071374293", tags: ["Strategic Management", "Operations"], shelf: "Dewey 658 - Problem Solving", isCheckedOut: false },
    { id: '70', title: "The Mission", author: "Tim Weiner", isbn: "978-0385503419", tags: ["Literature & Society"], shelf: "Dewey 327 - Intelligence", isCheckedOut: false },
    { id: '71', title: "The Other \"F\" Word", author: "John Danner & Mark Coopersmith", isbn: "978-1118938614", tags: ["Behavioral & Decision Science", "Leadership & Culture"], shelf: "Dewey 658 - Failure Management", isCheckedOut: false },
    { id: '72', title: "The Other Americans", author: "Laila Lalami", isbn: "978-0525520337", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '73', title: "The Power of Habit", author: "Charles Duhigg", isbn: "978-0812981605", tags: ["Behavioral & Decision Science"], shelf: "Dewey 153 - Habit Psychology", isCheckedOut: false },
    { id: '74', title: "The Progress Principle", author: "Teresa Amabile & Steven Kramer", isbn: "978-1422198575", tags: ["Leadership & Culture", "Behavioral & Decision Science"], shelf: "Dewey 658 - Work Psychology", isCheckedOut: false },
    { id: '75', title: "The Rise and Fall of American Growth", author: "Robert J. Gordon", isbn: "978-0691147727", tags: ["Macroeconomics"], shelf: "Dewey 330 - Economic History", isCheckedOut: false },
    { id: '76', title: "The Road", author: "Cormac McCarthy", isbn: "978-0307387899", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '77', title: "The Seventh Power", author: "Gary F. Hart", isbn: "978-0190224165", tags: ["Macroeconomics", "Strategic Management"], shelf: "Dewey 327 - Geopolitics", isCheckedOut: false },
    { id: '78', title: "The Slight Edge", author: "Jeff Olson", isbn: "978-1626340466", tags: ["Behavioral & Decision Science"], shelf: "Dewey 158 - Personal Discipline", isCheckedOut: false },
    { id: '79', title: "The Soul of the Corporation", author: "Hamid Bouchikhi & John R. Kimberly", isbn: "978-0132338226", tags: ["Wharton Faculty", "Leadership & Culture"], shelf: "Dewey 658 - Corporate Identity", isWhartonFaculty: true, isCheckedOut: false },
    { id: '80', title: "The Truth About Leadership", author: "James M. Kouzes & Barry Z. Posner", isbn: "978-0470633540", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Fundamentals", isCheckedOut: false },
    { id: '81', title: "The Underground Railroad", author: "Colson Whitehead", isbn: "978-0385542364", tags: ["Literature & Society"], shelf: "Dewey 813 - Fiction", isCheckedOut: false },
    { id: '82', title: "The Upstarts", author: "Brad Stone", isbn: "978-0316388399", tags: ["Venture & Entrepreneurship", "Scaling"], shelf: "Dewey 658 - Silicon Valley", isCheckedOut: false },
    { id: '83', title: "The World Is Flat", author: "Thomas L. Friedman", isbn: "978-0374292881", tags: ["Macroeconomics"], shelf: "Dewey 337 - Globalization", isCheckedOut: false },
    { id: '84', title: "Tuesdays with Morrie", author: "Mitch Albom", isbn: "978-0767905923", tags: ["Literature & Society"], shelf: "Dewey 920 - Memoir", isCheckedOut: false },
    { id: '85', title: "Turn the Ship Around!", author: "L. David Marquet", isbn: "978-1591846406", tags: ["Leadership & Culture", "Operations"], shelf: "Dewey 658 - Intent-Based Leadership", isCheckedOut: false },
    { id: '86', title: "West Scale", author: "Geoffrey West", isbn: "978-1594205804", tags: ["Scaling", "AI for Business"], shelf: "Dewey 300 - Complexity Theory", isCheckedOut: false },
    { id: '87', title: "What Got You Here Won't Get You There", author: "Marshall Goldsmith", isbn: "978-1401313258", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Executive Growth", isCheckedOut: false },
    { id: '88', title: "What Went Wrong with Capitalism", author: "Ruchir Sharma", isbn: "978-0593732230", tags: ["Macroeconomics", "Finance"], shelf: "Dewey 330 - Global Markets", isCheckedOut: false },
    { id: '89', title: "Where Am I Going?", author: "Career Management", tags: ["Leadership & Culture"], shelf: "Dewey 658 - Executive Career", isCheckedOut: false },
    { id: '90', title: "Why Growth Matters", author: "Jagdish Bhagwati & Arvind Panagariya", isbn: "978-0465037223", tags: ["Macroeconomics"], shelf: "Dewey 338 - Economic Development", isCheckedOut: false },
    { id: '91', title: "Working Backwards", author: "Colin Bryar & Bill Carr", isbn: "978-1250267597", tags: ["Operations", "Scaling", "Leadership & Culture"], shelf: "Dewey 658 - Amazon Culture", isCheckedOut: false }
  ]);

  const handleSimulateScan = (codeToScan?: string) => {
    const targetCode = (codeToScan || scannedCode).trim().toLowerCase();
    if (!targetCode) return;

    setScannerStatus('scanning');

    setTimeout(() => {
      const found = books.find(b => 
        b.id === targetCode ||
        (b.isbn && b.isbn.replace(/[^0-9]/g, '').includes(targetCode.replace(/[^0-9]/g, ''))) ||
        b.title.toLowerCase().includes(targetCode)
      );

      if (found) {
        setScannerStatus('success');
        setSelectedBook(found);
        setTimeout(() => {
          if (found.isCheckedOut) {
            setActiveModal('return-confirm');
          } else {
            setActiveModal(user.isVerified ? 'checkout-confirm' : 'verify');
          }
          setScannerStatus('idle');
          setScannedCode('');
        }, 500);
      } else {
        setScannerStatus('not-found');
      }
    }, 600);
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === 'Bound2BeAGoodBook') {
      setIsAdminLoggedIn(true);
      setAdminError(false);
      setActiveModal('admin-panel');
    } else {
      setAdminError(true);
    }
  };

  const handleToggleStockStatus = (bookId: string) => {
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        const isCheckingOut = !b.isCheckedOut;
        return {
          ...b,
          isCheckedOut: isCheckingOut,
          checkedOutBy: isCheckingOut ? (user.name || 'Admin Override') : undefined,
          borrowerEmail: isCheckingOut ? (user.email || 'N/A') : undefined,
          dueDate: isCheckingOut ? getCalculatedDueDate() : undefined
        };
      }
      return b;
    }));
  };

  const handleExportCSV = () => {
    const headers = ["ID,Title,Author,ISBN,Shelf,Status,CheckedOutBy,BorrowerEmail,DueDate\n"];
    const rows = books.map(b => 
      `"${b.id}","${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${b.isbn || ''}","${b.shelf}","${b.isCheckedOut ? 'Borrowed' : 'Available'}","${b.checkedOutBy || ''}","${b.borrowerEmail || ''}","${b.dueDate || ''}"`
    );
    const blob = new Blob([...headers, rows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glover_library_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (!user.name.trim()) {
      setVerificationError('Full Name is required.');
      return;
    }

    const cleanEmail = user.email.trim().toLowerCase();
    if (!cleanEmail) {
      setVerificationError('Penn email is required.');
      return;
    }

    if (!cleanEmail.endsWith('penn.edu')) {
      setVerificationError('Please enter a valid Penn email address ending in penn.edu (e.g. username@wharton.upenn.edu).');
      return;
    }

    const derivedPennKey = extractPennKey(cleanEmail);

    const verifiedProfile = {
      name: user.name.trim(),
      email: cleanEmail,
      pennKey: derivedPennKey,
      isVerified: true
    };

    setUser(verifiedProfile);
    localStorage.setItem('glover_library_user', JSON.stringify(verifiedProfile));

    if (selectedBook) {
      setActiveModal('checkout-confirm');
    } else {
      setActiveModal(null);
    }
  };

  const handleInitiateBorrow = (book: Book) => {
    setSelectedBook(book);

    const savedUser = localStorage.getItem('glover_library_user');
    const isAlreadyVerified = user.isVerified || (savedUser && JSON.parse(savedUser).isVerified);

    if (isAlreadyVerified) {
      setActiveModal('checkout-confirm');
    } else {
      setActiveModal('verify');
    }
  };

  const handleConfirmReturn = (bookId: string) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { 
      ...b, 
      isCheckedOut: false, 
      checkedOutBy: undefined, 
      borrowerEmail: undefined, 
      dueDate: undefined 
    } : b));
    setActiveModal(null);
    alert("Book return logged! Please return the book to its shelf position.");
  };

  const handleConfirmBorrow = async () => {
    if (!selectedBook) return;
    setIsSubmittingCheckout(true);

    const calculatedDue = getCalculatedDueDate();
    const currentTimestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    setBooks(prev => prev.map(b => b.id === selectedBook.id ? {
      ...b,
      isCheckedOut: true,
      checkedOutBy: user.name,
      borrowerEmail: user.email,
      dueDate: calculatedDue
    } : b));

    try {
      await fetch('/api/send-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          pennKey: user.pennKey || extractPennKey(user.email),
          bookTitle: selectedBook.title,
          bookAuthor: selectedBook.author,
          shelf: selectedBook.shelf,
          checkoutTimestamp: currentTimestamp,
          dueDate: calculatedDue
        }),
      });
    } catch (err) {
      console.error("Failed to notify library admin", err);
    } finally {
      setIsSubmittingCheckout(false);
      setActiveModal(null);
      alert(`Check-out recorded! You can pick up the volume directly from ${selectedBook.shelf} at 2 Harrison St. Confirmation sent to ${user.email}.`);
    }
  };

  const handleDonateBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.title || !donationForm.author || !donationForm.donorName) {
      alert("Please fill in the book title, author, and donor name.");
      return;
    }

    const newBook: Book = {
      id: Date.now().toString(),
      title: donationForm.title,
      author: donationForm.author,
      tags: [donationForm.tag],
      shelf: "Dewey 658 - General Executive",
      recommendedBy: `Donated by ${donationForm.donorName} (${donationForm.donorCohort})`,
      isCheckedOut: false
    };

    setBooks(prev => [newBook, ...prev]);
    setDonationForm({ title: '', author: '', tag: 'Strategic Management', donorName: '', donorCohort: "WG'26" });
    setActiveModal(null);
    alert(`Thank you! "${newBook.title}" has been registered. Please drop off your book at 2 Harrison St, Fl 6!`);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.shelf.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (book.isbn && book.isbn.includes(searchQuery));
    
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => book.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const adminFilteredBooks = books.filter(book => {
    if (adminStockFilter === 'in-stock') return !book.isCheckedOut;
    if (adminStockFilter === 'checked-out') return book.isCheckedOut;
    return true;
  });

  return (
    <div className="min-h-screen bg-canvas text-charcoal font-sans selection:bg-wharton-red selection:text-white">
      {/* Header / Brand Nav */}
      <header className="border-b border-wharton-navy/10 px-6 py-8 md:px-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-wharton-red font-semibold mb-1">
            <span>Wharton Executive MBA</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-wharton-navy/70">
              <MapPin className="w-3 h-3 text-wharton-red" /> 2 Harrison St, Fl 6 (612-615 Break Area)
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-wharton-navy tracking-tight">Glover Library</h1>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 text-sm font-medium">
          <button 
            onClick={() => setActiveModal('scan')}
            className="flex items-center gap-1.5 bg-wharton-navy text-white px-3.5 py-2 text-xs tracking-wider uppercase hover:bg-wharton-red transition-colors font-semibold shadow-sm"
          >
            <ScanBarcode className="w-4 h-4" /> Scan RFID / Barcode
          </button>
          <button 
            onClick={() => setActiveModal(isAdminLoggedIn ? 'admin-panel' : 'admin-login')}
            className="flex items-center gap-1.5 border border-wharton-navy/20 text-wharton-navy px-3 py-2 text-xs tracking-wider uppercase hover:bg-wharton-navy hover:text-white transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-wharton-red" /> {isAdminLoggedIn ? 'Admin Active' : 'Admin Portal'}
          </button>
          <button 
            onClick={() => setActiveModal('donate')}
            className="flex items-center gap-1.5 border border-wharton-navy/20 text-wharton-navy px-3.5 py-2 text-xs tracking-wider uppercase hover:bg-wharton-navy hover:text-white transition-colors"
          >
            <Gift className="w-4 h-4 text-wharton-red" /> Donate Book
          </button>
          <button 
            onClick={() => setActiveModal('verify')}
            className={`flex items-center gap-1.5 border px-3.5 py-2 text-xs tracking-wider uppercase transition-colors ${user.isVerified ? 'border-emerald-700 text-emerald-800 bg-emerald-50' : 'border-wharton-navy/20 text-wharton-navy hover:bg-wharton-navy hover:text-white'}`}
          >
            <UserCheck className="w-4 h-4 text-wharton-red" /> {user.isVerified ? `✓ ${user.name.split(' ')[0]}` : 'Verify PennID Card'}
          </button>
        </div>
      </header>

      {/* Editorial Hero */}
      <section className="px-6 py-12 md:px-16 max-w-5xl mx-auto text-center">
        <span className="inline-block border border-wharton-navy/20 px-3 py-1 text-xs uppercase tracking-widest text-wharton-navy mb-4">
          By WEMBA, For WEMBA • RFID / Optical Checkout System
        </span>
        <h2 className="font-serif text-3xl md:text-5xl leading-tight text-wharton-navy mb-4">
          Where community meets access — extending learning beyond the classroom.
        </h2>
        <p className="text-sm md:text-base text-charcoal/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          Founded and curated by <strong>Gerald Glover (WG’26)</strong>, Glover Library is a self-sustaining knowledge hub. Scan shelf tags at 2 Harrison St or check out books directly below.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, ISBN, tag, or Dewey classification..."
            className="w-full bg-white/90 border border-wharton-navy/20 py-4 pl-12 pr-4 font-serif placeholder:font-sans placeholder:text-subtle focus:outline-none focus:border-wharton-navy text-lg shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wharton-navy/50" />
        </div>
      </section>

      {/* Operational Highlight */}
      <section className="bg-wharton-navy text-canvas py-8 px-6 md:px-16 my-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col md:flex-row items-center justify-center gap-4">
          <HeartHandshake className="w-8 h-8 text-wharton-red shrink-0" />
          <div>
            <h4 className="font-serif text-xl text-white">Borrow freely. Scan on shelf. Return thoughtfully.</h4>
            <p className="text-xs text-canvas/70 mt-1">Tap 'Scan RFID / Barcode' to borrow physical books directly at the shelf.</p>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="px-6 py-10 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-wharton-navy/60">Collection Catalog</span>
            <h3 className="font-serif text-2xl text-wharton-navy mt-1 flex items-center gap-2">
              Titles ({filteredBooks.length}) <Sparkles className="w-4 h-4 text-wharton-red" />
            </h3>
          </div>
          
          {/* Multi-Tag Filter Bar */}
          <div className="flex flex-wrap gap-2 text-xs">
            {whartonTags.map((tag) => {
              const isSelected = tag === 'All' ? selectedTags.length === 0 : selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 border transition-colors ${
                    isSelected 
                      ? 'bg-wharton-navy text-white border-wharton-navy' 
                      : 'bg-white border-wharton-navy/20 text-charcoal hover:border-wharton-navy'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              className={`bg-white p-6 border transition-all flex flex-col justify-between ${book.isCheckedOut ? 'border-dashed border-wharton-navy/30 bg-white/50' : 'border-wharton-navy/10 hover:border-wharton-navy'}`}
            >
              <div>
                <div className="flex justify-between items-start text-xs text-subtle mb-3">
                  <span className="text-wharton-red font-semibold">{book.shelf}</span>
                </div>

                <h4 
                  onClick={() => { setSelectedBook(book); setActiveModal('pdp'); }}
                  className="font-serif text-xl text-wharton-navy mb-1 cursor-pointer hover:text-wharton-red transition-colors"
                >
                  {book.title}
                </h4>
                <p className="text-sm text-charcoal/80 mb-2">{book.author}</p>
                {book.isbn && <p className="text-[10px] font-mono text-subtle mb-4">ISBN: {book.isbn}</p>}

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {book.tags.map((t, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] px-2 py-0.5 border bg-canvas text-wharton-navy border-wharton-navy/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-canvas flex justify-between items-center text-xs">
                <div>
                  {book.isCheckedOut ? (
                    <span className="text-wharton-red font-medium flex items-center gap-1">
                      ● Borrowed
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      ● Available
                    </span>
                  )}
                </div>
                {book.isCheckedOut ? (
                  <button 
                    onClick={() => { setSelectedBook(book); setActiveModal('return-confirm'); }}
                    className="bg-emerald-700 text-white px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInitiateBorrow(book)}
                    className="bg-wharton-navy text-white px-3.5 py-1.5 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <ScanBarcode className="w-3.5 h-3.5" /> Borrow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: RFID / Barcode Scanner Simulator */}
      {activeModal === 'scan' && (
        <div className="fixed inset-0 bg-wharton-navy/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => { setActiveModal(null); setScannerStatus('idle'); }} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 text-wharton-red text-xs uppercase tracking-widest font-semibold mb-1">
              <ScanBarcode className="w-4 h-4" /> Physical Shelf Optical Sensor
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mb-1">Scan RFID / Barcode</h3>
            <p className="text-xs text-subtle mb-4">Simulate tapping an RFID chip or reading the barcode of any book on the shelf at 2 Harrison St.</p>

            <div className="border-2 border-dashed border-wharton-navy/30 bg-white p-6 rounded-sm text-center mb-4 relative overflow-hidden">
              <QrCode className="w-16 h-16 text-wharton-navy/40 mx-auto mb-2 animate-pulse" />
              <p className="font-serif text-sm text-wharton-navy font-semibold">
                {scannerStatus === 'scanning' ? 'Reading sensor...' : scannerStatus === 'success' ? 'Tag Matched!' : 'Ready for shelf scan'}
              </p>
              <p className="text-[11px] text-subtle mt-0.5">Hold sticker or barcode against scanner</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Or Enter Book ID / ISBN / Title:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={scannedCode} 
                    onChange={(e) => setScannedCode(e.target.value)} 
                    placeholder="e.g. 978-0593086193 or Clear Thinking"
                    className="flex-1 bg-white border border-wharton-navy/20 p-2 text-xs font-mono text-wharton-navy" 
                  />
                  <button 
                    onClick={() => handleSimulateScan()}
                    className="bg-wharton-navy text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors font-semibold"
                  >
                    Scan
                  </button>
                </div>
              </div>

              {scannerStatus === 'not-found' && (
                <div className="bg-red-50 border border-red-200 text-wharton-red p-2.5 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No book tag found matching that identifier.</span>
                </div>
              )}

              <div className="pt-2 border-t border-wharton-navy/10">
                <span className="text-[10px] uppercase tracking-wider text-subtle block mb-1.5 font-semibold">Quick Test Shelf Tags:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button 
                    onClick={() => handleSimulateScan('Clear Thinking')}
                    className="bg-white border border-wharton-navy/20 px-2 py-1 text-[11px] hover:border-wharton-navy text-wharton-navy"
                  >
                    Clear Thinking
                  </button>
                  <button 
                    onClick={() => handleSimulateScan('Brick by Brick')}
                    className="bg-white border border-wharton-navy/20 px-2 py-1 text-[11px] hover:border-wharton-navy text-wharton-navy"
                  >
                    Brick by Brick
                  </button>
                  <button 
                    onClick={() => handleSimulateScan('978-0679762881')}
                    className="bg-white border border-wharton-navy/20 px-2 py-1 text-[11px] hover:border-wharton-navy text-wharton-navy font-mono"
                  >
                    High Output Mgmt (ISBN)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PennID Verification Modal */}
      {activeModal === 'verify' && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 text-wharton-red text-xs uppercase tracking-widest font-semibold mb-1">
              <UserCheck className="w-4 h-4" /> Patron Identity Verification
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mb-1">Verify PennID Card</h3>
            <p className="text-xs text-subtle mb-4">Please enter your full name and official Penn email to borrow books from Glover Library.</p>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Full Name *</label>
                <input 
                  type="text" 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})} 
                  placeholder="e.g. Gerald Glover"
                  className="w-full bg-white border border-wharton-navy/20 p-2.5 font-serif text-wharton-navy" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Penn Email *</label>
                <input 
                  type="email" 
                  value={user.email} 
                  onChange={(e) => setUser({...user, email: e.target.value})} 
                  placeholder="username@wharton.upenn.edu"
                  className="w-full bg-white border border-wharton-navy/20 p-2.5 font-serif text-wharton-navy" 
                  required
                />
                <span className="text-[10px] text-subtle mt-1 block">Must end with <strong>penn.edu</strong></span>
              </div>

              {verificationError && (
                <div className="bg-red-50 border border-red-200 text-wharton-red p-2.5 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{verificationError}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full mt-2 bg-wharton-navy text-white py-3 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> VERIFY PENNID
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Check-out Confirmation Modal */}
      {activeModal === 'checkout-confirm' && selectedBook && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-2 text-emerald-700 text-xs uppercase tracking-widest font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" /> Verified Penn Patron
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mt-1 mb-4">{selectedBook.title}</h3>

            <div className="bg-white p-4 border border-wharton-navy/10 space-y-2.5 text-xs mb-6">
              <div className="flex justify-between"><span className="text-subtle">Author:</span> <span className="font-medium">{selectedBook.author}</span></div>
              <div className="flex justify-between"><span className="text-subtle">Shelf Location:</span> <span className="font-medium text-wharton-red">{selectedBook.shelf}</span></div>
              <div className="flex justify-between"><span className="text-subtle">Patron Name:</span> <span className="font-medium">{user.name}</span></div>
              <div className="flex justify-between"><span className="text-subtle">PennKey:</span> <span className="font-medium font-mono text-wharton-navy">{user.pennKey || extractPennKey(user.email)}</span></div>
              <div className="flex justify-between"><span className="text-subtle">Penn Email:</span> <span className="font-medium">{user.email}</span></div>
              <div className="flex justify-between pt-2 border-t border-wharton-navy/10 font-semibold text-wharton-navy">
                <span className="flex items-center gap-1 text-wharton-red"><Calendar className="w-3.5 h-3.5" /> Due Date (14 Days):</span> 
                <span>{getCalculatedDueDate()}</span>
              </div>
            </div>

            <button 
              onClick={handleConfirmBorrow}
              disabled={isSubmittingCheckout}
              className="w-full bg-wharton-navy text-white py-3 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
            >
              <ScanBarcode className="w-4 h-4" /> {isSubmittingCheckout ? 'Logging Checkout...' : 'CONFIRM SHELF CHECK-OUT'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Product Detail Page (PDP) */}
      {activeModal === 'pdp' && selectedBook && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-lg w-full p-8 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            
            <div className="flex justify-between items-start text-xs text-subtle mb-2">
              <span className="text-wharton-red font-semibold">{selectedBook.shelf}</span>
            </div>

            <h2 className="font-serif text-3xl text-wharton-navy mb-1">{selectedBook.title}</h2>
            <p className="text-base text-charcoal/80 mb-1">{selectedBook.author}</p>
            {selectedBook.isbn && <p className="text-xs font-mono text-subtle mb-4">ISBN: {selectedBook.isbn}</p>}

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedBook.tags.map((t, idx) => (
                <span key={idx} className="bg-white px-2.5 py-1 text-xs text-wharton-navy border border-wharton-navy/20">
                  {t}
                </span>
              ))}
            </div>

            {selectedBook.recommendedBy && (
              <div className="bg-white p-4 border-l-2 border-wharton-red border-y border-r border-wharton-navy/10 mb-6 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-wharton-red font-semibold block mb-1">Recommended By</span>
                <p className="font-serif text-sm text-wharton-navy">{selectedBook.recommendedBy}</p>
              </div>
            )}

            <div className="pt-4 border-t border-wharton-navy/10 flex justify-between items-center text-xs">
              <div>
                {selectedBook.isCheckedOut ? (
                  <span className="text-wharton-red font-medium">● Borrowed</span>
                ) : (
                  <span className="text-emerald-700 font-medium">● Available</span>
                )}
              </div>
              {selectedBook.isCheckedOut ? (
                <button 
                  onClick={() => setActiveModal('return-confirm')}
                  className="bg-emerald-700 text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-2 font-semibold"
                >
                  <RotateCcw className="w-4 h-4" /> Return to Shelf
                </button>
              ) : (
                <button 
                  onClick={() => handleInitiateBorrow(selectedBook)}
                  className="bg-wharton-navy text-white px-4 py-2 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center gap-2 font-semibold"
                >
                  <ScanBarcode className="w-4 h-4" /> Borrow Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Return Confirmation Modal */}
      {activeModal === 'return-confirm' && selectedBook && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-2 text-emerald-700 text-xs uppercase tracking-widest font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" /> Book Return Confirmation
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mt-1 mb-4">{selectedBook.title}</h3>

            <div className="bg-white p-4 border border-wharton-navy/10 space-y-2 text-xs mb-6">
              <div className="flex justify-between"><span className="text-subtle">Author:</span> <span className="font-medium">{selectedBook.author}</span></div>
              <div className="flex justify-between"><span className="text-subtle">Shelf Location:</span> <span className="font-medium text-wharton-red">{selectedBook.shelf}</span></div>
            </div>

            <button 
              onClick={() => handleConfirmReturn(selectedBook.id)}
              className="w-full bg-emerald-700 text-white py-3 text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" /> CONFIRM RETURN TO SHELF
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Donate Book Modal */}
      {activeModal === 'donate' && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 text-wharton-red text-xs uppercase tracking-widest font-semibold mb-1">
              <Gift className="w-4 h-4" /> Cohort Contribution
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mb-1">Donate a Book</h3>
            <p className="text-xs text-subtle mb-4">Enrich our collection by contributing a book to the physical library.</p>

            <div className="bg-white p-3.5 border-l-2 border-wharton-red border-y border-r border-wharton-navy/15 mb-5 text-xs">
              <span className="text-[10px] uppercase tracking-widest text-wharton-red font-bold block mb-1">Drop Off Location:</span>
              <p className="font-serif text-sm font-semibold text-wharton-navy">Glover Library / Pooja</p>
              <p className="text-charcoal/90 mt-0.5">2 Harrison St, Fl 6</p>
              <p className="text-charcoal/90">San Francisco, CA 94105</p>
            </div>

            <form onSubmit={handleDonateBookSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Book Title *</label>
                <input 
                  type="text" 
                  value={donationForm.title} 
                  onChange={(e) => setDonationForm({...donationForm, title: e.target.value})} 
                  placeholder="e.g. Good to Great"
                  className="w-full bg-white border border-wharton-navy/20 p-2 font-serif text-wharton-navy" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Author Name *</label>
                <input 
                  type="text" 
                  value={donationForm.author} 
                  onChange={(e) => setDonationForm({...donationForm, author: e.target.value})} 
                  placeholder="e.g. Jim Collins"
                  className="w-full bg-white border border-wharton-navy/20 p-2 font-serif text-wharton-navy" 
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Category / Primary Tag *</label>
                <select 
                  value={donationForm.tag} 
                  onChange={(e) => setDonationForm({...donationForm, tag: e.target.value})}
                  className="w-full bg-white border border-wharton-navy/20 p-2 font-serif text-wharton-navy"
                >
                  {whartonTags.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-wharton-navy/10">
                <div>
                  <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Your Name (Donor Credit) *</label>
                  <input 
                    type="text" 
                    value={donationForm.donorName || user.name} 
                    onChange={(e) => setDonationForm({...donationForm, donorName: e.target.value})} 
                    placeholder="e.g. Gerald Glover"
                    className="w-full bg-white border border-wharton-navy/20 p-2 font-serif text-wharton-navy" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Cohort / Program *</label>
                  <input 
                    type="text" 
                    value={donationForm.donorCohort} 
                    onChange={(e) => setDonationForm({...donationForm, donorCohort: e.target.value})} 
                    placeholder="e.g. WG'26"
                    className="w-full bg-white border border-wharton-navy/20 p-2 font-serif text-wharton-navy" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-6 bg-wharton-navy text-white py-3 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Gift className="w-4 h-4" /> CONTRIBUTE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Admin Login Modal */}
      {activeModal === 'admin-login' && (
        <div className="fixed inset-0 bg-wharton-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 text-wharton-red text-xs uppercase tracking-widest font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" /> Librarian Access
            </div>
            <h3 className="font-serif text-2xl text-wharton-navy mb-2">Admin Portal</h3>
            <p className="text-xs text-subtle mb-4">Enter passcode to unlock catalog controls and patron audit log.</p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-subtle mb-1 font-semibold">Librarian Passcode *</label>
                <input 
                  type="password" 
                  value={adminPasscode} 
                  onChange={(e) => setAdminPasscode(e.target.value)} 
                  placeholder="Enter passcode..."
                  className="w-full bg-white border border-wharton-navy/20 p-2.5 font-serif text-wharton-navy text-center tracking-widest"
                  required
                />
              </div>

              {adminError && (
                <p className="text-xs text-wharton-red font-medium text-center">Incorrect passcode. Please try again.</p>
              )}

              <button 
                type="submit"
                className="w-full bg-wharton-navy text-white py-3 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Lock className="w-4 h-4" /> Unlock Admin Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Admin Panel Modal */}
      {activeModal === 'admin-panel' && (
        <div className="fixed inset-0 bg-wharton-navy/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-wharton-navy max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-wharton-navy/50 hover:text-wharton-navy"><X className="w-5 h-5" /></button>
            
            <div className="flex justify-between items-start mb-6 border-b border-wharton-navy/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 text-xs uppercase tracking-widest font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4" /> Integrated Admin Mode Active
                </div>
                <h3 className="font-serif text-3xl text-wharton-navy">Librarian Dashboard</h3>
              </div>
              <button 
                onClick={handleExportCSV}
                className="bg-wharton-navy text-white px-3.5 py-2 text-xs uppercase tracking-wider hover:bg-wharton-red transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Catalog CSV
              </button>
            </div>

            <div className="flex justify-between items-center mb-4 text-xs">
              <span className="font-serif text-base text-wharton-navy font-semibold">
                Inventory Status ({adminFilteredBooks.length} titles)
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAdminStockFilter('all')}
                  className={`px-3 py-1 border ${adminStockFilter === 'all' ? 'bg-wharton-navy text-white' : 'bg-white'}`}
                >
                  All ({books.length})
                </button>
                <button 
                  onClick={() => setAdminStockFilter('in-stock')}
                  className={`px-3 py-1 border ${adminStockFilter === 'in-stock' ? 'bg-emerald-800 text-white' : 'bg-white'}`}
                >
                  Available ({books.filter(b => !b.isCheckedOut).length})
                </button>
                <button 
                  onClick={() => setAdminStockFilter('checked-out')}
                  className={`px-3 py-1 border ${adminStockFilter === 'checked-out' ? 'bg-wharton-red text-white' : 'bg-white'}`}
                >
                  Borrowed ({books.filter(b => b.isCheckedOut).length})
                </button>
              </div>
            </div>

            <div className="bg-white border border-wharton-navy/15 overflow-x-auto mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-wharton-navy text-canvas uppercase tracking-wider font-semibold border-b border-wharton-navy/20">
                  <tr>
                    <th className="p-3">Title & Author</th>
                    <th className="p-3">Shelf</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Borrower Details</th>
                    <th className="p-3 text-right">Override Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wharton-navy/10">
                  {adminFilteredBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-canvas/50">
                      <td className="p-3 font-serif">
                        <span className="font-semibold text-wharton-navy block">{b.title}</span>
                        <span className="text-subtle text-[11px]">{b.author}</span>
                      </td>
                      <td className="p-3 text-wharton-red font-medium">{b.shelf}</td>
                      <td className="p-3">
                        {b.isCheckedOut ? (
                          <span className="text-wharton-red font-semibold">● Borrowed</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">● Available</span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-charcoal/80">
                        {b.checkedOutBy ? (
                          <div>
                            <span className="font-semibold text-wharton-navy block">{b.checkedOutBy}</span>
                            <span className="text-subtle text-[10px] block">{b.borrowerEmail || 'No email recorded'}</span>
                            <span className="text-subtle text-[10px] block font-mono">Due: {b.dueDate || 'N/A'}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleToggleStockStatus(b.id)}
                          className="border border-wharton-navy/20 px-2.5 py-1 text-[11px] uppercase tracking-wider hover:bg-wharton-navy hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-wharton-navy/10 pt-4">
              <h4 className="font-serif text-lg text-wharton-navy mb-2">Verified Patron Audit Log</h4>
              {user.isVerified ? (
                <div className="bg-white p-4 border border-wharton-navy/15 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-serif text-sm font-semibold text-wharton-navy">{user.name}</p>
                    <p className="text-subtle">PennKey: <span className="font-mono">{user.pennKey}</span> • {user.email}</p>
                  </div>
                  <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-700/20 px-2.5 py-1">
                    ✓ Verified Penn Patron
                  </span>
                </div>
              ) : (
                <p className="text-xs text-subtle italic">No patrons currently active in device session.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-wharton-navy/10 py-8 px-6 md:px-16 text-center text-xs text-subtle">
        <p>Glover Library • WEMBA Executive MBA Program • San Francisco</p>
        <p className="mt-1 font-medium text-wharton-navy">App developed by Pooja S • Curated by Gerald Glover (WG’26)</p>
      </footer>
    </div>
  );
}
