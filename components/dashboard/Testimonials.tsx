import InfiniteMovingCards from "@/components/ui/infinite-moving-cards";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Kualitas pupuk sangat baik, hasil panen meningkat drastis!",
      name: "Pak Suharto",
      title: "Petani Padi",
    },
    {
      quote: "Pelayanan cepat dan harga terjangkau. Sangat merekomendasikan!",
      name: "Bu Sari",
      title: "Petani Sayuran",
    },
    {
      quote: "Pupuk organik terbaik yang pernah saya gunakan.",
      name: "Pak Joko",
      title: "Petani Buah",
    },
  ];
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Testimoni Pelanggan
          </h2>
          <p className="text-gray-600">Apa kata mereka tentang Sedulur Tani</p>
        </div>
        <InfiniteMovingCards items={testimonials} />
      </div>
    </section>
  );
}
