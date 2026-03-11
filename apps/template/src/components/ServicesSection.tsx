interface Props {
  services: string[]
  primaryColor: string
}

export default function ServicesSection({ services, primaryColor }: Props) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service}
              className="bg-white rounded-xl p-6 text-center shadow-sm border hover:shadow-md transition-shadow"
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-3"
                style={{ backgroundColor: primaryColor }}
              />
              <p className="font-medium text-gray-800">{service}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
