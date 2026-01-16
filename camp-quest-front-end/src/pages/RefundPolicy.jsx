import React from 'react';
import {
    RefreshCcw,
    Truck,
    Clock,
    AlertCircle,
    Ban,
    CheckCircle2,
    Mail,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PolicySection = ({ icon: Icon, title, children }) => (
    <div className="bg-[#242424] p-8 rounded-xl border border-gray-800 hover:border-[#8BE13B]/50 transition-colors duration-300">
        <div className="flex items-center mb-4">
            <div className="p-3 bg-[#8BE13B]/10 rounded-lg mr-4">
                <Icon className="w-6 h-6 text-[#8BE13B]" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-300 leading-relaxed">
            {children}
        </div>
    </div>
);

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-neutral-900 pt-8 pb-20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Refund & <span className="text-[#8BE13B]">Return Policy</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Thank you for shopping at CampQuest. We value your satisfaction and aim to provide a smooth and reliable shopping experience for all your outdoor adventures.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Returns */}
                    <PolicySection icon={RefreshCcw} title="Returns">
                        <p className="mb-4">
                            Returns are accepted within <span className="text-white font-semibold">30 days</span> of purchase. To be eligible for a return, your item must be strictly unused, in the same condition that you received it, and must include all original packaging and tags.
                        </p>
                        <p>
                            Please ensure you have the receipt or proof of purchase available when initiating a return.
                        </p>
                    </PolicySection>

                    {/* Domestic Delivery & Returns */}
                    <PolicySection icon={Truck} title="Domestic Delivery & Returns">
                        <p className="mb-4">
                            CampQuest operates <span className="text-white font-semibold">exclusively within the country</span>. We do not offer international delivery or returns.
                        </p>
                        <p>
                            Returns must be handed over through our approved domestic delivery partners or dropped off at our designated locations. Return delivery costs for non-defective items are the responsibility of the customer.
                        </p>
                    </PolicySection>

                    {/* Refunds */}
                    <PolicySection icon={ShieldCheck} title="Refund Process">
                        <p className="mb-4">
                            Once your returned item is received and inspected by our team, we will send you an email to notify you of the approval or rejection of your refund.
                        </p>
                        <p>
                            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment. Delivery charges are non-refundable.
                        </p>
                    </PolicySection>

                    {/* Processing Time */}
                    <PolicySection icon={Clock} title="Processing Timeline">
                        <p className="mb-4">
                            We strive to process all returns and exchanges quickly. Please allow up to <span className="text-white font-semibold">5-7 business days</span> for us to inspect your return after it arrives at our facility.
                        </p>
                        <p>
                            Depending on your bank or credit card issuer, it may take an additional 3-5 business days for the refund to appear on your statement.
                        </p>
                    </PolicySection>

                    {/* Exchanges */}
                    <PolicySection icon={CheckCircle2} title="Exchanges">
                        <p>
                            We only replace items if they are defective or damaged. If you need to exchange an item for the same item (e.g., different size), please request an exchange within <span className="text-white font-semibold">30 days</span> of purchase. Exchanges are subject to product availability.
                        </p>
                    </PolicySection>

                    {/* Non-Returnable Items */}
                    <PolicySection icon={Ban} title="Non-Returnable Items">
                        <p className="mb-2">The following items cannot be returned or exchanged:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Gift cards</li>
                            <li>Digital products (e.g., downloadable guides)</li>
                            <li>Customized or personalized gear</li>
                            <li>Perishable goods (e.g., camping food, fuel)</li>
                            <li>Used gear that shows signs of wear</li>
                        </ul>
                    </PolicySection>

                </div>

                {/* Damaged Items Section (Full Width) */}
                <div className="mt-8 bg-[#242424] p-8 rounded-xl border border-red-500/30">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="p-4 bg-red-500/10 rounded-lg shrink-0">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Damaged or Defective Items</h3>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                We inspect all gear before it leaves our warehouse, but accidents happen. If your item arrives damaged or defective, please contact us immediately upon receipt (within 48 hours).
                            </p>
                            <p className="text-gray-300">
                                We will arrange for a free replacement or a full refund, including delivery charges, for any defective or damaged items.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Still have questions?</h2>
                    <Link to="/support" className="inline-flex items-center justify-center space-x-2 bg-[#8BE13B] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold hover:bg-[#7acc32] transition-colors cursor-pointer">
                        <Mail className="w-5 h-5" />
                        <span>Contact Customer Support</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
