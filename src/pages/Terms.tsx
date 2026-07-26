export const TermsPage = () => {
  const sections = [
    {
      title: "1. Talent Eligibility",
      content: "Talent must be at least 18 years of age or have legal guardian consent to use the BookAModel platform. All profiles must contain accurate, non-misleading information and professional quality media."
    },
    {
      title: "2. Booking & Payments",
      content: "All payments for services booked through BookAModel must be processed via our secure escrow system. Direct payments outside the platform for bookings initiated on BookAModel are strictly prohibited and may result in account termination."
    },
    {
      title: "3. Escrow & Disputes",
      content: "Funds are held in escrow until 24 hours after the scheduled job completion. In case of a dispute, BookAModel's mediation team will review all project briefs and communication to reach a fair resolution."
    },
    {
      title: "4. Code of Conduct",
      content: "Professionalism is mandatory. Harassment, unprofessional behavior, or failure to appear for confirmed bookings without valid reason will lead to immediate review and potential de-platforming."
    },
    {
      title: "5. Intellectual Property",
      content: "Usage rights for media created during bookings are defined by the specific project brief. Unless otherwise stated, the talent retains rights to use media for their personal portfolio."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.4em] mb-4">Legal Framework</div>
        <h1 className="text-6xl font-extrabold tracking-tighter uppercase mb-16">Terms of Service</h1>
        
        <div className="space-y-16">
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-[#D4AF37] pl-8 py-2">
              Last Updated: July 2026. Please read these terms carefully before utilizing the BookAModel ecosystem.
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
              Questions regarding our terms? Contact our legal department at legal@bookamodel.ng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
