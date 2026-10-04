import React, { useState, useEffect } from 'react';
import { FirestoreProperty, subscribeToProperties } from '../firebase/propertiesService';
import { CompanyInfo } from '../data/companyData';
import {
  MapPin,
  Check,
  ArrowRight,
  MessageCircle,
  Info,
  X,
  Search,
  SlidersHorizontal,
  WifiOff,
  Star
} from 'lucide-react';

interface PropertiesSectionProps {
  company: CompanyInfo;
  onSelectProperty: (propertyTitle: string) => void;
  filterType?: string;
  filterLocation?: string;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  company,
  onSelectProperty,
  filterType = 'all',
  filterLocation = 'all'
}) => {
  const [properties, setProperties] = useState<FirestoreProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<'all' | 'Sale' | 'Rent'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<FirestoreProperty | null>(null);

  const cleanWhatsapp = company.whatsappNumber.replace(/[^0-9]/g, '');

  // Real-time Firestore subscription
  useEffect(() => {
    setLoading(true);
    setNetworkError(false);

    const unsubscribe = subscribeToProperties(
      (list) => {
        setProperties(list);
        setLoading(false);
        setNetworkError(false);
      },
      (err) => {
        console.warn('Properties load issue:', err);
        setLoading(false);
        if (err.message && err.message.includes('offline')) {
          setNetworkError(true);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = [
    { id: 'all', label: 'All Listings' },
    { id: 'Plot', label: 'Residential Plots' },
    { id: 'House', label: 'Houses & Villas' },
    { id: 'Commercial', label: 'Commercial Plazas' },
    { id: 'Agricultural Land', label: 'Agricultural Farmland' },
    { id: 'Shop', label: 'Shops & Retail' },
  ];

  const filteredProperties = properties.filter((prop) => {
    // Category
    const matchesCat = activeCategory === 'all' || prop.propertyType === activeCategory;
    
    // Purpose (Sale / Rent)
    const matchesPurpose = purposeFilter === 'all' || prop.purpose === purposeFilter;

    // Status
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;

    // Keyword
    const matchesKeyword =
      !searchKeyword.trim() ||
      prop.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prop.price.toLowerCase().includes(searchKeyword.toLowerCase());

    // External filters from Hero
    let matchesHeroType = true;
    if (filterType !== 'all') {
      if (filterType === 'residential_plot') matchesHeroType = prop.propertyType === 'Plot';
      else if (filterType === 'house') matchesHeroType = prop.propertyType === 'House';
      else if (filterType === 'commercial') matchesHeroType = prop.propertyType === 'Commercial';
      else if (filterType === 'agricultural') matchesHeroType = prop.propertyType === 'Agricultural Land';
    }

    let matchesHeroLoc = true;
    if (filterLocation !== 'all') {
      const locLower = prop.location.toLowerCase();
      if (filterLocation === 'society') matchesHeroLoc = locLower.includes('society');
      else if (filterLocation === 'vip') matchesHeroLoc = locLower.includes('vip');
      else if (filterLocation === 'airport') matchesHeroLoc = locLower.includes('airport') || locLower.includes('taj');
      else if (filterLocation === 'agricultural') matchesHeroLoc = locLower.includes('sakrand') || locLower.includes('canal') || locLower.includes('jam sahib');
    }

    return matchesCat && matchesPurpose && matchesStatus && matchesKeyword && matchesHeroType && matchesHeroLoc;
  });

  const getWhatsappInquiryUrl = (propertyTitle: string, price: string, location: string) => {
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
      `Assalam-o-Alaikum ${company.name}, I am interested in this listing:\n*${propertyTitle}*\nPrice: ${price}\nLocation: ${location}\nPlease share complete details and title verification status.`
    )}`;
  };

  return (
    <section id="properties" className="py-20 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">
              Live Cloud Firestore Property Catalog
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
              Verified Properties & Plots in Nawabshah
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Browse real-time listings: residential plots in Society Phase 1 & 2, double-story villas, VIP Road commercial plazas, and canal-water farmland.
            </p>
          </div>

          {/* Quick Purpose Switcher (Sale / Rent) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-auto">
            <button
              onClick={() => setPurposeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                purposeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setPurposeFilter('Sale')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                purposeFilter === 'Sale' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setPurposeFilter('Rent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                purposeFilter === 'Rent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              For Rent
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Keyword Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search by area or title..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Offline / Network Warning */}
        {networkError && (
          <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Internet connection unavailable. Please check your connection and try again.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Synchronizing live properties from Firestore...</p>
          </div>
        )}

        {/* Zero Results State */}
        {!loading && filteredProperties.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 mt-8 space-y-2">
            <p className="text-sm font-semibold text-slate-700">No properties match your filter criteria.</p>
            <p className="text-xs text-slate-500">Try switching categories or clearing search keywords.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setPurposeFilter('all');
                setSearchKeyword('');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-bold text-emerald-700 underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Properties Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const whatsappPropUrl = getWhatsappInquiryUrl(prop.title, prop.price, prop.location);
            const mainImage = prop.images && prop.images.length > 0
              ? prop.images[0]
              : '/src/assets/images/hero_nawabshah_villas_1790974799226.jpg';

            return (
              <div
                key={prop.id}
                className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Photo with Overlay Price and Type */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={mainImage}
                      alt={prop.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 bg-slate-900/90 text-emerald-400 font-semibold rounded-md border border-slate-700 backdrop-blur-xs">
                        {prop.propertyType}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {prop.featured && (
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-md flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 fill-slate-950" />
                            Featured
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-emerald-700 text-white font-bold rounded-md shadow-xs text-[11px]">
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <div className="text-xs text-slate-300">Demand / Price</div>
                        <div className="text-lg font-extrabold text-white font-mono">{prop.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-300">Size</div>
                        <div className="text-sm font-bold text-emerald-300">{prop.area}</div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {prop.title}
                    </h3>
                    
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prop.description}
                    </p>

                    {/* Quick Specs Badges */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Purpose:</span>
                        <span className="font-semibold text-slate-800">For {prop.purpose}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Bedrooms:</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {prop.bedrooms || 'Open / N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Key Features Bullet List */}
                    {prop.features && prop.features.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {prop.features.slice(0, 2).map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => setSelectedPropertyDetails(prop)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer py-2"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={whatsappPropUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg"
                      title="Direct WhatsApp Inquiry"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onSelectProperty(prop.title)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Inquire Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Property Details Modal */}
      {selectedPropertyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedPropertyDetails(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
              <span>{selectedPropertyDetails.propertyType}</span>
              <span>·</span>
              <span className="text-slate-500">For {selectedPropertyDetails.purpose}</span>
              <span>·</span>
              <span className="text-emerald-700">{selectedPropertyDetails.status}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-1 pr-6">
              {selectedPropertyDetails.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedPropertyDetails.location}</span>
            </div>

            <div className="mt-4 relative h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={selectedPropertyDetails.images[0] || '/src/assets/images/hero_nawabshah_villas_1790974799226.jpg'}
                alt={selectedPropertyDetails.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-sm font-mono font-bold backdrop-blur-xs">
                Demand: {selectedPropertyDetails.price}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Total Area / Size:</span>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedPropertyDetails.area}</div>
              </div>
              <div>
                <span className="text-slate-400">Bedrooms / Bathrooms:</span>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {selectedPropertyDetails.bedrooms || 'N/A'} · {selectedPropertyDetails.bathrooms || 'N/A'}
                </div>
              </div>
              {selectedPropertyDetails.parking && (
                <div className="col-span-2">
                  <span className="text-slate-400">Parking Space:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedPropertyDetails.parking}</div>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedPropertyDetails.description}
            </p>

            {selectedPropertyDetails.features && selectedPropertyDetails.features.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Key Highlights & Amenities:</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedPropertyDetails.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPropertyDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>

              <a
                href={getWhatsappInquiryUrl(
                  selectedPropertyDetails.title,
                  selectedPropertyDetails.price,
                  selectedPropertyDetails.location
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
