import React from 'react';
import {
    Truck,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle2,
    Phone
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

export default function DeliveryPolicy() {
    return (
        <div className="min-h-screen bg-neutral-900 pt-8 pb-20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Delivery <span className="text-[#8BE13B]">Policy</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Fast, reliable, and secure domestic delivery across the country. We ensure your gear reaches you on time for your next adventure.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Delivery Areas */}
                    <PolicySection icon={MapPin} title="Delivery Areas">
                        <p className="mb-4">
                            CampQuest provides delivery services <span className="text-white font-semibold">exclusively within the country</span>. We cover all major cities and most remote locations.
                        </p>
                        <p>
                            Please note that delivery to certain remote camping sites may require additional coordination or pickup from the nearest town center.
                        </p>
                    </PolicySection>

                    {/* Delivery Time Estimates */}
                    <PolicySection icon={Clock} title="Delivery Timelines">
                        <p className="mb-4">
                            Our standard domestic delivery usually takes <span className="text-white font-semibold">2-4 business days</span>.
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mb-2">
                            <li>Metro Areas: 1-2 business days</li>
                            <li>Regional Areas: 3-4 business days</li>
                            <li>Remote Locations: 5+ business days</li>
                        </ul>
                        <p className="text-sm text-gray-400 mt-2">
                            *Timelines may be affected by public holidays, extreme weather, or unforeseen logistical delays.
                        </p>
                    </PolicySection>

                    {/* Fees */}
                    <PolicySection icon={Truck} title="Delivery Fees">
                        <p className="mb-4">
                            Delivery fees are calculated based on the weight of your order and the delivery location. The exact fee will be displayed at checkout before you confirm payment.
                        </p>
                        <p>
                            We offer <span className="text-white font-semibold">Free Delivery</span> for orders over [Currency] [Amount].
                        </p>
                    </PolicySection>

                    {/* Confirmation */}
                    <PolicySection icon={CheckCircle2} title="Delivery Confirmation">
                        <p className="mb-4">
                            For security, orders may require an OTP verification or signature upon delivery.
                        </p>
                        <p>
                            If you are renting equipment, a valid ID may be requested by the delivery personnel to verify the renter's identity.
                        </p>
                    </PolicySection>

                    {/* Address Requirements */}
                    <PolicySection icon={AlertCircle} title="Address & Contact Info">
                        <p className="mb-4">
                            Please ensure your delivery address is accurate and includes all necessary details (House No, Street, Landmarks).
                        </p>
                        <p>
                            A valid <span className="text-white font-semibold">phone number is mandatory</span> for all orders. Our delivery partners will contact you to coordinate the drop-off.
                        </p>
                    </PolicySection>

                    {/* Failed Deliveries */}
                    <PolicySection icon={AlertCircle} title="Missed Deliveries">
                        <p className="mb-4">
                            If you are unavailable at the time of delivery, our partner will attempt to contact you. After 2 failed attempts, the package will be returned to our warehouse.
                        </p>
                        <p>
                            Re-delivery attempts may incur an additional delivery fee.
                        </p>
                    </PolicySection>

                </div>

                {/* Contact Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Need help with your delivery?</h2>
                    <Link to="/support" className="inline-flex items-center justify-center space-x-2 bg-[#8BE13B] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold hover:bg-[#7acc32] transition-colors cursor-pointer">
                        <Phone className="w-5 h-5" />
                        <span>Contact Customer Support</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
