interface FooterProps {
  isArabic?: boolean;
}

export const Footer = ({ isArabic = false }: FooterProps) => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Company Confidential - Internal Use Only
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isArabic ? 
              "منصة قيادة الطوارئ - قسم عمليات الأمن" : 
              "Emergency Command Platform - Security Operations Division"
            }
          </p>
        </div>
      </div>
    </footer>
  );
};
