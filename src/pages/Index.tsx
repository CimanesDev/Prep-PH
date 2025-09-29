import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img src="/images/preplogo.png" alt="PrepPH" className="h-10 w-auto mx-auto mb-4" />
          <h1 className="mb-4 text-4xl font-bold">Welcome to PrepPH</h1>
          <p className="text-xl text-muted-foreground">Practice interviews tailored to your role.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
