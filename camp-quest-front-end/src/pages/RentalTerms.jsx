import React from 'react';
import {
    Calendar,
    ShieldAlert,
    CreditCard,
    CheckSquare,
    XCircle,
    HelpCircle,
    Tent
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
        <div className="text-gray-300 leading-relaxed">
            {children}
        </div>
    </div>
);

export default function RentalTerms() {
    return (
        <div className="min-h-screen bg-neutral-900 pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Rental <span className="text-[#8BE13B]">Terms</span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Plain and simple rules for renting gear with CampQuest. We want to ensure fair usage and availability for all our campers.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <TermSection icon={CheckSquare} title="Eligibility & Requirements">
                        <p className="mb-4">
                            To rent equipment, you must be at least <span className="text-white font-semibold">[18] years old</span> and have a valid CampQuest account.
                        </p>
                        <p>
                            A valid government-issued ID may be required for verification purposes upon delivery or pickup of high-value items.
                        </p>
                    </TermSection>

                    <TermSection icon={Calendar} title="Rental Period">
                        <p className="mb-4">
                            The rental period begins on the day the item is delivered or picked up and ends on the scheduled return date.
                        </p>
                        <p>
                            Extensions must be requested at least <span className="text-white font-semibold">24 hours</span> before the rental period expires and are subject to equipment availability.
                        </p>
                    </TermSection>

                    <TermSection icon={CreditCard} title="Security Deposit">
                        <p className="mb-4">
                            A refundable security deposit may be required for certain high-value items. This amount will be held on your card and released within <span className="text-white font-semibold">3-5 business days</span> after the safe return of the equipment.
                        </p>
                    </TermSection>

                    <TermSection icon={Tent} title="Equipment Care">
                        <p className="mb-4">
                            Rented gear must be used for its intended purpose only. Please keep tents away from open fires and ensure sleeping bags are kept dry.
                        </p>
                        <p>
                            Equipment should be returned in a clean and dry condition. Excessive dirt or wet gear may incur a cleaning fee.
                        </p>
                    </TermSection>

                    <TermSection icon={ShieldAlert} title="Damage & Loss">
                        <p className="mb-4">
                            You are responsible for the equipment during the rental period. Normal wear and tear is expected.
                        </p>
                        <p>
                            However, significant damage (tears, broken poles, burns) or loss of the item will be charged at the repair cost or full replacement value.
                        </p>
                    </TermSection>

                    <TermSection icon={XCircle} title="Cancellations">
                        <p className="mb-4">
                            Free cancellation is available up to <span className="text-white font-semibold">48 hours</span> before your rental start date.
                        </p>
                        <p>
                            Cancellations made within 48 hours may be subject to a cancellation fee of [Amount/Percentage].
                        </p>
                    </TermSection>

                </div>

                <div className="mt-8 bg-[#242424] p-8 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">Late Returns</h3>
                    <p className="text-gray-300">
                        Items returned late will be charged the daily rental rate for each additional day. If you know you will be late, please contact us immediately to avoid additional penalty fees.
                    </p>
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Have questions about renting?</h2>
                    <Link to="/support" className="inline-flex items-center justify-center space-x-2 bg-[#8BE13B] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold hover:bg-[#7acc32] transition-colors cursor-pointer">
                        <HelpCircle className="w-5 h-5" />
                        <span>Contact Rental Support</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
