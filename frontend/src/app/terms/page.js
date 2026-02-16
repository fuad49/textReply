import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased text-sm sm:text-base">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Header */}
                <header className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <Link href="/" className="inline-block text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors mb-4">
                            TextReply
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Terms of Service</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Updated: February 17, 2026</p>
                </header>

                <main className="space-y-12">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing and using TextReply ("the Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">2. Description of Service</h2>
                        <p className="text-gray-600 leading-relaxed">
                            TextReply provides an AI-powered auto-reply system for Facebook Pages. The Service integrates with your
                            Facebook account to read incoming messages and generate automated responses using artificial intelligence.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">3. User Responsibilities</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You are responsible for:
                        </p>
                        <ul className="space-y-3 pl-1">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">Maintaining the confidentiality of your account credentials.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">Ensuring you have the necessary rights to connect the Facebook Pages you add to the Service.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">Reviewing AI-generated responses for accuracy and appropriateness.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2">✓</span>
                                <span className="text-gray-600">Complying with Facebook's Terms of Service and Platform Policies.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">4. Prohibited Uses</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You agree not to use the Service to send spam, harass users, or distribute illegal or harmful content.
                            We reserve the right to terminate your access to the Service if you violate these terms.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">5. Disclaimer of Warranties</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Service is provided "as is" and "as available" without warranties of any kind.
                            We do not guarantee that the AI responses will always be accurate, appropriate, or error-free.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">6. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            In no event shall TextReply be liable for any indirect, incidental, special, consequential or punitive damages,
                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from
                            your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Contact Us</h2>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            If you have any questions about these Terms, please contact us.
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
