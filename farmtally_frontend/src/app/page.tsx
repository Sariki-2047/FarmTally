import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-green-600">FarmTally</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Streamline Your
            <span className="text-green-600"> Corn Procurement</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Complete management system for corn procurement operations. Track deliveries, 
            manage farmers, process payments, and generate reports - all in one platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Farm Admin</CardTitle>
              <CardDescription>
                Manage your entire operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Lorry fleet management</li>
                <li>• Delivery processing</li>
                <li>• Financial settlements</li>
                <li>• Comprehensive reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Field Manager</CardTitle>
              <CardDescription>
                Streamline field operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Request lorries</li>
                <li>• Record deliveries</li>
                <li>• Manage farmers</li>
                <li>• Track advance payments</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Farmer</CardTitle>
              <CardDescription>
                Track your deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Multi-organization support</li>
                <li>• Delivery history</li>
                <li>• Payment tracking</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">App Admin</CardTitle>
              <CardDescription>
                System administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• User management</li>
                <li>• System monitoring</li>
                <li>• Organization oversight</li>
                <li>• Global analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Test Links */}
        <div className="mt-16 bg-white rounded-2xl px-6 py-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Test the Application
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/test-api">
              <Button variant="outline" className="w-full">
                🧪 Test API
              </Button>
            </Link>
            <Link href="/debug">
              <Button variant="outline" className="w-full">
                🔧 Debug Page
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                🔐 Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">
                📝 Register
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-green-600 rounded-2xl px-6 py-16 text-center">
          <h3 className="text-3xl font-bold text-white">
            Ready to transform your corn procurement?
          </h3>
          <p className="mt-4 text-lg text-green-100">
            Join hundreds of organizations already using FarmTally
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold">FarmTally</h3>
            <p className="mt-2 text-gray-400">
              Comprehensive corn procurement management system
            </p>
            <div className="mt-8 text-sm text-gray-400">
              © 2024 FarmTally. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}