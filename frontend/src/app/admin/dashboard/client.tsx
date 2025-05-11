"use client";

import { useEffect, useState } from "react";

interface ChartData {
  month: string;
  users: number;
  documents: number;
}

const mockChartData: ChartData[] = [
  { month: "Jan", users: 35, documents: 120 },
  { month: "Feb", users: 45, documents: 150 },
  { month: "Mar", users: 55, documents: 180 },
  { month: "Apr", users: 65, documents: 220 },
  { month: "May", users: 90, documents: 270 },
  { month: "Jun", users: 110, documents: 350 },
];

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");

  // Ensure this component only runs on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing on the server side
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Graph */}
      <div className="card border border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Activity Overview</h2>
          <p className="text-sm text-gray-500">User growth and document uploads</p>
        </div>
        
        <div className="h-64 relative">
          {/* Simple chart visualization - in a real app, you'd use a charting library */}
          <div className="absolute inset-0 flex items-end justify-between px-4">
            {mockChartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative h-48 w-14 flex items-end mb-2">
                  {/* Users bar */}
                  <div 
                    className="absolute bottom-0 w-4 bg-primary rounded-t-sm transition-all duration-300 ease-in-out"
                    style={{ height: `${(data.users / 120) * 100}%`, left: 0 }}
                  />
                  {/* Documents bar */}
                  <div 
                    className="absolute bottom-0 w-4 bg-secondary rounded-t-sm transition-all duration-300 ease-in-out"
                    style={{ height: `${(data.documents / 400) * 100}%`, right: 0 }}
                  />
                </div>
                <div className="text-xs font-medium text-gray-600">{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded-sm mr-1"></div>
            <span className="text-gray-600">Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-secondary rounded-sm mr-1"></div>
            <span className="text-gray-600">Documents</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          <div className="flex border-b border-gray-200 mt-2">
            <button 
              className={`pb-2 px-4 text-sm font-medium ${activeTab === 'recent' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent
            </button>
            <button 
              className={`pb-2 px-4 text-sm font-medium ${activeTab === 'popular' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
          </div>
        </div>
        
        {activeTab === 'recent' ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500">
                  {item % 2 === 0 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {item % 2 === 0 ? 'Document uploaded' : 'User registered'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item % 2 === 0 ? `Project brief ${item}.pdf` : `John Smith ${item}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item} hour{item !== 1 ? 's' : ''} ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[4, 3, 2, 1].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    Popular Knowledge Base
                  </div>
                  <div className="text-xs text-gray-500">
                    Technical Documentation {item}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {item * 125} views this week
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO List */}
      <div className="card border border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <p className="text-sm text-gray-500">Your current tasks</p>
        </div>
        
        <div className="space-y-3">
          {[
            { task: "Review new documents", status: "In Progress", priority: "High" },
            { task: "Approve user requests", status: "Pending", priority: "Medium" },
            { task: "Update organization settings", status: "Not Started", priority: "Low" },
            { task: "Analyze usage statistics", status: "In Progress", priority: "Medium" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full mr-3 ${
                  item.status === "In Progress" ? "bg-blue-400" :
                  item.status === "Pending" ? "bg-yellow-400" : "bg-gray-400"
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-800">{item.task}</div>
                  <div className="text-xs text-gray-500">{item.status}</div>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                item.priority === "High" ? "bg-red-100 text-red-800" :
                item.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
              }`}>
                {item.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="card border border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
          <p className="text-sm text-gray-500">Current system performance</p>
        </div>
        
        <div className="space-y-4">
          {[
            { name: "API Response Time", value: 42, unit: "ms", status: "good" },
            { name: "Database Load", value: 22, unit: "%", status: "good" },
            { name: "Storage Usage", value: 68, unit: "%", status: "warning" },
            { name: "Memory Usage", value: 49, unit: "%", status: "good" },
          ].map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{item.name}</div>
                <div className="text-sm font-medium text-gray-900">{item.value}{item.unit}</div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    item.status === "good" ? "bg-green-500" :
                    item.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="text-sm text-primary font-medium hover:underline focus:outline-none">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}