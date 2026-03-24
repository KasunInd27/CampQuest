import React from 'react';
import {
    FileText,
    UserCheck,
    CreditCard,
    Truck,
    RotateCcw,
    Tent,
    Copyright,
    AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TermSection = ({ icon: Icon, title, children }) => (
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

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-neutral-900 pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Terms of <span className="text-[#8BE13B]">Service</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Please read these terms carefully before using our website or services. By accessing CampQuest, you agree to be bound by these conditions.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">Last Updated: October 2024</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">

                    <TermSection icon={UserCheck} title="1. Use of Website">
                        <p className="mb-4">
                            By using this website, you confirm that you are at least <span className="text-white font-semibold">[18] years of age</span> or have the consent of a parent or guardian.
                        </p>
                        <p>
                            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
                        </p>
                    </TermSection>

                    <TermSection icon={FileText} title="2. Product & Rental Information">
                        <p className="mb-4">
                            We strive to be as accurate as possible with product descriptions and images. However, we do not warrant that product descriptions or other content is 100% accurate, complete, reliable, or error-free.
                        </p>
                    </TermSection>

                    <TermSection icon={CreditCard} title="3. Orders & Payments">
                        <p className="mb-4">
                            All prices are listed in [Currency]. We reserve the right to change prices at any time without notice.
                        </p>
                        <p>
                            Payment for orders is processed via third-party secure payment gateways. CampQuest does not store your full credit card details on our servers.
                        </p>
                    </TermSection>

                    <TermSection icon={Truck} title="4. Domestic Delivery">
                        <p className="mb-4">
                            CampQuest offers delivery services only within the country. Delivery times are estimates and start from the date of dispatch.
                        </p>
                        <p>
                            Please ensure your delivery address is correct. We are not responsible for deliveries failed due to incorrect addresses provided by the user.
                            Review our full <Link to="/delivery-policy" className="text-[#8BE13B] hover:underline">Delivery Policy</Link> for details.
                        </p>
                    </TermSection>

                    <TermSection icon={RotateCcw} title="5. Returns & Refunds">
                        <p className="mb-4">
                            Our Return & Refund Policy is a part of these Terms of Service. Please review our <Link to="/refund-policy" className="text-[#8BE13B] hover:underline">Refund Policy</Link> to understand your rights regarding returns and exchanges.
                        </p>
                    </TermSection>

                    <TermSection icon={Tent} title="6. Rental Specifics">
                        <p className="mb-4">
                            If you are renting equipment, you agree to our specific <Link to="/rental-terms" className="text-[#8BE13B] hover:underline">Rental Terms</Link>, which cover eligibility, equipment care, damage liability, and late return fees.
                        </p>
                    </TermSection>

                    <TermSection icon={Copyright} title="7. Intellectual Property">
                        <p className="mb-4">
                            All content included on this site, such as text, graphics, logos, images, and software, is the property of CampQuest or its content suppliers and protected by copyright laws.
                        </p>
                    </TermSection>

                    <TermSection icon={AlertTriangle} title="8. Limitation of Liability">
                        <p className="mb-4">
                            CampQuest shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or products.
                        </p>
                    </TermSection>

                    <TermSection icon={FileText} title="9. Governing Law">
                        <p className="mb-4">
                            These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of [Country].
                        </p>
                    </TermSection>

                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-4">
                        We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website.
                    </p>
                </div>
            </div>
        </div>
    );
}
