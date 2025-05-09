export const TEST_USERS = {
  regular: {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    organizationId: '1',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  admin: {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    organizationId: '1',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const TEST_ORGANIZATION = {
  id: '1',
  name: 'Test Organization',
  description: 'A test organization for development purposes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const TEST_KNOWLEDGE_BASES = [
  {
    id: '1',
    title: 'Project Documentation',
    description: 'Technical documentation and guides for the main project.',
    documentCount: 15,
    ownerId: '1',
    organizationId: '1',
  },
  {
    id: '2',
    title: 'Research Notes',
    description: 'Collection of research papers and personal notes.',
    documentCount: 8,
    ownerId: '1',
    organizationId: '1',
  },
];

export const TEST_DOCUMENTS = [
  {
    id: '1',
    title: 'Getting Started Guide',
    content: '<p>This is a comprehensive guide to get started with our platform.</p>',
    tags: ['guide', 'tutorial'],
    category: 'Documentation',
    template: null,
    knowledgeBaseId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'API Reference',
    content: '<p>Detailed documentation of our API endpoints and usage.</p>',
    tags: ['api', 'reference'],
    category: 'Reference',
    template: 'api-doc',
    knowledgeBaseId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]; 