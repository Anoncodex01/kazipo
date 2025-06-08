import React, { useState, useEffect } from 'react';
import { User, Trash2, Edit, UserPlus, Search, X, Image as ImageIcon } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { useAdminStore } from '../../store/adminStore';
import { User as UserType } from '../../types';

const EmployeeList: React.FC = () => {
  const { employees, isLoading, error, fetchEmployees, deleteEmployee, addEmployee, updateEmployee } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', password: '', role: 'employee', avatar: '', email: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        setAlertType('success');
        setAlertMessage('Employee deleted successfully');
      } catch (error) {
        setAlertType('error');
        setAlertMessage(error instanceof Error ? error.message : 'Failed to delete employee');
      }
    }
  };
  
  const handleOpenModal = (employee?: UserType) => {
    if (employee) {
      setForm({
        name: employee.name || '',
        password: '', // Don't prefill password
        role: employee.role,
        avatar: employee.avatar || '',
        email: employee.email || ''
      });
      setAvatarPreview(employee.avatar || null);
      setEditId(employee.id);
    } else {
      setForm({ name: '', password: '', role: 'employee', avatar: '', email: '' });
      setAvatarPreview(null);
      setEditId(null);
    }
    setFormError(null);
    setAvatarFile(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    if (!form.name || !form.password || !form.email) {
      setFormError('Name, password, and email are required.');
      setIsSubmitting(false);
      return;
    }
    let avatarUrl = '';
    if (avatarFile) {
      avatarUrl = avatarPreview || '';
    } else if (form.avatar) {
      avatarUrl = form.avatar;
    }
    try {
      if (editId) {
        await updateEmployee(editId, {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as 'admin' | 'employee',
          avatar: avatarUrl
        });
        setAlertType('success');
        setAlertMessage('Employee updated successfully');
      } else {
        await addEmployee({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role as 'admin' | 'employee',
          avatar: avatarUrl
        });
        setAlertType('success');
        setAlertMessage('Employee added successfully');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save employee');
    }
    setIsSubmitting(false);
  };
  
  // Filter employees by search term
  const filteredEmployees = searchTerm
    ? employees.filter(
        emp =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.email ? emp.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
      )
    : employees;
  
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Employees
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full sm:w-64"
          />
          <Button
            variant="primary"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => handleOpenModal()}
          >
            Add Employee
          </Button>
        </div>
      </CardHeader>
      
      {/* Modal for Add/Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={handleCloseModal}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{editId ? 'Edit Employee' : 'Add Employee'}</h3>
            {/* Profile Picture Upload at the Top */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-blue-400" />
                ) : (
                  <span className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute bottom-0 right-0 h-8 w-8 opacity-0 cursor-pointer"
                  style={{ zIndex: 2 }}
                  title="Upload profile picture"
                />
                <span className="absolute bottom-0 right-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer" style={{ zIndex: 1 }}>
                  <ImageIcon className="h-5 w-5" />
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Profile Picture</span>
            </div>
            {formError && (
              <Alert variant="error" message={formError} className="mb-4" />
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Email is required. Employees will log in with their email.</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                {editId ? 'Update' : 'Add'}
              </Button>
            </form>
          </div>
        </div>
      )}
      
      <CardBody>
        {error && (
          <Alert
            variant="error"
            message={error}
            className="mb-4"
          />
        )}
        
        {alertMessage && (
          <Alert
            variant={alertType === 'success' ? 'success' : 'error'}
            message={alertMessage}
            className="mb-4"
            onClose={() => setAlertMessage(null)}
          />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {employee.avatar ? (
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-1 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {employee.role === 'admin' ? 'Admin' : 'Employee'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit className="h-4 w-4" />}
                        className="mr-2"
                        onClick={() => handleOpenModal(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        onClick={() => handleDelete(employee.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No matching employees found' : 'No employees found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default EmployeeList;