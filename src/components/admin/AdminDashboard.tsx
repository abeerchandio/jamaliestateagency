import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Star,
  MessageSquare,
  ClipboardList,
  Settings,
  LogOut,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  Home,
  Check,
  X,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  FirestoreProperty,
  subscribeToProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  seedInitialPropertiesToFirestore
} from '../../firebase/propertiesService';
import {
  FirestoreInquiry,
  subscribeToInquiries,
  updateInquiryStatus,
  deleteInquiry
} from '../../firebase/inquiriesService';
import {
  FirestorePropertyRequest,
  subscribeToPropertyRequests,
  updatePropertyRequestStatus,
  deletePropertyRequest
} from '../../firebase/requestsService';
import { adminLogout } from '../../firebase/authService';
import { isFirebaseConfigured, getActiveFirebaseConfig } from '../../firebase/config';

interface AdminDashboardProps {
  onBackToPublicSite: () => void;
  onOpenFirebaseConfig: () => void;
}

type TabType =
  | 'dashboard'
  | 'properties'
  | 'add_property'
  | 'featured'
  | 'inquiries'
  | 'requests'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPublicSite,
  onOpenFirebaseConfig
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [properties, setProperties] = useState<FirestoreProperty[]>([]);
  const [inquiries, setInquiries] = useState<FirestoreInquiry[]>([]);
  const [propertyRequests, setPropertyRequests] = useState<FirestorePropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters in Properties tab
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit property state
  const [editingProperty, setEditingProperty] = useState<FirestoreProperty | null>(null);

  // Delete confirmation state
  const [propertyToDelete, setPropertyToDelete] = useState<FirestoreProperty | null>(null);

  // Add / Edit Form State
  const initialFormState = {
    title: '',
    propertyType: 'Plot' as FirestoreProperty['propertyType'],
    purpose: 'Sale' as FirestoreProperty['purpose'],
    location: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    description: '',
    featuresText: '',
    imageUrlInput: '',
    images: [] as string[],
    status: 'Available' as FirestoreProperty['status'],
    featured: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Subscribe to real-time properties
  useEffect(() => {
    const unsubProps = subscribeToProperties(
      (list) => {
        setProperties(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubInquiries = subscribeToInquiries((list) => {
      setInquiries(list);
    });

    const unsubRequests = subscribeToPropertyRequests((list) => {
      setPropertyRequests(list);
    });

    return () => {
      unsubProps();
      unsubInquiries();
      unsubRequests();
    };
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setAlertNotice({ type, message });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  // Populate form for editing
  const handleStartEdit = (prop: FirestoreProperty) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title,
      propertyType: prop.propertyType,
      purpose: prop.purpose,
      location: prop.location,
      price: prop.price,
      area: prop.area,
      bedrooms: prop.bedrooms || '',
      bathrooms: prop.bathrooms || '',
      parking: prop.parking || '',
      description: prop.description,
      featuresText: prop.features ? prop.features.join(', ') : '',
      imageUrlInput: '',
      images: prop.images || [],
      status: prop.status,
      featured: prop.featured
    });
    setActiveTab('add_property');
  };

  const handleResetForm = () => {
    setEditingProperty(null);
    setFormData(initialFormState);
  };

  // Image Upload via Firebase Storage
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isFirebaseConfigured()) {
      showNotice('error', 'Firebase is not connected. Paste your Firebase config first in Settings to upload photos.');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadPropertyImage(file);
        uploadedUrls.push(url);
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showNotice('success', `Uploaded ${uploadedUrls.length} image(s) to Firebase Storage!`);
    } catch (err: any) {
      showNotice('error', err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Image by URL fallback
  const handleAddImageUrl = () => {
    if (!formData.imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, formData.imageUrlInput.trim()],
      imageUrlInput: ''
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Save Property (Add or Edit)
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.price.trim() || !formData.area.trim()) {
      showNotice('error', 'Please fill in Title, Location, Price, and Area.');
      return;
    }

    const featuresArray = formData.featuresText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const imagesToSave = formData.images.length > 0
      ? formData.images
      : ['/src/assets/images/hero_nawabshah_villas_1790974799226.jpg'];

    setIsSubmitting(true);

    try {
      if (editingProperty) {
        // Update
        await updateProperty(editingProperty.id, {
          title: formData.title,
          propertyType: formData.propertyType,
          purpose: formData.purpose,
          location: formData.location,
          price: formData.price,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          parking: formData.parking,
          description: formData.description,
          features: featuresArray,
          images: imagesToSave,
          status: formData.status,
          featured: formData.featured
        });
        showNotice('success', 'Property updated successfully!');
      } else {
        // Add
        await addProperty({
          title: formData.title,
          propertyType: formData.propertyType,
          purpose: formData.purpose,
          location: formData.location,
          price: formData.price,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          parking: formData.parking,
          description: formData.description,
          features: featuresArray,
          images: imagesToSave,
          status: formData.status,
          featured: formData.featured
        });
        showNotice('success', 'New property added to Firestore catalog!');
      }

      handleResetForm();
      setActiveTab('properties');
    } catch (err: any) {
      showNotice('error', err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Property
  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete.id);
      showNotice('success', `Deleted "${propertyToDelete.title}"`);
      setPropertyToDelete(null);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete property.');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (prop: FirestoreProperty) => {
    try {
      await updateProperty(prop.id, { featured: !prop.featured });
      showNotice('success', `${prop.title} is now ${!prop.featured ? 'Featured' : 'Standard'}.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update featured state.');
    }
  };

  // Seed Data button
  const handleSeedData = async () => {
    if (!window.confirm('Do you want to upload all default Nawabshah properties to your Firestore database?')) return;
    try {
      const count = await seedInitialPropertiesToFirestore();
      showNotice('success', `Uploaded ${count} properties directly to your Firestore database!`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to seed properties.');
    }
  };

  // Stats
  const totalProperties = properties.length;
  const forSaleCount = properties.filter(p => p.purpose === 'Sale').length;
  const forRentCount = properties.filter(p => p.purpose === 'Rent').length;
  const featuredCount = properties.filter(p => p.featured).length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;
  const newRequestsCount = propertyRequests.filter(r => r.status === 'New').length;

  const filteredProperties = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || p.propertyType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Lockup */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block tracking-tight">
                  Nawabshah Estate
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Admin Portal
                </span>
              </div>
            </div>

            <button
              onClick={onBackToPublicSite}
              title="Return to Public Website"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4" />
                <span>All Properties</span>
              </div>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {totalProperties}
              </span>
            </button>

            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('add_property');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'add_property'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingProperty ? 'Edit Property' : 'Add New Property'}</span>
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4" />
                <span>Featured Listings</span>
              </div>
              <span className="text-[11px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">
                {featuredCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Messages & Inquiries</span>
              </div>
              {newInquiriesCount > 0 && (
                <span className="text-[11px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  {newInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4" />
                <span>Property Requests</span>
              </div>
              {newRequestsCount > 0 && (
                <span className="text-[11px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                  {newRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Firebase & Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToPublicSite}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={async () => {
              await adminLogout();
              onBackToPublicSite();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Nawabshah Estate Agency · Cloud Management Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Firebase Connection Pill */}
            <button
              onClick={onOpenFirebaseConfig}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border cursor-pointer ${
                isFirebaseConfigured()
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400 animate-pulse'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isFirebaseConfigured() ? 'Firebase Live' : 'Connect Firebase'}</span>
            </button>

            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('add_property');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Property</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {alertNotice && (
          <div
            className={`my-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
              alertNotice.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {alertNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alertNotice.message}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 1. DASHBOARD OVERVIEW TAB */}
        {/* ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 pt-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">Total Properties</div>
                <div className="text-2xl font-extrabold font-mono text-white mt-1">
                  {totalProperties}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Active in Catalog</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">For Sale</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                  {forSaleCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Plots, Villas, Land</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">For Rent</div>
                <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">
                  {forRentCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Shops & Plazas</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400">Featured Listings</div>
                <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                  {featuredCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Homepage Highlight</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl col-span-2 lg:col-span-1">
                <div className="text-xs text-slate-400">New Inquiries</div>
                <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">
                  {newInquiriesCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Awaiting Contact</div>
              </div>
            </div>

            {/* Quick Actions & Recent Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Properties */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-500" />
                    Latest Property Listings
                  </h3>
                  <button
                    onClick={() => setActiveTab('properties')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {properties.slice(0, 4).map(prop => (
                    <div
                      key={prop.id}
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prop.images[0] || '/src/assets/images/hero_nawabshah_villas_1790974799226.jpg'}
                          alt={prop.title}
                          className="w-12 h-10 object-cover rounded shrink-0 bg-slate-800"
                        />
                        <div className="truncate">
                          <div className="font-bold text-white truncate">{prop.title}</div>
                          <div className="text-slate-400 text-[11px] truncate">{prop.location}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-emerald-400">{prop.price}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {prop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Inquiries */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    Recent Client Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {inquiries.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No customer inquiries submitted yet.
                    </div>
                  ) : (
                    inquiries.slice(0, 4).map(inq => (
                      <div
                        key={inq.id}
                        className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{inq.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              inq.status === 'New'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">{inq.phone}</div>
                        <p className="text-slate-300 text-[11px] truncate">{inq.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. PROPERTIES MANAGEMENT TAB */}
        {/* ==================================================================== */}
        {(activeTab === 'properties' || activeTab === 'featured') && (
          <div className="space-y-4 pt-6">
            
            {/* Search and Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or location..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="Plot">Plot</option>
                  <option value="House">House</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Shop">Shop</option>
                </select>

                <button
                  onClick={() => {
                    handleResetForm();
                    setActiveTab('add_property');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {/* Properties Table / Grid */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProperties
                      .filter(p => activeTab === 'featured' ? p.featured : true)
                      .map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prop.images[0] || '/src/assets/images/hero_nawabshah_villas_1790974799226.jpg'}
                                alt={prop.title}
                                className="w-12 h-10 object-cover rounded bg-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate max-w-xs">{prop.title}</div>
                                <div className="text-slate-400 text-[11px] truncate">{prop.location}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-300">{prop.propertyType}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                prop.purpose === 'Sale'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {prop.purpose}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{prop.price}</td>
                          <td className="py-3 px-4 text-slate-300 font-mono">{prop.area}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                prop.status === 'Available'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : prop.status === 'Sold'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {prop.status}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleFeatured(prop)}
                              className={`p-1.5 rounded transition-colors ${
                                prop.featured
                                  ? 'text-amber-400 hover:text-amber-300 bg-amber-950/40'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={prop.featured ? 'Unmark Featured' : 'Mark as Featured'}
                            >
                              <Star className={`w-4 h-4 ${prop.featured ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleStartEdit(prop)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                              title="Edit Property"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPropertyToDelete(prop)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. ADD / EDIT PROPERTY TAB */}
        {/* ==================================================================== */}
        {activeTab === 'add_property' && (
          <div className="max-w-3xl pt-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingProperty ? 'Edit Property Information' : 'Add New Property to Catalog'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter the full listing details. These will reflect immediately on the public website.
                  </p>
                </div>
                {editingProperty && (
                  <button
                    onClick={handleResetForm}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Property Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 400 Sq. Yards West-Open Luxury Bungalow"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Property Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Plot">Plot</option>
                      <option value="House">House / Villa</option>
                      <option value="Commercial">Commercial Plaza</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Shop">Shop / Retail</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Office">Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Purpose <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Sale">For Sale</option>
                      <option value="Rent">For Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                      <option value="Rented">Rented</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Location in Nawabshah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Society Phase 1, Main Boulevard"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Price / Demand (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. PKR 95 Lacs or PKR 3.5 Crore"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Area / Size <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. 200 Sq. Yards"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="text"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="e.g. 4 Beds"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="text"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="e.g. 4 Baths"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Parking
                    </label>
                    <input
                      type="text"
                      value={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                      placeholder="e.g. 2 Cars"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter complete overview, surrounding amenities, legal registry details..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Features / Amenities (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder="e.g. West Open, Corner Plot, Sweet Water, Sui Gas, Near Park, 50ft Road"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm text-white"
                  />
                </div>

                {/* Property Images Section */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      Property Photos (Firebase Storage)
                    </span>
                    {uploadingImage && (
                      <span className="text-xs text-emerald-400 animate-pulse">
                        Uploading to Storage...
                      </span>
                    )}
                  </div>

                  {/* Upload via File Input */}
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos to Storage</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">or add image URL</span>
                  </div>

                  {/* Add via URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrlInput}
                      onChange={(e) => setFormData({ ...formData, imageUrlInput: e.target.value })}
                      placeholder="https://example.com/property-photo.jpg"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Thumbnails */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-20 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                          <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Highlight as Featured Property on Homepage
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmitting
                      ? 'Saving to Firestore...'
                      : editingProperty
                      ? 'Save Property Changes'
                      : 'Publish Property'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. MESSAGES & INQUIRIES TAB */}
        {/* ==================================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Inquiries submitted by prospective buyers & sellers through the public website.
              </p>
              <span className="text-xs text-slate-500 font-mono">
                Total: {inquiries.length}
              </span>
            </div>

            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500">
                  No inquiries received yet. They will appear here in real-time when visitors submit forms!
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{inq.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            inq.status === 'New'
                              ? 'bg-rose-500/20 text-rose-300'
                              : inq.status === 'Contacted'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-xs">
                        <span className="font-mono text-emerald-400 font-semibold">{inq.phone}</span>
                        {inq.email && <span>· {inq.email}</span>}
                        {inq.propertyTitle && <span>· Ref: {inq.propertyTitle}</span>}
                      </div>

                      <p className="text-slate-300 pt-1 leading-relaxed max-w-2xl">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="New">Mark New</option>
                        <option value="Contacted">Mark Contacted</option>
                        <option value="Closed">Mark Closed</option>
                      </select>

                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        WhatsApp
                      </a>

                      <button
                        onClick={() => deleteInquiry(inq.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. PROPERTY REQUESTS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-4 pt-6">
            <p className="text-xs text-slate-400">
              Clients who submitted a specific property search / buy / sell criteria.
            </p>

            <div className="space-y-3">
              {propertyRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-500">
                  No property requests found yet.
                </div>
              ) : (
                propertyRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          {req.purpose || 'Buy'} {req.propertyType}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {req.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="font-mono text-emerald-400 font-bold">{req.phone}</span>
                        {req.preferredLocation && <span>· Location: {req.preferredLocation}</span>}
                        {req.budget && <span>· Budget: {req.budget}</span>}
                      </div>

                      {req.requirements && (
                        <p className="text-slate-300 pt-1 leading-relaxed max-w-2xl">
                          "{req.requirements}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={req.status}
                        onChange={(e) => updatePropertyRequestStatus(req.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>

                      <a
                        href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        WhatsApp
                      </a>

                      <button
                        onClick={() => deletePropertyRequest(req.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 6. SETTINGS & FIREBASE STATUS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl pt-6 space-y-6">
            
            {/* Firebase Status Card */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Firebase Project Connection</h3>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    isFirebaseConfigured()
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isFirebaseConfigured() ? 'Connected' : 'Credentials Awaiting'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isFirebaseConfigured()
                  ? `Connected to Firebase Project ID: "${getActiveFirebaseConfig().projectId}". Cloud Firestore and Firebase Storage are active.`
                  : 'Firebase is not yet connected to your live Firebase project credentials. You can click below to paste your credentials from Firebase Console.'}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onOpenFirebaseConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isFirebaseConfigured() ? 'Update Firebase Credentials' : 'Connect Firebase Credentials'}
                </button>

                <button
                  onClick={handleSeedData}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seed Default Nawabshah Listings to Firestore</span>
                </button>
              </div>
            </div>

            {/* Administrator Security Info */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <h3 className="text-base font-bold text-white">Administrator Access & Authorization</h3>
              <p className="text-slate-400 leading-relaxed">
                In compliance with Security Rules, only authorized administrators have permission to perform writes, delete listings, and view client inquiries.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[11px]">Primary Administrator Account:</span>
                <span className="font-mono text-emerald-400 font-bold">abeerachandio@gmail.com</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Property Confirmation</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Are you sure you want to delete this property?
              <br/>
              <span className="font-semibold text-white mt-1 block">
                "{propertyToDelete.title}"
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Yes, Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
