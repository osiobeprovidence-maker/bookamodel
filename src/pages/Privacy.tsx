export const PrivacyPage = () => {
  const sections = [
    {
      title: "Data Collection",
      content: "We collect personal identification information, professional specifications (height, specs), and media assets to facilitate talent discovery and booking. We also collect transaction data for secure payment processing."
    },
    {
      title: "Information Usage",
      content: "Your data is used to optimize search results for brands, verify identity, process secure payments, and provide essential platform notifications."
    },
    {
      title: "Data Protection",
      content: "We implement industry-standard security measures including SSL encryption and secure data centers to protect your sensitive information and portfolio assets."
    },
    {
      title: "Third-Party Sharing",
      content: "We do not sell your personal data. Limited information is shared with payment processors (e.g. Paystack/Flutterwave) and booking brands to facilitate professional engagements."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Your Privacy</div>
        <h1 className="text-6xl font-extrabold tracking-tighter uppercase mb-16">Privacy Policy</h1>
        
        <div className="space-y-16">
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-[#D4AF37] pl-8 py-2">
              We are committed to the highest standards of data integrity and transparency.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-tight">{section.title}</h2>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-16 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Request data deletion or view your information by emailing privacy@bookamodel.ng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
