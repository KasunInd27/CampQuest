import React from 'react';
import {
    Shield,
    Lock,
    Eye,
    Cookie,
    Share2,
    Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacySection = ({ icon: Icon, title, children }) => (
    <div className="bg-[#242424] p-8 rounded-xl border border-gray-800 hover:border-[#8BE13B]/50 transition-colors duration-300">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-[#8BE13B]/10 rounded-lg mr-4">
                <Icon className="w-6 h-6 text-[#8BE13B]" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-300 leading-relaxed text-sm lg:text-base">
            {children}
        </div>
    </div>
);

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-900 pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Privacy <span className="text-[#8BE13B]">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        We value your trust and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">Last Updated: October 2024</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">

                    <PrivacySection icon={Eye} title="Information We Collect">
                        <p className="mb-4">
                            We collect information necessary to provide our rental and sales services. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Contact details (Name, Email, Phone Number)</li>
                            <li>Delivery information (Address, Landmarks) for domestic delivery</li>
                            <li>Account credentials (securely hashed)</li>
                            <li>Rental history and preferences</li>
                        </ul>
                        <p className="mt-2">
                            We do NOT store complete credit card details. All payment processing is handled by secure third-party payment gateways.
                        </p>
                    </PrivacySection>

                    <PrivacySection icon={Shield} title="How We Use Your Data">
                        <p className="mb-2">Your information is used solely for:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Processing your equipment rentals and purchases.</li>
                            <li>Coordinating domestic delivery with our logistics partners.</li>
                            <li>Verifying identity for high-value rental items.</li>
                            <li>Communicating order status and support updates.</li>
                            <li>Improving our website and service offerings.</li>
                        </ul>
                    </PrivacySection>

                    <PrivacySection icon={Share2} title="Information Sharing">
                        <p>
                            We do not sell your personal data. We only share necessary information with trusted third parties to fulfill our services, such as:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                            <li>Domestic delivery partners (to get your gear to you).</li>
                            <li>Payment processors (to securely handle transactions).</li>
                            <li>Legal authorities (only if required by law).</li>
                        </ul>
                    </PrivacySection>

                    <PrivacySection icon={Lock} title="Data Security">
                        <p>
                            We implement industry-standard security measures to protect your data against unauthorized access, alteration, or disclosure. Our website uses SSL encryption for all data transmission.
                        </p>
                    </PrivacySection>

                    <PrivacySection icon={Cookie} title="Cookies & Tracking">
                        <p>
                            We use cookies to enhance your browsing experience, remember your cart items, and analyze website traffic. You can control cookie preferences through your browser settings.
                        </p>
                    </PrivacySection>

                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Questions about privacy?</h2>
                    <Link to="/support" className="inline-flex items-center justify-center space-x-2 bg-[#8BE13B] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold hover:bg-[#7acc32] transition-colors cursor-pointer">
                        <Mail className="w-5 h-5" />
                        <span>Contact Data Protection Officer</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
