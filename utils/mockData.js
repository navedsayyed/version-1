export const mockComplaints = [
  {
    id: 1,
    title: 'Broken Water Pipe',
    description: 'Water pipe burst in the basement causing flooding in the maintenance area',
    location: 'Building A - Floor B1',
    place: 'Maintenance Room 101',
    date: '2024-01-15',
    status: 'in-progress',
    userId: 'john.doe@company.com',
    technicianId: 'tech.smith@company.com',
    image: 'https://via.placeholder.com/300x200/1E1E1E/00BCD4?text=Broken+Pipe',
    completedImage: null,
    completedDescription: null,
    submittedAt: '2024-01-15T09:30:00Z',
    assignedAt: '2024-01-15T10:00:00Z',
    completedAt: null
  },
  {
    id: 2,
    title: 'AC Not Working',
    description: 'Air conditioning unit not cooling properly, temperature too high',
    location: 'Building B - Floor 3',
    place: 'Office 301',
    date: '2024-01-14',
    status: 'completed',
    userId: 'jane.wilson@company.com',
    technicianId: 'tech.smith@company.com',
    image: 'https://via.placeholder.com/300x200/1E1E1E/00BCD4?text=AC+Unit',
    completedImage: 'https://via.placeholder.com/300x200/1E1E1E/4CAF50?text=Fixed+AC',
    completedDescription: 'Replaced AC filters and recharged refrigerant. System is now working optimally.',
    submittedAt: '2024-01-14T14:20:00Z',
    assignedAt: '2024-01-14T14:45:00Z',
    completedAt: '2024-01-14T16:30:00Z'
  },
  {
    id: 3,
    title: 'Elevator Malfunction',
    description: 'Elevator making strange noises and stopping between floors',
    location: 'Building C - Main Lobby',
    place: 'Elevator Bank 1',
    date: '2024-01-13',
    status: 'in-progress',
    userId: 'mike.johnson@company.com',
    technicianId: 'tech.davis@company.com',
    image: 'https://via.placeholder.com/300x200/1E1E1E/00BCD4?text=Elevator',
    completedImage: null,
    completedDescription: null,
    submittedAt: '2024-01-13T11:15:00Z',
    assignedAt: '2024-01-13T11:30:00Z',
    completedAt: null
  },
  {
    id: 4,
    title: 'Lighting Issue',
    description: 'Several fluorescent lights flickering in the conference room',
    location: 'Building A - Floor 2',
    place: 'Conference Room 201',
    date: '2024-01-12',
    status: 'completed',
    userId: 'sarah.brown@company.com',
    technicianId: 'tech.wilson@company.com',
    image: 'https://via.placeholder.com/300x200/1E1E1E/00BCD4?text=Flickering+Lights',
    completedImage: 'https://via.placeholder.com/300x200/1E1E1E/4CAF50?text=Fixed+Lights',
    completedDescription: 'Replaced faulty ballasts and fluorescent tubes. All lights working properly.',
    submittedAt: '2024-01-12T08:45:00Z',
    assignedAt: '2024-01-12T09:00:00Z',
    completedAt: '2024-01-12T11:20:00Z'
  }
];

export const mockUsers = {
  'john.doe@company.com': { name: 'John Doe', department: 'IT' },
  'jane.wilson@company.com': { name: 'Jane Wilson', department: 'HR' },
  'mike.johnson@company.com': { name: 'Mike Johnson', department: 'Finance' },
  'sarah.brown@company.com': { name: 'Sarah Brown', department: 'Marketing' }
};

export const mockTechnicians = {
  'tech.smith@company.com': { name: 'Alex Smith', specialization: 'Plumbing & HVAC' },
  'tech.davis@company.com': { name: 'Jordan Davis', specialization: 'Electrical & Mechanical' },
  'tech.wilson@company.com': { name: 'Casey Wilson', specialization: 'General Maintenance' }
};