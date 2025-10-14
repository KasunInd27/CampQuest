// pages/AboutUs.jsx
import React from 'react';

// Hero Section
function AboutHero() {
  return (
    <section className="relative bg-neutral-900 py-20 sm:py-28">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Mountain landscape"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-lime-400 text-gray-900 text-sm font-bold mb-6">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Passionate About <span className="text-lime-400">Outdoor Adventures</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            For over a decade, we've been helping outdoor enthusiasts gear up for their next adventure. 
            From weekend camping trips to month-long expeditions, we provide the quality equipment you need.
          </p>
        </div>
      </div>
    </section>
  );
}

// Company Story Section
function CompanyStory() {
  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              How It All Started
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Founded in 2013 by avid outdoor enthusiasts Sarah and Mike Johnson, our company began 
                with a simple mission: make quality camping equipment accessible to everyone. What started 
                as a small rental service in their garage has grown into a trusted provider of both rental 
                and retail camping gear.
              </p>
              <p>
                We understand that not everyone wants to invest in expensive equipment for occasional trips. 
                That's why we pioneered the camping equipment rental model in our region, offering everything 
                from basic tents to high-end mountaineering gear.
              </p>
              <p>
                Today, we serve thousands of customers annually, from first-time campers to seasoned 
                adventurers, helping them create unforgettable outdoor memories with reliable, 
                well-maintained equipment.
              </p>
            </div>
          </div>
          
          {/* Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1508872793789-4b8c498fb1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Founders camping"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-lime-400 p-6 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10+</div>
                <div className="text-sm text-gray-700 font-medium">Years Serving</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Mission, Vision, Values Section
function MissionVisionValues() {
  const values = [
    {
      title: "Quality First",
      description: "We maintain and inspect all equipment to ensure it meets the highest standards for safety and performance.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Accessibility",
      description: "Making outdoor adventures accessible to everyone, regardless of budget or experience level.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    {
      title: "Sustainability",
      description: "Promoting sustainable outdoor practices and extending equipment life through our rental model.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    },
    {
      title: "Expert Support",
      description: "Our knowledgeable team provides guidance to help you choose the right gear for your adventure.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-gray-300 text-lg">
              To democratize outdoor adventures by providing affordable access to premium camping equipment, 
              enabling everyone to explore nature safely and comfortably.
            </p>
          </div>
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-gray-300 text-lg">
              To be the leading provider of outdoor equipment solutions, inspiring a generation of 
              environmentally conscious adventurers to connect with nature.
            </p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-3xl font-bold text-white text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-400 text-gray-900 rounded-full mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{value.title}</h4>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Statistics Section
function Statistics() {
  const stats = [
    { number: '15,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Equipment Items' },
    { number: '50+', label: 'Camping Locations Supported' },
    { number: '98%', label: 'Customer Satisfaction' }
  ];

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Numbers That <span className="text-lime-400">Matter</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Over the years, we've built strong relationships with our customers and maintained 
            high standards that speak for themselves.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-lime-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Co-Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
      bio: 'Passionate mountaineer with 15+ years of outdoor experience. Sarah leads our company vision and customer experience.',
    },
    {
      name: 'Mike Johnson',
      role: 'Co-Founder & Operations Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      bio: 'Expert in outdoor gear and equipment maintenance. Mike ensures every piece of equipment meets our quality standards.',
    },
    {
      name: 'Emily Chen',
      role: 'Customer Experience Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      bio: 'Dedicated to ensuring every customer has an amazing experience. Emily leads our support team and rental process.',
    },
    {
      name: 'David Rodriguez',
      role: 'Equipment Specialist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
      bio: 'Outdoor enthusiast and gear expert. David helps customers choose the perfect equipment for their adventures.',
    }
  ];

  return (
    <section className="py-16 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Meet Our <span className="text-lime-400">Team</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Our passionate team of outdoor enthusiasts is here to help you make the most of your adventures.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 rounded-full mx-auto object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-lime-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
              <p className="text-lime-400 font-medium mb-3">{member.role}</p>
              <p className="text-gray-300 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Sustainability Section
function SustainabilitySection() {
  const sustainabilityPoints = [
    {
      title: 'Equipment Sharing',
      description: 'Our rental model reduces the need for individual purchases, minimizing manufacturing demand.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
        </svg>
      )
    },
    {
      title: 'Repair & Refurbish',
      description: 'We extend equipment life through professional maintenance and repair services.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      )
    },
    {
      title: 'Eco-Friendly Partners',
      description: 'We partner with brands committed to sustainable manufacturing and ethical practices.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Committed to <span className="text-lime-400">Sustainability</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              We believe in protecting the environments we love to explore. Our business model 
              inherently supports sustainability by maximizing equipment utilization and reducing waste.
            </p>
            
            <div className="space-y-6">
              {sustainabilityPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-lime-400 rounded-lg flex items-center justify-center text-gray-900">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{point.title}</h3>
                    <p className="text-gray-300">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
              alt="Beautiful nature landscape"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Call to Action Section
function AboutCallToAction() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Start Your Adventure?
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join thousands of satisfied customers who trust us with their outdoor adventures. 
          Let us help you gear up for your next expedition.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-lime-400 text-gray-900 font-semibold rounded-lg hover:bg-lime-500 transition-colors">
            Browse Equipment
          </button>
          <button className="px-8 py-3 border-2 border-lime-400 text-lime-400 font-semibold rounded-lg hover:bg-lime-400 hover:text-gray-900 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}

// Main About Us Component
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-neutral-900">
      <AboutHero />
      <CompanyStory />
      <MissionVisionValues />
      <Statistics />
      <TeamSection />
      <SustainabilitySection />
      <AboutCallToAction />
    </div>
  );
}