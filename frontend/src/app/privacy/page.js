
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="border-b border-neutral-800 pb-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        TextReply
                    </Link>
                    <h1 className="text-4xl font-bold mt-4 text-white">Privacy Policy</h1>
                    <p className="text-neutral-400 mt-2">Last updated: February 17, 2026</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Welcome to TextReply. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and use our services.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Data We Collect</h2>
                    <p className="leading-relaxed">
                        When you use TextReply, we may collect the following types of information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                        <li><strong className="text-white">Account Information:</strong> Your name, email address, and profile picture from Facebook when you log in.</li>
                        <li><strong className="text-white">Facebook Page Data:</strong> Information about the Facebook Pages you manage (name, ID, access tokens) to enable our services.</li>
                        <li><strong className="text-white">Messages:</strong> Content of messages sent to your connected Facebook Pages to provide AI-generated replies.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. How We Use Your Data</h2>
                    <p className="leading-relaxed">
                        We use your data solely to provide functionality for TextReply:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                        <li>To authenticate you and manage your account.</li>
                        <li>To connect to your Facebook Pages and read incoming messages via webhooks.</li>
                        <li>To generate AI responses using Google Gemini API based on the context of your conversations.</li>
                        <li>To send automated replies back to your Facebook Page users on your behalf.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">4. Data Sharing</h2>
                    <p className="leading-relaxed">
                        We do not sell your personal data. We only share data with third-party service providers essential for our operation:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-neutral-300">
                        <li><strong className="text-white">Google Gemini:</strong> Message content is sent to Google's AI service to generate responses.</li>
                        <li><strong className="text-white">Facebook/Meta:</strong> To interact with the Graph API for messaging functionality.</li>
                        <li><strong className="text-white">Database Provider:</strong> To securely store your account and conversation history (encrypted at rest).</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">5. Data Retention</h2>
                    <p className="leading-relaxed">
                        We retain your personal data only for as long as necessary to fulfill the purposes we collected it for,
                        including for the purposes of satisfying any legal, accounting, or reporting requirements.
                        You may request deletion of your data at any time by contacting us.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">6. Contact Us</h2>
                    <p className="leading-relaxed">
                        If you have any questions about this privacy policy or our privacy practices, please contact us at:
                    </p>
                    <p className="text-blue-400">support@textreply.app</p>
                </section>

                <footer className="pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
                    &copy; {new Date().getFullYear()} TextReply. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
