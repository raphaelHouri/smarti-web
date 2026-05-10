import ConnectJson from "./connect";
import FooterPage from "./footer";
import HeaderPage from "./header";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <HeaderPage />
      <main className="flex-1 flex flex-col min-w-0 w-full">
        {children}
      </main>
      {/* Can extend the number of sections in the future */}
      {/* <ConnectJson/> */}
      <FooterPage />
    </div>
  );
};

export default MarketingLayout;
