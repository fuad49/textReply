
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased text-sm sm:text-base">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <header className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <Link href="/" className="inline-block text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors mb-4">
                            TextReply
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Privacy Policy</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Updated: February 17, 2026</p>
                </header>

                <main className="space-y-12">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to TextReply. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and use our services.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">2. Data We Collect</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            When you use TextReply, we may collect the following types of information:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full mr-3"></span>
                                <span className="text-gray-600"><strong className="text-gray-900 font-semibold">Account Information:</strong> Your name, email address, and profile picture from Facebook when you log in.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full mr-3"></span>
                                <span className="text-gray-600"><strong className="text-gray-900 font-semibold">Facebook Page Data:</strong> Information about the Facebook Pages you manage (name, ID, access tokens) to enable our services.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-500 rounded-full mr-3"></span>
                                <span className="text-gray-600"><strong className="text-gray-900 font-semibold">Messages:</strong> Content of messages sent to your connected Facebook Pages to provide AI-generated replies.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">3. How We Use Your Data</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We use your data solely to provide functionality for TextReply:
                        </p>
                        <ul className="space-y-3 pl-1">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">To authenticate you and manage your account.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">To connect to your Facebook Pages and read incoming messages via webhooks.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">To generate AI responses using Google Gemini API based on the context of your conversations.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">To send automated replies back to your Facebook Page users on your behalf.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">4. Data Sharing</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We do not sell your personal data. We only share data with third-party service providers essential for our operation:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Google Gemini</h3>
                                <p className="text-gray-500 text-sm">Message content is sent to generate AI responses.</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Meta / Facebook</h3>
                                <p className="text-gray-500 text-sm">To interact with the Graph API for messaging functionality.</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Database Provider</h3>
                                <p className="text-gray-500 text-sm">To securely store your account and conversation history.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">5. Data Retention</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We retain your personal data only for as long as necessary to fulfill the purposes we collected it for,
                            including for the purposes of satisfying any legal, accounting, or reporting requirements.
                            You may request deletion of your data at any time by contacting us.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Have Questions?</h2>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            If you have any questions about this privacy policy or our privacy practices, please contact us.
                        </p>
                        <a href="mailto:support@textreply.app" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                            support@textreply.app
                        </a>
                    </section>
                </main>

                <footer className="mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
                    <p>&copy; {new Date().getFullYear()} TextReply. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
