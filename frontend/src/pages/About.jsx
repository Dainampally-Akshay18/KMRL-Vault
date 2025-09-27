// About.jsx - Dark UI Theme with Mobile Responsive Design
import React, { useState, useEffect } from 'react';
import logoImage from '../assets/logo.png';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTeamMember, setActiveTeamMember] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Document Vault',
      description: 'Securely capture, store, and organize all metro documents for instant access and traceability.'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M4 7V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V7" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 17V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V17" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 12H20" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Risk Analysis',
      description: 'AI-powered summarization highlights key actions and identifies regulatory or operational risks.'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M12 15L8 11L16 11L12 15Z" fill="currentColor"/>
          <path d="M2 12C2 6.48 6.48 2 12 2S22 6.48 22 12 17.52 22 12 22 2 17.52 2 12Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Secure Profiles',
      description: 'Personalized, role-based access ensures stakeholders see only relevant documents and insights.'
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
        </svg>
      ),
      title: 'Interactive Chat',
      description: 'Instantly search, explore, and interact with documents through an AI chatbot and negotiation simulator.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Content',
      description: 'Upload your document or paste text directly into our intelligent interface',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
          <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '02',
      title: 'AI Processing',
      description: 'Our advanced AI processes and chunks your content for optimal analysis and understanding',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 7L12 12L20 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 12L12 17L20 12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '03',
      title: 'Secure Storage',
      description: 'Documents are securely stored with session-based isolation ensuring complete privacy',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      number: '04',
      title: 'Interactive Chat',
      description: 'Start chatting with your documents using our intelligent AI interface for instant insights',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.60573 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Akshay Kireet',
      role: 'Frontend Developer',
      specialty: 'Langchain Developer',
      bio: 'Akshay Kireet is frontend developer with a passion for building intuitive user interfaces. He specializes in ReactJS and Langchain to create seamless user experiences.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758957156/Akshay_doppdz.png',
      skills: ['ReactJS', 'Langchain', 'FastAPI', 'Pandas'],
      social: {
        linkedin: 'https://linkedin.com/in/alex-rodriguez',
        github: 'https://github.com/alex-rodriguez',
        twitter: 'https://twitter.com/alex_ai'
      }
    },
    {
      id: 2,
      name: 'M Saiteja',
      role: 'ML Developer',
      specialty: 'Machine Learning & AI',
      bio: 'M Saiteja is a skilled machine learning developer specializing in ML. He has a strong background in data science and a passion for creating intelligent systems.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758957156/saiteja_ru71o6.png',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
      social: {
        linkedin: 'https://linkedin.com/in/sarah-chen',
        github: 'https://github.com/sarah-chen',
        twitter: 'https://twitter.com/sarah_codes'
      }
    },
    {
      id: 3,
      name: 'Shek Shahid',
      role: 'Backend Developer',
      specialty: 'FastAPI',
      bio: 'Shahid ensures our platform runs smoothly with enterprise-grade security. He manages our cloud infrastructure and CI/CD pipelines.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758957157/shahid_n6sfgk.png',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      social: {
        linkedin: 'https://linkedin.com/in/marcus-johnson',
        github: 'https://github.com/marcus-devops',
        twitter: 'https://twitter.com/marcus_cloud'
      }
    },
    {
      id: 4,
      name: 'Varshith Reddy',
      role: 'Langchain Developer',
      specialty: 'Langchain & AI Integration',
      bio: 'Varshith is a langchain developer with a knack for integrating AI into user-friendly applications. He focuses on creating seamless user experiences.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758957156/varshith_bl3xkq.png',
      skills: ['Langchain', 'JavaScript', 'Pandas', 'NumPy'],
      social: {
        linkedin: 'https://linkedin.com/in/emma-watson-design',
        github: 'https://github.com/emma-designs',
        twitter: 'https://twitter.com/emma_ux'
      }
    },
    {
      id: 5,
      name: 'Ashvith Narla',
      role: 'Deployment Engineer',
      specialty: 'Cloud Infrastructure',
      bio: 'Ashvith is a deployment engineer who specializes in cloud infrastructure. He ensures our platform is scalable and reliable.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758957156/ashvith_m6b2gd.png',
      skills: ['AWS', 'CI/CD', 'Docker', 'Linux'],
      social: {
        linkedin: 'https://linkedin.com/in/david-kim-pm',
        github: 'https://github.com/david-pm',
        twitter: 'https://twitter.com/david_product'
      }
    },
    {
      id: 6,
      name: 'Anwesha Pradhan',
      role: 'UI/UX Designer',
      specialty: 'Visual Design Skills',
      bio: 'Anwesha designs our platform\'s UI/UX with a focus on clarity and speed. She builds interfaces that turn complex documents into simple, actionable views.',
      image: 'https://res.cloudinary.com/dcvcxntyo/image/upload/v1758956684/Anwesha_ye5kks.png',
      skills: ['Wireframing', 'Prototyping', 'Visual Design', 'NumPy'],
      social: {
        linkedin: 'https://linkedin.com/in/emma-watson-design',
        github: 'https://github.com/emma-designs',
        twitter: 'https://twitter.com/emma_ux'
      }
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Dark UI Theme Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* About page themed animated orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#20B2AA]/20 to-[#81D8D0]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-10 right-20 w-32 h-32 border border-[#20B2AA]/20 rounded-3xl rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-[#81D8D0]/20 rounded-full animate-pulse"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Hero Section */}
        <section className="relative z-10 pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-slate-800/60 backdrop-blur-xl border border-slate-600/50 rounded-full mb-6 sm:mb-8">
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-[#20B2AA]">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-[#20B2AA] font-semibold text-sm sm:text-base">Revolutionizing Kochi Metro</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight text-white px-2">
              Revolutionizing document interaction through{' '}
              <span className="bg-gradient-to-r from-[#20B2AA] via-[#81D8D0] to-cyan-400 bg-clip-text text-transparent">
                Cutting-edge Artificial Intelligence
              </span>{' '}
              and Natural Language Processing Technology
            </h1>

            <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'justify-center gap-8'} text-center`}>
              {[
                { number: '10K+', label: 'Documents Analyzed' },
                { number: '99.9%', label: 'Accuracy Rate' },
                { number: '50+', label: 'Languages Supported' }
              ].map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-600/50 rounded-3xl p-6 sm:p-8 lg:p-12">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'lg:grid-cols-2 gap-12'} items-center`}>
                <div className="space-y-6">
                  <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                    <strong className="text-white">KMRL-Vault</strong> is a{' '}
                    <strong className="bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent">
                      smart document management platform
                    </strong>{' '}
                    built for Kochi Metro Rail Limited's large and bilingual document system. It lets teams upload, organize, and analyze engineering, regulatory, and operational files in English, Malayalam, or both.
                  </p>
                  <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                    Our platform uses advanced natural language processing to automatically summarize documents, highlight key risks, and surface the most important information for each user role.
                  </p>
                  <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                    Built with enterprise-grade security and powered by state-of-the-art machine learning models,
                    KMRL-Vault transforms how teams access and act on information, making insights{' '}
                    <strong className="text-[#20B2AA]">instant, accurate, and intuitive</strong>.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#20B2AA]/30">
                      <img src={logoImage} alt="KMRL-Vault Logo" className="w-45 h-45 sm:w-30 sm:h-30" />
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#20B2AA]/30 to-[#81D8D0]/30 rounded-3xl blur-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block px-4 py-2 bg-[#20B2AA]/20 border border-[#20B2AA]/50 rounded-full mb-6">
                <span className="text-[#20B2AA] font-semibold uppercase tracking-wide text-sm">Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Discover the advanced capabilities
              </h2>
              <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
                that make KMRL-Vault the perfect solution for intelligent document processing
              </p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`group bg-slate-800/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#20B2AA]/20 ${
                    activeFeature === index ? 'border-[#20B2AA]/50 bg-[#20B2AA]/10' : ''
                  }`}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#20B2AA] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block px-4 py-2 bg-orange-500/20 border border-orange-400/50 rounded-full mb-6">
                <span className="text-orange-400 font-semibold uppercase tracking-wide text-sm">Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Get started in four simple steps
              </h2>
              <p className="text-lg sm:text-xl text-slate-400">
                and experience the future of document intelligence
              </p>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-8'}`}>
                    {/* Step Number */}
                    <div className={`flex-shrink-0 ${isMobile ? 'self-start' : ''}`}>
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent mb-4">
                        {step.number}
                      </div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/60 border border-[#20B2AA]/50 rounded-xl flex items-center justify-center backdrop-blur-xl">
                        <div className="text-[#20B2AA]">
                          {step.icon}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && !isMobile && (
                    <div className="absolute left-8 top-20 w-0.5 h-12 bg-gradient-to-b from-[#20B2AA]/50 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

{/* Team Section - Enhanced with Animations */}
<section className="relative z-10 py-20 px-4">
  <div className="max-w-6xl mx-auto">
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 lg:p-12">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-2 bg-[#20B2AA]/10 border border-[#20B2AA]/30 rounded-full mb-6">
          <span className="text-[#20B2AA] font-semibold uppercase tracking-wide text-sm">Team</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Meet Our Expert Team
        </h2>
        <p className="text-xl text-slate-400">
          Our diverse team of experts combines years of experience in AI, development, design, and product strategy
        </p>
      </div>

      {/* Enhanced Team Grid with Smooth Animations */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
        {teamMembers.map((member, index) => (
          <div 
            key={member.id}
            className="group relative bg-slate-900/60 border border-slate-600/50 rounded-2xl p-6 transition-all duration-500 hover:border-[#20B2AA]/70 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden hover:shadow-2xl hover:shadow-[#20B2AA]/20"
          >
            {/* Subtle Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#20B2AA]/0 via-[#20B2AA]/5 to-[#81D8D0]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* Floating Particles - Subtle */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700">
              <div className="absolute top-4 right-4 w-1 h-1 bg-[#20B2AA] rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute bottom-8 left-6 w-1 h-1 bg-[#81D8D0] rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-8 w-1 h-1 bg-[#20B2AA] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Member Image with Gentle Animation */}
            <div className="relative mb-6 group-hover:transform group-hover:scale-110 transition-transform duration-500">
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-4 border-[#20B2AA]/50 group-hover:border-[#20B2AA] transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#20B2AA]/30">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Subtle Rotating Ring */}
              <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-transparent group-hover:border-[#20B2AA]/20 rounded-2xl transition-all duration-700 group-hover:rotate-180"></div>
            </div>

            {/* Member Info with Smooth Transitions */}
            <div className="text-center relative z-10">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#20B2AA] transition-all duration-300 group-hover:transform group-hover:scale-105">
                {member.name}
              </h3>
              <p className="text-[#20B2AA] font-semibold mb-1 group-hover:animate-pulse">
                {member.role}
              </p>
              <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-200 transition-colors duration-300">
                {member.specialty}
              </p>

              {/* Skills with Staggered Hover Effect */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {member.skills.slice(0, 3).map((skill, skillIndex) => (
                  <span 
                    key={skillIndex}
                    className="px-3 py-1 bg-[#20B2AA]/30 border border-[#20B2AA]/50 text-[#20B2AA] text-xs font-medium rounded-full group-hover:bg-[#20B2AA]/50 group-hover:text-white group-hover:scale-105 transition-all duration-300"
                    style={{ 
                      transitionDelay: `${skillIndex * 100}ms`
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white text-xs font-semibold rounded-full group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    +{member.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Bio with Gentle Animation */}
              <p className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-100 transition-all duration-300 group-hover:transform group-hover:translate-y-1">
                {member.bio}
              </p>
            </div>

            {/* Corner Accent - Subtle */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-bl from-[#20B2AA]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


        {/* Security Section */}
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-2xl border border-slate-600/50 rounded-3xl p-6 sm:p-8 lg:p-12">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'lg:grid-cols-2 gap-12'} items-center`}>
                <div className={`flex ${isMobile ? 'justify-center' : 'justify-center lg:justify-start'}`}>
                  <div className="relative">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] rounded-3xl flex items-center justify-center animate-pulse shadow-2xl shadow-[#20B2AA]/30">
                      <svg className="w-16 h-16 sm:w-24 sm:h-24 text-white" viewBox="0 0 24 24" fill="none">
                        <path d="M12 22S8 18 8 13V6L12 4L16 6V13C16 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className={`absolute inset-0 border-2 border-[#20B2AA]/30 rounded-3xl animate-ping`}
                        style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2s' }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <div className="inline-block px-4 py-2 bg-[#20B2AA]/20 border border-[#20B2AA]/50 rounded-full mb-6">
                      <span className="text-[#20B2AA] font-semibold uppercase tracking-wide text-sm">Security</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Enterprise-Grade Security
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-6 sm:mb-8">
                      We take your privacy seriously. Each session is completely isolated using{' '}
                      <strong className="text-[#20B2AA]">secure JWT tokens</strong>, ensuring that your documents are never mixed
                      with other users' content. Your session data is automatically managed and secured
                      with enterprise-grade encryption.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { icon: '🔐', text: 'End-to-end encryption' },
                      { icon: '🛡️', text: 'Session isolation' },
                      { icon: '🔒', text: 'Secure data storage' },
                      { icon: '✅', text: 'GDPR compliant' }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 sm:p-4 bg-slate-900/60 border border-slate-600/50 rounded-xl hover:border-[#20B2AA]/50 transition-all duration-300 hover:translate-x-2 backdrop-blur-xl">
                        <span className="text-xl sm:text-2xl">{feature.icon}</span>
                        <span className="text-white font-semibold text-sm sm:text-base">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-16 sm:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Transform Your Document Workflow
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Save time, reduce risks, and improve collaboration with KMRL-Vault.
            </p>

            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col sm:flex-row gap-4 justify-center'} items-center`}>
              <button className="group w-full sm:w-auto bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] hover:from-[#20B2AA] hover:to-[#20B2AA] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#20B2AA]/50">
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                  </svg>
                  <span>Get Started Free</span>
                </div>
              </button>

              <button className="group w-full sm:w-auto bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 hover:border-[#20B2AA]/50 text-slate-300 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl">
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5C16.478 5 20.268 7.943 21.542 12C20.268 16.057 16.478 19 12 19C7.523 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>View Demo</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
