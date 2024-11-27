import Image from "next/image";

function Loader() {
  return (
    <main className="text-center text-light-100">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/assets/icons/loader-brand.svg"
          alt="loader"
          width={40}
          height={40}
          style={{animation: 'spin 10s linear infinite'}}
        />
        Loading...
      </div>
    </main>
  );
}

export default Loader;
