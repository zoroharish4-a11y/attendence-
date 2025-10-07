import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  AlertTriangle,
  FileText,
  Filter,
  Bell,
  Users,
  BookOpen
} from 'lucide-react';
import { Circular, User } from '../types';
import { mockCirculars } from '../data/mockData';
import { StorageManager } from '../utils/storage';

interface CircularManagementProps {
  currentUser: User;
}

export const CircularManagement: React.FC<CircularManagementProps> = ({ currentUser }) => {
  const [circulars, setCirculars] = useState<Circular[]>(mockCirculars);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCircular, setEditingCircular] = useState<Circular | null>(null);
  const [viewingCircular, setViewingCircular] = useState<Circular | null>(null);
  const [formData, setFormData] = useState<Partial<Circular>>({});

  const storage = StorageManager.getInstance();

  useEffect(() => {
    const savedCirculars = storage.getCirculars();
    if (savedCirculars.length > 0) {
      setCirculars(savedCirculars);
    }
  }, []);

  useEffect(() => {
    storage.saveCirculars(circulars);
  }, [circulars]);

  const categories = [
    { value: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-800' },
    { value: 'administrative', label: 'Administrative', color: 'bg-gray-100 text-gray-800' },
    { value: 'events', label: 'Events', color: 'bg-green-100 text-green-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
    { value: 'general', label: 'General', color: 'bg-purple-100 text-purple-800' }
  ];

  const priorities = [
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
  ];

  const filteredCirculars = circulars.filter(circular => {
    if (!circular.isActive) return false;
    
    const matchesSearch = circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circular.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || circular.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || circular.priority === selectedPriority;
    
    // Students can only see circulars targeted to them
    if (currentUser.role === 'student') {
      const matchesAudience = circular.targetAudience === 'all' || 
                             circular.targetAudience === 'students' ||
                             (circular.targetAudience === 'specific' && 
                              circular.departments?.includes(currentUser.course || ''));
      return matchesSearch && matchesCategory && matchesPriority && matchesAudience;
    }
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleAddCircular = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      targetAudience: 'all',
      departments: [],
      isActive: true
    });
    setEditingCircular(null);
    setShowAddModal(true);
  };

  const handleEditCircular = (circular: Circular) => {
    setFormData(circular);
    setEditingCircular(circular);
    setShowAddModal(true);
  };

  const handleDeleteCircular = (circularId: string) => {
    if (window.confirm('Are you sure you want to delete this circular?')) {
      setCirculars(prev => prev.map(c => 
        c.id === circularId ? { ...c, isActive: false } : c
      ));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCircular) {
      // Update existing circular
      setCirculars(prev => prev.map(c => 
        c.id === editingCircular.id ? { ...c, ...formData } : c
      ));
    } else {
      // Add new circular
      const newCircular: Circular = {
        id: Date.now().toString(),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        ...formData as Circular
      };
      setCirculars(prev => [...prev, newCircular]);
    }
    
    setShowAddModal(false);
    setFormData({});
    setEditingCircular(null);
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const isExpired = (circular: Circular) => {
    if (!circular.expiresAt) return false;
    return new Date(circular.expiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {currentUser.role === 'student' ? 'College Circulars' : 'Circular Management'}
          </h2>
          <p className="text-gray-600">
            {currentUser.role === 'student' 
              ? 'View important announcements and notices'
              : 'Create and manage college announcements'
            }
          </p>
        </div>
        {currentUser.role !== 'student' && (
          <button
            onClick={handleAddCircular}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Circular</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {filteredCirculars.length} circulars
          </div>
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.map((circular) => (
          <div key={circular.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            circular.priority === 'high' ? 'border-red-500' :
            circular.priority === 'medium' ? 'border-orange-500' : 'border-green-500'
          } ${isExpired(circular) ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{circular.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(circular.category)}`}>
                    {categories.find(c => c.value === circular.category)?.label}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(circular.priority)}`}>
                    {priorities.find(p => p.value === circular.priority)?.label}
                  </span>
                  {isExpired(circular) && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Expired
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{circular.content}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(circular.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {circular.createdBy}
                  </div>
                  {circular.expiresAt && (
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Expires: {new Date(circular.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-1" />
                    {circular.targetAudience === 'all' ? 'All' :
                     circular.targetAudience === 'students' ? 'Students' :
                     circular.targetAudience === 'faculty' ? 'Faculty' : 'Specific'}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setViewingCircular(circular)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {currentUser.role !== 'student' && (
                  <>
                    <button
                      onClick={() => handleEditCircular(circular)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCircular(circular.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCirculars.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No circulars found matching your criteria.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && currentUser.role !== 'student' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingCircular ? 'Edit Circular' : 'Add New Circular'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category || 'general'}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience *
                  </label>
                  <select
                    required
                    value={formData.targetAudience || 'all'}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="specific">Specific Departments</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt?.split('T')[0] || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCircular ? 'Update' : 'Create'} Circular
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingCircular && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{viewingCircular.title}</h3>
              <button
                onClick={() => setViewingCircular(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(viewingCircular.category)}`}>
                {categories.find(c => c.value === viewingCircular.category)?.label}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(viewingCircular.priority)}`}>
                {priorities.find(p => p.value === viewingCircular.priority)?.label}
              </span>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{viewingCircular.content}</p>
            </div>
            
            <div className="border-t pt-4 text-sm text-gray-500 space-y-2">
              <div className="flex justify-between">
                <span>Created by:</span>
                <span className="font-medium">{viewingCircular.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Created on:</span>
                <span className="font-medium">{new Date(viewingCircular.createdAt).toLocaleDateString()}</span>
              </div>
              {viewingCircular.expiresAt && (
                <div className="flex justify-between">
                  <span>Expires on:</span>
                  <span className="font-medium">{new Date(viewingCircular.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Target audience:</span>
                <span className="font-medium">
                  {viewingCircular.targetAudience === 'all' ? 'All' :
                   viewingCircular.targetAudience === 'students' ? 'Students' :
                   viewingCircular.targetAudience === 'faculty' ? 'Faculty' : 'Specific Departments'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};