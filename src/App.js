import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trash2, Edit, Plus, X, Search, Download, ChevronLeft, ChevronRight, AlertCircle, LogOut, User, MapPin, Shield, Lock, ExternalLink, Folder, PieChart, BarChart3, List, RefreshCw } from 'lucide-react';

// --- CONFIGURATION ---
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
const API_URL = "https://script.google.com/macros/s/AKfycbzevrdz2J3rAxKiq89JDP7d7UpTjSiW5JunRf7Zeu8Em2TSu0BzbEa-FdfcBXc3wPu8hg/exec"; 
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"

// --- Helper Functions ---
const getQuarter = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const quarter = Math.ceil(month / 3);
  return `${year} Q${quarter}`;
};

// --- DUMMY DATA (Fallback if API_URL is empty) ---
const INITIAL_DUMMY_DATA = {
    users: [
      { id: 1, name: 'Super Admin', email: 'super@company.com', password: 'super123', role: 'superadmin' },
      { id: 2, name: 'Admin User', email: 'admin@company.com', password: 'admin123', role: 'admin' },
      { id: 3, name: 'Viewer User', email: 'viewer@company.com', password: 'view123', role: 'viewer' },
    ],
    projectManagers: [
      { id: 1, name: 'John Smith', email: 'john.smith@company.com', status: 'Active' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah.j@company.com', status: 'Active' },
      { id: 3, name: 'Mike Chen', email: 'mike.chen@company.com', status: 'Inactive' },
    ],
    contractedWorks: [
      { id: 1, name: 'Structural Works' },
      { id: 2, name: 'Electrical Installation' },
      { id: 3, name: 'HVAC Systems' },
      { id: 4, name: 'General Construction' },
      { id: 5, name: 'Plumbing Works' },
      { id: 6, name: 'Facade Works' },
      { id: 7, name: 'Landscaping' }
    ],
    clients: [
      { id: 1, company_name: 'Tech Corp', address: 'Istanbul, Turkey', contact_name: 'Ali Yilmaz', contact_mail: 'ali@techcorp.com', contact_phone: '+90 212 555 0001', sector: 'Technology' },
      { id: 2, company_name: 'Build Co', address: 'Ankara, Turkey', contact_name: 'Ayse Demir', contact_mail: 'ayse@buildco.com', contact_phone: '+90 312 555 0002', sector: 'Construction' },
      { id: 3, company_name: 'Retail Plus', address: 'Izmir, Turkey', contact_name: 'Mehmet Kaya', contact_mail: 'mehmet@retailplus.com', contact_phone: '+90 232 555 0003', sector: 'Retail' },
    ],
    contractors: [
      { id: 1, company_name: 'Elite Construction', address: 'Istanbul, Sisli', contact_name: 'Ahmet Oz', email: 'ahmet@eliteconstruction.com', phone: '+90 212 555 1001' },
      { id: 2, company_name: 'Modern Builders', address: 'Ankara, Cankaya', contact_name: 'Zeynep Arslan', email: 'zeynep@modernbuilders.com', phone: '+90 312 555 1002' },
      { id: 3, company_name: 'Pro Engineering', address: 'Izmir, Konak', contact_name: 'Burak Sahin', email: 'burak@proengineering.com', phone: '+90 232 555 1003' },
      { id: 4, company_name: 'Quality Services', address: 'Istanbul, Besiktas', contact_name: 'Elif Celik', email: 'elif@qualityservices.com', phone: '+90 212 555 1004' },
    ],
    externalConsultants: [
      { id: 1, name: 'Mech Consulting Ltd', specialty: 'Mechanical' },
      { id: 2, name: 'Electrical Solutions Inc', specialty: 'Electrical' },
      { id: 3, name: 'Structural Engineers Co', specialty: 'Structural' },
      { id: 4, name: 'HVAC Experts', specialty: 'Mechanical' },
      { id: 5, name: 'Power Systems Ltd', specialty: 'Electrical' },
      { id: 6, name: 'Foundation Specialists', specialty: 'Structural' },
    ],
    roles: [
      { id: 1, name: 'Project Manager' },
      { id: 2, name: 'Assistant Project Manager' },
      { id: 3, name: 'Design Manager' },
      { id: 4, name: 'Cost Manager' },
      { id: 5, name: 'Structural Consultant' },
      { id: 6, name: 'Electrical Consultant' },
      { id: 7, name: 'Mechanical Consultant' },
    ],
    projectManagementInfo: [
      { id: 1, op_number: 'OP-2024-001', project_name: 'Office Building Project', name: 'John Smith', role: 'Project Manager', fee: 5000, cost: 3000, currency: 'USD', duration: 6 },
      { id: 2, op_number: 'OP-2024-001', project_name: 'Office Building Project', name: 'John Smith', role: 'Design Manager', fee: 3500, cost: 2000, currency: 'USD', duration: 6 },
      { id: 3, op_number: 'OP-2024-001', project_name: 'Office Building Project', name: 'Mech Consulting Ltd', role: 'Structural Consultant', fee: 2500, cost: 1500, currency: 'USD', duration: 4 },
      { id: 4, op_number: 'OP-2024-002', project_name: 'Residential Complex', name: 'Sarah Johnson', role: 'Project Manager', fee: 6000, cost: 3500, currency: 'EUR', duration: 8 },
      { id: 5, op_number: 'OP-2024-002', project_name: 'Residential Complex', name: 'Sarah Johnson', role: 'Assistant Project Manager', fee: 3000, cost: 1800, currency: 'EUR', duration: 8 },
      { id: 6, op_number: 'OP-2024-002', project_name: 'Residential Complex', name: 'Electrical Solutions Inc', role: 'Mechanical Consultant', fee: 4000, cost: 2500, currency: 'EUR', duration: 6 },
      { id: 7, op_number: 'OP-2024-003', project_name: 'Warehouse Renovation', name: 'Mike Chen', role: 'Project Manager', fee: 150000, cost: 90000, currency: 'TRY', duration: 5 },
      { id: 8, op_number: 'OP-2024-003', project_name: 'Warehouse Renovation', name: 'Mike Chen', role: 'Cost Manager', fee: 100000, cost: 60000, currency: 'TRY', duration: 5 },
    ],
    projectContractors: [
      { id: 1, op_number: 'OP-2024-001', project_name: 'Office Building Project', contractor_name: 'Elite Construction', contracted_works: 'Structural Works', contract_date: '2024-01-10', start: '2024-02-01', end: '2024-08-01', contract_amount: 250000, contract_currency: 'USD', fx_rate: 32.50 },
      { id: 2, op_number: 'OP-2024-001', project_name: 'Office Building Project', contractor_name: 'Modern Builders', contracted_works: 'Electrical Installation', contract_date: '2024-01-15', start: '2024-03-01', end: '2024-07-01', contract_amount: 120000, contract_currency: 'USD', fx_rate: 32.50 },
      { id: 3, op_number: 'OP-2024-002', project_name: 'Residential Complex', contractor_name: 'Pro Engineering', contracted_works: 'HVAC Systems', contract_date: '2024-02-20', start: '2024-04-01', end: '2024-10-01', contract_amount: 180000, contract_currency: 'EUR', fx_rate: 35.20 },
      { id: 4, op_number: 'OP-2024-003', project_name: 'Warehouse Renovation', contractor_name: 'Elite Construction', contracted_works: 'General Construction', contract_date: '2024-03-05', start: '2024-03-15', end: '2024-09-15', contract_amount: 9000000, contract_currency: 'TRY', fx_rate: 1 },
      { id: 5, op_number: 'OP-2024-003', project_name: 'Warehouse Renovation', contractor_name: 'Quality Services', contracted_works: 'Plumbing Works', contract_date: '2024-03-10', start: '2024-04-01', end: '2024-08-01', contract_amount: 2500000, contract_currency: 'TRY', fx_rate: 1 },
    ],
    serviceTypes: [
      { id: 1, name: 'Full Project Management' },
      { id: 2, name: 'Consultancy' },
      { id: 3, name: 'Design & Build' },
      { id: 4, name: 'Construction Management' },
    ],
    projectTypes: [
      { id: 1, name: 'Residential' },
      { id: 2, name: 'Commercial' },
      { id: 3, name: 'Industrial' },
      { id: 4, name: 'Infrastructure' },
      { id: 5, name: 'Renovation' },
    ],
    contractTypes: [
      { id: 1, name: 'Fixed Price' },
      { id: 2, name: 'Time & Material' },
      { id: 3, name: 'Cost Plus' },
      { id: 4, name: 'Unit Price' },
    ],
    projects: [
      { id: 1, name: 'Office Building Project', client_name: 'Tech Corp', manager_name: 'John Smith', op_number: 'OP-2024-001', status: 'Ongoing', contract_date: '2023-12-15', project_folder: 'https://drive.google.com/drive', currency: 'USD', project_location: 'Fatih / Istanbul', project_coordinates: '41.0082,28.9784', project_type: 'Commercial', service_type: 'Full Project Management', area_sqm: 1500, contract_type: 'Fixed Price' },
      { id: 2, name: 'Residential Complex', client_name: 'Build Co', manager_name: 'Sarah Johnson', op_number: 'OP-2024-002', status: 'Planning', contract_date: '2024-01-20', project_folder: 'https://onedrive.live.com', currency: 'EUR', project_location: 'Cankaya / Ankara', project_coordinates: '39.9334,32.8597', project_type: 'Residential', service_type: 'Design & Build', area_sqm: 3200, contract_type: 'Time & Material' },
      { id: 3, name: 'Warehouse Renovation', client_name: 'Retail Plus', manager_name: 'Mike Chen', op_number: 'OP-2024-003', status: 'Completed', contract_date: '2023-11-05', project_folder: 'https://dropbox.com', currency: 'TRY', project_location: 'Konak / Izmir', project_coordinates: '38.4237,27.1428', project_type: 'Industrial', service_type: 'Construction Management', area_sqm: 2800, contract_type: 'Cost Plus' },
    ],
    invoices: [
      { id: 1, number: 'INV-001', date: '2024-01-15', amount: 15000, currency: 'USD', fx_rate: 1.0, op_number: 'OP-2024-001', status: 'Issued' },
      { id: 2, number: 'INV-002', date: '2024-02-20', amount: 25000, currency: 'EUR', fx_rate: 1.08, op_number: 'OP-2024-002', status: 'Planning' },
      { id: 3, number: 'INV-003', date: '2024-03-10', amount: 40000, currency: 'GBP', fx_rate: 1.27, op_number: 'OP-2024-003', status: 'Issued' },
    ],
  };

// --- STATIC TABLE CONFIGURATION (Moved outside component) ---
const tableConfigs = {
  reports: { label: 'Reports', isReport: true, roles: ['superadmin', 'admin', 'viewer'] },
  costAnalysis: { label: 'Cost Analysis', isReport: true, roles: ['superadmin', 'admin', 'viewer'] },
  users: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'password', label: 'Password' }], roles: ['superadmin'] },
  projectManagers: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status' }], roles: ['superadmin'] },
  clients: { columns: [{ key: 'id', label: 'ID' }, { key: 'company_name', label: 'Company Name' }, { key: 'address', label: 'Address' }, { key: 'contact_name', label: 'Contact Name' }, { key: 'contact_mail', label: 'Contact Mail' }, { key: 'contact_phone', label: 'Contact Phone' }, { key: 'sector', label: 'Sector' }], roles: ['superadmin', 'admin'] },
  contractors: { label: 'Contractors List', columns: [{ key: 'id', label: 'ID' }, { key: 'company_name', label: 'Company Name' }, { key: 'address', label: 'Address' }, { key: 'contact_name', label: 'Contact Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }], roles: ['superadmin', 'admin'] },
  externalConsultants: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Consultant Name' }, { key: 'specialty', label: 'Specialty' }], roles: ['superadmin'] },
  roles: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Role Name' }], roles: ['superadmin'] },
  projectManagementInfo: { columns: [{ key: 'id', label: 'ID' }, { key: 'op_number', label: 'OP Number' }, { key: 'project_name', label: 'Project Name' }, { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'fee', label: 'Fee' }, { key: 'cost', label: 'Cost' }, { key: 'currency', label: 'Currency' }, { key: 'duration', label: 'Duration (months)' }, { key: 'profit', label: 'Profit', computed: true }, { key: 'total_fee', label: 'Total Fee', computed: true }, { key: 'total_profit', label: 'Total Profit', computed: true }], roles: ['superadmin', 'admin'] },
  contractedWorks: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Work Name' }], roles: ['superadmin', 'admin'] },
  projectContractors: { columns: [{ key: 'id', label: 'ID' }, { key: 'op_number', label: 'OP Number' }, { key: 'project_name', label: 'Project Name' }, { key: 'contractor_name', label: 'Contractor Name' }, { key: 'contracted_works', label: 'Contracted Works' }, { key: 'contract_date', label: 'Contract Date' }, { key: 'start', label: 'Start' }, { key: 'end', label: 'End' }, { key: 'contract_amount', label: 'Contract Amount' }, { key: 'contract_currency', label: 'Contract Currency' }, { key: 'fx_rate', label: 'FX Rate' }, { key: 'amount_try', label: 'Amount (₺)', computed: true }], roles: ['superadmin', 'admin'] },
  serviceTypes: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Service Type' }], roles: ['superadmin'] },
  projectTypes: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Project Type' }], roles: ['superadmin'] },
  contractTypes: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Contract Type' }], roles: ['superadmin'] },
  projects: { columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Project Name' }, { key: 'client_name', label: 'Client Name' }, { key: 'manager_name', label: 'Project Manager' }, { key: 'op_number', label: 'OP Number' }, { key: 'status', label: 'Status' }, { key: 'project_location', label: 'Project Location' }, { key: 'project_coordinates', label: 'Project Coordinates' }, { key: 'project_type', label: 'Project Type' }, { key: 'service_type', label: 'Service Type' }, { key: 'area_sqm', label: 'Area (sqm)' }, { key: 'contract_type', label: 'Contract Type' }, { key: 'contract_date', label: 'Contract Date' }, { key: 'project_folder', label: 'Project Folder' }, { key: 'pm_fee', label: 'PM Fee', computed: true }, { key: 'currency', label: 'Currency' }], roles: ['superadmin', 'admin', 'viewer'] },
  invoices: { columns: [{ key: 'id', label: 'ID' }, { key: 'number', label: 'Invoice Number' }, { key: 'date', label: 'Date' }, { key: 'amount', label: 'Amount' }, { key: 'currency', label: 'Currency' }, { key: 'fx_rate', label: 'FX Rate' }, { key: 'amount_try', label: 'Amount (₺)', computed: true }, { key: 'op_number', label: 'OP Number' }, { key: 'status', label: 'Status' }], roles: ['superadmin', 'admin'] },
};

// --- Components ---

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl scale-100 transform transition-all">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:shadow-red-300">Delete Record</button>
        </div>
      </div>
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  if (total === 0) return <div className="h-64 flex items-center justify-center text-gray-400">No cost data available</div>;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
      <div className="relative w-64 h-64">
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
          {data.map((slice, i) => {
            const sliceAngle = (slice.value / total) * 2 * Math.PI;
            const x1 = Math.cos(currentAngle);
            const y1 = Math.sin(currentAngle);
            const x2 = Math.cos(currentAngle + sliceAngle);
            const y2 = Math.sin(currentAngle + sliceAngle);
            const isLargeArc = sliceAngle > Math.PI ? 1 : 0;
            const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${isLargeArc} 1 ${x2} ${y2} Z`;
            const color = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'][i % 8];
            currentAngle += sliceAngle;
            return (
              <path key={slice.name} d={pathData} fill={color} stroke="white" strokeWidth="0.02" className="hover:opacity-80 transition-opacity cursor-pointer">
                <title>{`${slice.name}: ${Math.round(slice.value/total*100)}%`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {data.map((slice, i) => (
          <div key={slice.name} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'][i % 8] }}></div>
            <span className="font-medium text-gray-700">{slice.name}</span>
            <span className="text-gray-400 text-xs w-10 text-right">({Math.round(slice.value/total*100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectMap = ({ projects }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Check if Leaflet is loaded
    if (window.L && !mapReady) {
       setMapReady(true);
       return;
    }
    
    // Load CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
    
    // Load JS
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => setMapReady(true);
      document.body.appendChild(script);
    }
  }, [mapReady]);

  // Initialize/Update map when mapReady or projects change
  useEffect(() => {
    if (!mapReady || !window.L || !mapRef.current) return;
    
    const L = window.L;
    
    // Create map if not exists
    if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([39.9334, 32.8597], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
        mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers (simple way: remove all layers and re-add tiles/markers, or use layerGroup. For simplicity here: plain markers)
    // In a real app we'd track marker references. Here we just clear the map mostly.
    map.eachLayer((layer) => {
        if (!layer._url) { // Don't remove tiles
            map.removeLayer(layer);
        }
    });

    const bounds = L.latLngBounds();

    projects.forEach(project => {
      if (!project.project_coordinates) return;
      const [lat, lon] = project.project_coordinates.split(',').map(parseFloat);
      if (isNaN(lat) || isNaN(lon)) return;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="display: flex; justify-content: center; align-items: center; color: #dc2626; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map).bindPopup(`<div class="text-center"><div class="font-bold text-gray-900">${project.name}</div><div class="text-xs text-gray-500">${project.project_location}</div></div>`);
      marker.on('mouseover', function(e) { this.openPopup(); });
      marker.on('mouseout', function(e) { this.closePopup(); });
      bounds.extend([lat, lon]);
    });

    if (projects.length > 0 && !bounds.isValid()) {
         // handle case
    } else if (projects.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }

  }, [mapReady, projects]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-300 z-0 bg-gray-100" />;
};

const DataTable = ({ data, columns, onEdit, onDelete, onAdd, tableName, allData, userRole }) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState('');
  const itemsPerPage = 10;

  const canEdit = userRole === 'superadmin' || (userRole === 'admin' && tableName !== 'users');
  const canDelete = userRole === 'superadmin' || (userRole === 'admin' && tableName !== 'users');
  const canAdd = userRole === 'superadmin' || (userRole === 'admin' && tableName !== 'users');
  const isViewer = userRole === 'viewer';

  const filteredData = useMemo(() => {
    let result = data.filter(row => columns.some(col => String(row[col.key] || '').toLowerCase().includes(search.toLowerCase())));
    if (sortCol) {
      result.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortCol, sortDir, columns]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (col) => { if (sortCol === col) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } else { setSortCol(col); setSortDir('asc'); } setCurrentPage(1); };
  const handleEditClick = (row) => { if (!canEdit || isViewer) return; setFormData({ ...row }); setEditingId(row.id); setFormError(''); setShowForm(true); };
  const handleSave = () => {
    setFormError('');
    if (!formData.name && columns.some(c => c.key === 'name')) { setFormError('Name is required'); return; }
    try { if (editingId) { onEdit(editingId, formData); } else { onAdd({ ...formData, id: Date.now() }); } setShowForm(false); setFormData({}); setEditingId(null); } catch (err) { setFormError(err.message || 'Error saving record'); }
  };
  const handleFormChange = (key, value) => { setFormData(prev => ({ ...prev, [key]: value })); };
  const handleCoordinatesBlur = async () => {
    const coords = formData.project_coordinates;
    if (!coords || !coords.includes(',')) return;
    const [lat, lon] = coords.split(',').map(s => s.trim());
    if (!lat || !lon) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (response.ok) {
        const data = await response.json();
        const formattedLocation = `${data.address.suburb || data.address.district || 'Unknown'} / ${data.address.city || data.address.province || 'Unknown'}`;
        handleFormChange('project_location', formattedLocation);
      }
    } catch (error) { console.error("Failed to fetch location", error); }
  };

  const exportToCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = filteredData.map(row => columns.map(col => `"${row[col.key] || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}-export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getComputedPMFee = (row) => {
      if (!allData || !allData.projectManagementInfo) return 0;
      const pmInfos = allData.projectManagementInfo.filter(info => info.op_number === row.op_number);
      return pmInfos.reduce((sum, item) => sum + ((parseFloat(item.fee) || 0) * (parseFloat(item.duration) || 0)), 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': case 'Completed': case 'Paid': case 'Issued': return 'bg-green-100 text-green-700';
      case 'Inactive': case 'Unpaid': return 'bg-red-100 text-red-700';
      case 'Ongoing': case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Planning': case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        <div className="flex gap-2">
          {!isViewer && canAdd && <button onClick={() => { setFormData({}); setEditingId(null); setFormError(''); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"><Plus size={18} /> <span className="hidden sm:inline">Add New</span></button>}
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"><Download size={18} /> <span className="hidden sm:inline">Export CSV</span></button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)} className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2">{col.label} {sortCol === col.key && <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>}</div>
                </th>
              ))}
              {!isViewer && (canEdit || canDelete) && <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-600">
                      {col.computed && col.key === 'amount_try' ? (row.amount && row.fx_rate ? `₺${(parseFloat(row.amount) * parseFloat(row.fx_rate)).toFixed(2)}` : row.contract_amount && row.fx_rate ? `₺${(parseFloat(row.contract_amount) * parseFloat(row.fx_rate)).toFixed(2)}` : '-')
                        : col.computed && col.key === 'total_fee' ? (row.fee && row.duration ? `${(parseFloat(row.fee) * parseFloat(row.duration)).toLocaleString()} ${row.currency || ''}` : '-')
                        : col.computed && col.key === 'profit' ? `${((parseFloat(row.fee) || 0) - (parseFloat(row.cost) || 0)).toLocaleString()} ${row.currency || ''}`
                        : col.computed && col.key === 'total_profit' ? `${(((parseFloat(row.fee) || 0) - (parseFloat(row.cost) || 0)) * (parseFloat(row.duration) || 0)).toLocaleString()} ${row.currency || ''}`
                        : col.computed && col.key === 'pm_fee' ? `${getComputedPMFee(row).toLocaleString()} ${row.currency || 'USD'}`
                        : col.key === 'status' ? (<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row[col.key])}`}>{row[col.key] || '-'}</span>)
                        : col.key === 'project_folder' ? (row[col.key] ? <a href={row[col.key]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Folder size={14} /> Open</a> : <span className="text-gray-400 text-xs">No Link</span>)
                        : (String(row[col.key] || '-') || '-')}
                    </td>
                  ))}
                  {!isViewer && (canEdit || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {canEdit && <button onClick={() => handleEditClick(row)} className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-100 rounded-lg transition"><Edit size={16} /></button>}
                        {canDelete && <button onClick={() => onDelete(row.id)} className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-100 rounded-lg transition"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (<tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">No records found</td></tr>)}
          </tbody>
        </table>
      </div>

      {showForm && !isViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Record' : 'Add New Record'}</h2>
              <button onClick={() => { setShowForm(false); setFormData({}); setFormError(''); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex gap-2"><AlertCircle size={18} className="flex-shrink-0 mt-0.5" /><span>{formError}</span></div>}
            <div className="space-y-4">
              {columns.map(col => {
                if (col.key === 'id' || col.computed) return null;

                // --- Project Management Info Table Logic ---
                if (tableName === 'projectManagementInfo') {
                  if (col.key === 'project_name') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pmi-projects-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFormChange(col.key, val);
                            const proj = allData.projects.find(p => p.name === val);
                            if (proj) handleFormChange('op_number', proj.op_number);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Project..."
                        />
                        <datalist id="pmi-projects-list">
                          {allData.projects.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                      </div>
                    );
                  }
                  if (col.key === 'op_number') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input type="text" value={formData[col.key] || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" placeholder="Auto-filled" />
                      </div>
                    );
                  }
                  if (col.key === 'name') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pmi-managers-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => handleFormChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Manager..."
                        />
                        <datalist id="pmi-managers-list">
                          {allData.projectManagers.map(m => <option key={m.id} value={m.name} />)}
                        </datalist>
                      </div>
                    );
                  }
                  if (col.key === 'role') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pmi-roles-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => handleFormChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Role..."
                        />
                        <datalist id="pmi-roles-list">
                          {allData.roles.map(r => <option key={r.id} value={r.name} />)}
                        </datalist>
                      </div>
                    );
                  }
                }

                // --- Project Contractors Table Logic ---
                if (tableName === 'projectContractors') {
                  if (col.key === 'project_name') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pc-projects-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFormChange(col.key, val);
                            const proj = allData.projects.find(p => p.name === val);
                            if (proj) handleFormChange('op_number', proj.op_number);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Project..."
                        />
                        <datalist id="pc-projects-list">
                          {allData.projects.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                      </div>
                    );
                  }
                  if (col.key === 'op_number') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input type="text" value={formData[col.key] || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" placeholder="Auto-filled" />
                      </div>
                    );
                  }
                  if (col.key === 'contractor_name') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pc-contractors-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => handleFormChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Contractor..."
                        />
                        <datalist id="pc-contractors-list">
                          {allData.contractors.map(c => <option key={c.id} value={c.company_name} />)}
                        </datalist>
                      </div>
                    );
                  }
                  if (col.key === 'contracted_works') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pc-works-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => handleFormChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Work Type..."
                        />
                        <datalist id="pc-works-list">
                          {allData.contractedWorks.map(w => <option key={w.id} value={w.name} />)}
                        </datalist>
                      </div>
                    );
                  }
                }

                // --- Projects Table Logic ---
                if (tableName === 'projects') {
                  if (col.key === 'client_name') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input
                          list="pr-clients-list"
                          value={formData[col.key] || ''}
                          onChange={(e) => handleFormChange(col.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search Client..."
                        />
                        <datalist id="pr-clients-list">
                          {allData.clients.map(c => <option key={c.id} value={c.company_name} />)}
                        </datalist>
                      </div>
                    );
                  }
                  if (col.key === 'project_location') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <input type="text" value={formData[col.key] || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" placeholder="Auto-filled from coordinates" />
                      </div>
                    );
                  }
                  if (col.key === 'project_type') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">Select Project Type</option>
                          {allData.projectTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                    );
                  }
                  if (col.key === 'service_type') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">Select Service Type</option>
                          {allData.serviceTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                    );
                  }
                  if (col.key === 'contract_type') {
                    return (
                      <div key={col.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                        <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="">Select Contract Type</option>
                          {allData.contractTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                        </select>
                      </div>
                    );
                  }
                }

                // --- Generic Fallback for all other fields ---
                return (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{col.label}</label>
                    {col.key === 'status' ? (
                      <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select Status</option>
                        {['Active', 'Inactive', 'Ongoing', 'Completed', 'Planning', 'Pending', 'Paid', 'Unpaid', 'Issued'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : col.key === 'currency' || col.key === 'contract_currency' ? (
                        <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Select Currency</option>{['USD', 'EUR', 'GBP', 'TRY', 'JPY', 'CAD'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                    ) : col.key === 'manager_name' ? (
                       // Keeping old logic for other tables if manager_name exists elsewhere not covered above
                       <select value={formData[col.key] || ''} onChange={(e) => handleFormChange(col.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Select Manager</option>{allData.projectManagers.map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}</select>
                    ) : (
                      <input 
                        type={col.key.includes('date') ? 'date' : ['amount', 'fee', 'cost', 'duration', 'fx_rate', 'area_sqm'].includes(col.key) ? 'number' : 'text'} 
                        step={['amount', 'fee', 'cost', 'fx_rate'].includes(col.key) ? '0.01' : '1'}
                        value={formData[col.key] || ''} 
                        onChange={(e) => handleFormChange(col.key, e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        onBlur={col.key === 'project_coordinates' ? handleCoordinatesBlur : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t mt-4">
              <button onClick={() => { setShowForm(false); setFormData({}); setFormError(''); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Cost Analysis Page ---
const ConstructionCostAnalysis = ({ data }) => {
  const [filterProject, setFilterProject] = useState('');
  const [filterClient, setFilterClient] = useState('');
  
  const projects = data.projects;
  const filteredProjects = projects.filter(p => {
    if (filterProject && !p.name.toLowerCase().includes(filterProject.toLowerCase())) return false;
    if (filterClient && p.client_name !== filterClient) return false;
    return true;
  });

  const availableClients = [...new Set(projects.map(p => p.client_name))];

  // Aggregation Logic
  const analysisData = filteredProjects.flatMap(project => {
    // 1. Get Contractors for this project
    const contractors = data.projectContractors.filter(c => c.op_number === project.op_number);
    const projectCurrency = project.currency || 'USD';
    
    // Group contractors by "Contracted Work"
    const worksMap = {};
    contractors.forEach(c => {
      const workName = c.contracted_works || 'Unspecified';
      if (!worksMap[workName]) {
        worksMap[workName] = {
          id: `${project.op_number}-${workName}`,
          projectName: project.name,
          workName: workName,
          contractDate: c.contract_date, // Take first one found
          totalAmount: 0,
          totalAmountBase: 0, // For Pie Chart (Base: TRY)
          currency: projectCurrency,
          area: project.area_sqm || 0,
          isPM: false
        };
      }
      // Sum in native currency
      const amountNative = (parseFloat(c.contract_amount) || 0);
      worksMap[workName].totalAmount += amountNative;
      
      // Sum in Base currency (TRY) for Chart
      // Assuming we can use fx_rate from the contract if available, or project global
      const fx = c.fx_rate || 1; 
      worksMap[workName].totalAmountBase += (amountNative * fx);
      
      // Update date logic: keep earliest date
      if (c.contract_date && c.contract_date < worksMap[workName].contractDate) {
        worksMap[workName].contractDate = c.contract_date;
      }
    });

    const worksList = Object.values(worksMap);

    // 2. Get PM Cost
    const pmInfos = data.projectManagementInfo.filter(pm => pm.op_number === project.op_number);
    const totalPmFee = pmInfos.reduce((sum, pm) => {
        return sum + ((parseFloat(pm.fee) || 0) * (parseFloat(pm.duration) || 0));
    }, 0);

    if (totalPmFee > 0) {
      // Estimate Base Currency for Chart
      let fx = 1;
      if (projectCurrency === 'USD') fx = 32.5; 
      if (projectCurrency === 'EUR') fx = 35.2;
      
      worksList.push({
        id: `${project.op_number}-PM`,
        projectName: project.name,
        workName: 'Project Management',
        contractDate: project.contract_date, 
        totalAmount: totalPmFee,
        totalAmountBase: totalPmFee * fx,
        currency: projectCurrency,
        area: project.area_sqm || 0,
        isPM: true
      });
    }

    return worksList;
  });

  // Prepare Chart Data (Aggregated by Work Type across filtered projects using Base Currency TRY)
  const chartAggregation = analysisData.reduce((acc, item) => {
    const key = item.workName;
    acc[key] = (acc[key] || 0) + item.totalAmountBase;
    return acc;
  }, {});

  const pieChartData = Object.entries(chartAggregation)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Search size={20} className="text-gray-400"/> Filter Analysis</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input type="text" placeholder="Filter by Project..." value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Clients</option>
              {availableClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-blue-600"/> Cost Distribution (Normalized)</h3>
          <div className="flex-1 min-h-[300px]">
            <SimplePieChart data={pieChartData} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart3 size={20} className="text-blue-600"/> Detailed Breakdown</h3>
            <span className="text-sm text-gray-500">{analysisData.length} records found</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-left">Work Scope</th>
                  <th className="px-6 py-3 text-left">Quarter</th>
                  <th className="px-6 py-3 text-right">Total Cost</th>
                  <th className="px-6 py-3 text-right">Area (m²)</th>
                  <th className="px-6 py-3 text-right">Cost/m²</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analysisData.map((row) => (
                  <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${row.isPM ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.projectName}</td>
                    <td className="px-6 py-4">
                      {row.isPM ? <span className="inline-flex items-center gap-1 text-blue-700 font-medium"><Shield size={12}/> {row.workName}</span> : row.workName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{getQuarter(row.contractDate)}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">{row.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {row.currency}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{row.area.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {row.area > 0 ? `${(row.totalAmount / row.area).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${row.currency}` : '-'}
                    </td>
                  </tr>
                ))}
                {analysisData.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No data matches your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sign In Component ---
const SignInPage = ({ onSignIn, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      onSignIn({ email: user.email, role: user.role, name: user.name });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-4 shadow-inner"><User size={40} className="text-blue-600" /></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to Project Management DBMS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex gap-3 items-start animate-in fade-in"><AlertCircle size={18} className="flex-shrink-0 mt-0.5" /><span>{error}</span></div>}
          <div><label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="your@email.com" required /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="••••••••" required /></div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-[1.01] shadow-lg shadow-blue-200">Sign In</button>
        </form>
        <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Demo Credentials</p>
          <div className="space-y-2 text-xs text-gray-600 font-mono">
            <div className="flex justify-between"><span>super@company.com</span><span className="text-gray-400">super123</span></div>
            <div className="flex justify-between"><span>admin@company.com</span><span className="text-gray-400">admin123</span></div>
            <div className="flex justify-between"><span>viewer@company.com</span><span className="text-gray-400">view123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reports View ---
const ReportsView = ({ data }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterProjectType, setFilterProjectType] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterSingleProject, setFilterSingleProject] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');

  const filteredByStatus = filterStatus ? data.projects.filter(p => p.status === filterStatus) : data.projects;
  const availableClients = [...new Set(filteredByStatus.map(p => p.client_name))];
  const availableProjectTypes = [...new Set(filteredByStatus.map(p => p.project_type))];
  const availableManagers = [...new Set(data.projects.map(p => p.manager_name))];

  const searchableProjects = data.projects.filter(project =>
    project.op_number.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const filteredProjects = data.projects.filter(project => {
    if (filterSingleProject && project.op_number !== filterSingleProject) return false;
    if (filterStatus && project.status !== filterStatus) return false;
    if (filterClient && project.client_name !== filterClient) return false;
    if (filterProjectType && project.project_type !== filterProjectType) return false;
    if (filterManager && project.manager_name !== filterManager) return false;
    return true;
  });

  const projectDetails = selectedProject ? data.projects.find(p => p.op_number === selectedProject) : filterSingleProject ? data.projects.find(p => p.op_number === filterSingleProject) : null;
  const projectContractors = (selectedProject || filterSingleProject) ? data.projectContractors.filter(pc => pc.op_number === (selectedProject || filterSingleProject)) : [];
  const projectPMInfo = (selectedProject || filterSingleProject) ? data.projectManagementInfo.filter(pm => pm.op_number === (selectedProject || filterSingleProject)) : [];
  
  const totalProjectPMFee = projectPMInfo.reduce((sum, item) => sum + ((parseFloat(item.fee) || 0) * (parseFloat(item.duration) || 0)), 0);
  const totalArea = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.area_sqm) || 0), 0);
  
  const filteredOpNumbers = filteredProjects.map(p => p.op_number);
  const allFilteredPMInfo = data.projectManagementInfo.filter(pm => filteredOpNumbers.includes(pm.op_number));
  
  const pmFeesByCurrency = allFilteredPMInfo.reduce((acc, item) => {
      const currency = item.currency || 'USD';
      const totalFee = (parseFloat(item.fee) || 0) * (parseFloat(item.duration) || 0);
      acc[currency] = (acc[currency] || 0) + totalFee;
      return acc;
  }, {});

  const totalContractAmount = projectContractors.reduce((sum, pc) => sum + ((parseFloat(pc.contract_amount) || 0) * (parseFloat(pc.fx_rate) || 0)), 0);
  const uniqueStatuses = [...new Set(data.projects.map(p => p.status))];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-blue-100 text-lg">Real-time ecosystem overview</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Search size={20} className="text-gray-400"/> Filter Projects</h3>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Project</label>
            <div className="relative">
              <input type="text" placeholder="Type name or OP..." value={projectSearchTerm} onChange={(e) => setProjectSearchTerm(e.target.value)} onFocus={() => setProjectSearchTerm('')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {projectSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div onClick={() => { setFilterSingleProject(''); setProjectSearchTerm(''); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-600">View All Projects</div>
                  {searchableProjects.map(project => (
                    <div key={project.id} onClick={() => { setFilterSingleProject(project.op_number); setProjectSearchTerm(`${project.op_number} - ${project.name}`); setFilterStatus(''); setFilterClient(''); setFilterProjectType(''); setFilterManager(''); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-100">
                      <div className="font-medium text-gray-800">{project.op_number}</div>
                      <div className="text-sm text-gray-600">{project.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Manager</label>
            <input list="filter-managers" value={filterManager} onChange={(e) => setFilterManager(e.target.value)} disabled={!!filterSingleProject} placeholder="Search Manager" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white" />
            <datalist id="filter-managers">
                {availableManagers.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} disabled={!!filterSingleProject} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} disabled={!!filterSingleProject} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
              <option value="">All Clients</option>
              {availableClients.map(client => <option key={client} value={client}>{client}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
            <select value={filterProjectType} onChange={(e) => setFilterProjectType(e.target.value)} disabled={!!filterSingleProject} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white">
              <option value="">All Types</option>
              {availableProjectTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        {(filterStatus || filterClient || filterProjectType || filterSingleProject || filterManager) && (
          <button onClick={() => { setFilterStatus(''); setFilterClient(''); setFilterProjectType(''); setFilterSingleProject(''); setProjectSearchTerm(''); setFilterManager(''); }} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
            <X size={16}/> Clear All Filters
          </button>
        )}
      </div>

      {!filterSingleProject && filteredProjects.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-gray-400"/> Project Locations</h3>
          <ProjectMap projects={filteredProjects} />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900">{filteredProjects.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total PM Amount</div>
          <div className="space-y-1">
             {Object.entries(pmFeesByCurrency).map(([currency, amount]) => (
                 <div key={currency} className="text-3xl font-bold text-green-600">
                    {amount.toLocaleString()} <span className="text-sm text-gray-500">{currency}</span>
                 </div>
             ))}
             {Object.keys(pmFeesByCurrency).length === 0 && <div className="text-3xl font-bold text-green-600">0</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Area</div>
          <div className="text-3xl font-bold text-purple-600">{totalArea.toLocaleString()} sqm</div>
        </div>
      </div>

      {filterSingleProject && projectDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="border-b pb-4 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{projectDetails.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{projectDetails.op_number}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{projectDetails.status}</span>
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Project Information</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-gray-500">Client</div><div className="font-medium text-gray-900">{projectDetails.client_name}</div>
                <div className="text-gray-500">Manager</div><div className="font-medium text-gray-900">{projectDetails.manager_name}</div>
                <div className="text-gray-500">Type</div><div className="font-medium text-gray-900">{projectDetails.project_type}</div>
                <div className="text-gray-500">Contract Date</div><div className="font-medium text-gray-900">{projectDetails.contract_date || '-'}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Specs & Location</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-gray-500">Location</div><div className="font-medium text-gray-900">{projectDetails.project_location}</div>
                <div className="text-gray-500">Area</div><div className="font-medium text-gray-900">{projectDetails.area_sqm?.toLocaleString()} sqm</div>
                <div className="text-gray-500">Project Folder</div><div className="font-medium text-gray-900">{projectDetails.project_folder ? <a href={projectDetails.project_folder} target="_blank" className="text-blue-600 hover:underline">Open Link</a> : '-'}</div>
                <div className="text-gray-500">Coordinates</div><div className="font-medium text-gray-900 text-xs font-mono">{projectDetails.project_coordinates}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="text-xs font-semibold text-green-600 uppercase mb-1">Total PM Fee</div>
              <div className="text-2xl font-bold text-green-900">{totalProjectPMFee.toLocaleString()} <span className="text-lg">{projectDetails.currency}</span></div>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Contractors Assigned</div>
              <div className="text-2xl font-bold text-purple-900">{projectContractors.length}</div>
            </div>
          </div>
        </div>
      )}

      {!filterSingleProject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 className="text-lg font-bold text-gray-800">All Projects ({filteredProjects.length})</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">OP Number</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Project Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Manager</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">PM Fee</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project, idx) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{project.op_number}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                    <td className="px-6 py-4 text-gray-600">{project.manager_name}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : project.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{project.status}</span></td>
                    <td className="px-6 py-4 text-gray-600">{(() => {
                        const pmInfos = data.projectManagementInfo.filter(info => info.op_number === project.op_number);
                        const total = pmInfos.reduce((sum, item) => sum + ((parseFloat(item.fee) || 0) * (parseFloat(item.duration) || 0)), 0);
                        return `${total.toLocaleString()} ${project.currency}`;
                    })()}</td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedProject(project.op_number)} className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline">View Details</button></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Project Details Modal for "View Details" button */}
      {selectedProject && projectDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{projectDetails.name}</h2>
                <div className="text-sm text-gray-500">{projectDetails.op_number}</div>
              </div>
              <button onClick={() => setSelectedProject('')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Project Information</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div className="text-gray-500">Client</div><div className="font-medium text-gray-900">{projectDetails.client_name}</div>
                            <div className="text-gray-500">Manager</div><div className="font-medium text-gray-900">{projectDetails.manager_name}</div>
                            <div className="text-gray-500">Type</div><div className="font-medium text-gray-900">{projectDetails.project_type}</div>
                            <div className="text-gray-500">Contract Date</div><div className="font-medium text-gray-900">{projectDetails.contract_date || '-'}</div>
                            <div className="text-gray-500">Status</div><div className="font-medium text-gray-900">{projectDetails.status}</div>
                            <div className="text-gray-500">Service Type</div><div className="font-medium text-gray-900">{projectDetails.service_type || '-'}</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h3 className="font-bold text-gray-800 mb-3 uppercase text-xs tracking-wider">Specs & Location</h3>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div className="text-gray-500">Location</div><div className="font-medium text-gray-900">{projectDetails.project_location}</div>
                            <div className="text-gray-500">Area</div><div className="font-medium text-gray-900">{projectDetails.area_sqm?.toLocaleString()} sqm</div>
                            <div className="text-gray-500">Project Folder</div><div className="font-medium text-gray-900">{projectDetails.project_folder ? <a href={projectDetails.project_folder} target="_blank" className="text-blue-600 hover:underline">Open Link</a> : '-'}</div>
                            <div className="text-gray-500">Coordinates</div><div className="font-medium text-gray-900 text-xs font-mono">{projectDetails.project_coordinates}</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                        <div className="text-xs font-semibold text-green-600 uppercase mb-1">Total PM Fee</div>
                        <div className="text-2xl font-bold text-green-900">{totalProjectPMFee.toLocaleString()} <span className="text-lg">{projectDetails.currency}</span></div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                        <div className="text-xs font-semibold text-purple-600 uppercase mb-1">Contractors Assigned</div>
                        <div className="text-2xl font-bold text-purple-900">{projectContractors.length}</div>
                    </div>
                </div>

                 {projectDetails.project_coordinates && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <div className="relative" style={{height: '300px'}}>
                            <iframe width="100%" height="100%" frameBorder="0" style={{border: 0}} src={`https://www.openstreetmap.org/export/embed.html?bbox=${projectDetails.project_coordinates.split(',')[1]}%2C${projectDetails.project_coordinates.split(',')[0]}%2C${parseFloat(projectDetails.project_coordinates.split(',')[1]) + 0.02}%2C${parseFloat(projectDetails.project_coordinates.split(',')[0]) + 0.02}&layer=mapnik&marker=${projectDetails.project_coordinates.split(',')[0]}%2C${projectDetails.project_coordinates.split(',')[1]}`} allowFullScreen title="Project Location Map" />
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Contractors</h4>
                    {projectContractors.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Company</th><th className="px-4 py-2 text-left">Works</th><th className="px-4 py-2 text-right">Amount (₺)</th></tr></thead>
                                <tbody className="divide-y">{projectContractors.map(pc => <tr key={pc.id}><td className="px-4 py-2">{pc.contractor_name}</td><td className="px-4 py-2">{pc.contracted_works}</td><td className="px-4 py-2 text-right">₺{((pc.contract_amount||0)*(pc.fx_rate||0)).toLocaleString(undefined, {maximumFractionDigits:0})}</td></tr>)}</tbody>
                            </table>
                        </div>
                    ) : <div className="text-gray-500 text-sm">No contractors assigned.</div>}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(INITIAL_DUMMY_DATA); // Init with dummy
  const [activeTab, setActiveTab] = useState('reports');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, table: null, id: null });
  const [loading, setLoading] = useState(false);

  // --- GOOGLE SHEETS FETCHING LOGIC ---
  useEffect(() => {
    if (API_URL) {
      setLoading(true);
      fetch(API_URL)
        .then(res => res.json())
        .then(json => {
          if (json.status === 'success') {
            // Merge response data with initial dummy structure to ensure all keys exist
            // This handles cases where the sheet might be empty initially
            setData(prev => ({
                ...prev,
                ...json.data
            }));
          } else {
            console.error("Google Sheets API Error:", json.message);
          }
        })
        .catch(err => console.error("Fetch Error:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  const syncToSheet = async (action, table, payloadId, payloadData) => {
    if (!API_URL) return; // Only sync if API is configured
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script Web App requirement for simple requests
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          table: table,
          id: payloadId,
          data: payloadData
        })
      });
      // Note: 'no-cors' mode means we can't read the response, 
      // so we optimistically update UI or re-fetch if critical.
      // For this demo, we rely on local state update which happens in handleAdd/Edit/Delete
    } catch (e) {
      console.error("Sync Error:", e);
    }
  };

  const getAvailableTabs = useMemo(() => {
    if (!user) return [];
    return Object.keys(tableConfigs).filter(tab => tableConfigs[tab].roles.includes(user.role));
  }, [user]);

  // Use useEffect to handle side-effect of state change, but depend on memoized availableTabs
  useEffect(() => {
    if (user && !getAvailableTabs.includes(activeTab) && getAvailableTabs.length > 0) {
      setActiveTab(getAvailableTabs[0]);
    }
  }, [user, getAvailableTabs, activeTab]);

  const handleEdit = (table, id, updatedRow) => {
    setData({ ...data, [table]: data[table].map(row => row.id === id ? { ...row, ...updatedRow } : row) });
    syncToSheet('edit', table, id, updatedRow);
  };

  const handleDeleteRequest = (table, id) => {
    setDeleteModal({ isOpen: true, table, id });
  };

  const handleConfirmDelete = () => {
    const { table, id } = deleteModal;
    if (table && id) {
      setData({ ...data, [table]: data[table].filter(row => row.id !== id) });
      syncToSheet('delete', table, id, null);
    }
    setDeleteModal({ isOpen: false, table: null, id: null });
  };

  const handleAdd = (table, newRow) => {
    setData({ ...data, [table]: [...data[table], newRow] });
    syncToSheet('add', table, null, newRow);
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('reports');
  };

  if (!user) {
    return <SignInPage onSignIn={setUser} users={data.users} />;
  }

  const config = tableConfigs[activeTab];
  const tabLabel = config?.label || (activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').trim());

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">P</div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">ProjectDBMS</h1>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center text-right">
                  <div className="mr-3">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize flex items-center justify-end gap-1">
                        {user.role === 'superadmin' && <Shield size={10} className="text-purple-600"/>}
                        {user.role}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><User size={20} /></div>
               </div>
               <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
               <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors" title="Sign Out"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex flex-nowrap gap-2">
                {getAvailableTabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-blue-600'}`}>
                    {tableConfigs[tab].label || tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </button>
                ))}
            </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'reports' ? (
            <ReportsView data={data} />
          ) : activeTab === 'costAnalysis' ? (
            <ConstructionCostAnalysis data={data} />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 capitalize">{tabLabel} Management</h2>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                            Manage records for {tabLabel.toLowerCase()}.
                            {user.role === 'viewer' && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs"><Lock size={12}/> Read Only</span>}
                        </p>
                    </div>
                    {loading && <div className="text-blue-600 flex items-center gap-2 text-sm"><RefreshCw className="animate-spin" size={16}/> Syncing...</div>}
                </div>
                <DataTable data={data[activeTab] || []} columns={config?.columns || []} onEdit={(id, row) => handleEdit(activeTab, id, row)} onDelete={(id) => handleDeleteRequest(activeTab, id)} onAdd={(row) => handleAdd(activeTab, row)} tableName={activeTab} allData={data} userRole={user.role} />
            </div>
          )}
        </div>
      </div>
      <DeleteModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, table: null, id: null })} onConfirm={handleConfirmDelete} />
    </div>
  );
}
