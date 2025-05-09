import ClientOnly from '../../components/ClientOnly';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* Wrap browser-dependent components with ClientOnly */}
      <ClientOnly fallback={<div>Loading admin dashboard...</div>}>
        {/* Your existing admin UI components go here */}
        <AdminDashboardContent />
      </ClientOnly>
    </div>
  );
}

// Separate the browser-dependent content into its own component
function AdminDashboardContent() {
  // Use hooks and browser APIs safely here - this component 
  // will only render on the client side
  
  return (
    <div>
      {/* Your admin dashboard UI */}
      <p>Welcome to the admin dashboard</p>
      {/* ...rest of your admin UI... */}
    </div>
  );
}