import accreditationBanner from "../../assets/accreditation_banner.png";

export const Footer = () => {
  const socialIcons = [
    {
      alt: "Facebook",
      icon: (
        <svg fill="#ffffff" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
        </svg>
      )
    },
    {
      alt: "Instagram",
      icon: (
        <svg fill="#ffffff" viewBox="0 0 24 24" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.36.88.4.4.66.8.88 1.36.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.88 1.36-.4.4-.8.66-1.36.88-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.36-.88-.4-.4-.66-.8-.88-1.36-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.88-1.36.4-.4.8-.66 1.36-.88.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07m0-2.16C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.73-2.13 1.4C1.34 2.7.92 3.37.61 4.16.31 4.92.11 5.79.05 7.07.01 8.35 0 8.76 0 12s.01 3.65.07 4.93c.06 1.28.26 2.15.56 2.91.31.79.73 1.46 1.4 2.13.67.67 1.34 1.09 2.13 1.4.76.3 1.63.5 2.91.56 1.28.06 1.69.07 4.93.07s3.65-.01 4.93-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.73 2.13-1.4.67-.67 1.09-1.34 1.4-2.13.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.93s-.01-3.65-.07-4.93c-.06-1.28-.26-2.15-.56-2.91-.31-.79-.73-1.46-1.4-2.13-.67-.67-1.34-1.09-2.13-1.4-.76-.3-1.63-.5-2.91-.56C15.65.01 15.24 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.44a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      alt: "LinkedIn",
      icon: (
        <svg fill="#ffffff" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM3.55 20.45h3.56V9H3.55v11.45z" />
        </svg>
      )
    },
    {
      alt: "X",
      icon: (
        <svg fill="#ffffff" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.25l-4.9-6.4L6.45 22H3.34l7.25-8.28L3 2h6.41l4.43 5.81L18.9 2Zm-1.08 18.19h1.7L7.6 3.72H5.76l12.06 16.47Z" />
        </svg>
      )
    },
    {
      alt: "YouTube",
      icon: (
        <svg fill="#ffffff" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.99 15.1v-6.2l5.44 3.1-5.44 3.1z" />
        </svg>
      )
    },
  ];

    return (
        <footer className="w-full mt-auto text-white bg-[linear-gradient(90deg,#d22864_0%,#972fa4_100%)]">
            <div className="max-w-7xl mx-auto px-10 py-12">

                {/* Contenido principal */}
                <div className="grid md:grid-cols-2 gap-10 items-center">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="flex flex-col">
                        <h2 className="font-bold text-2xl leading-tight">
                            FACULTAD DE INGENIERÍA Y CIENCIAS
                        </h2>

                        <h3 className="font-bold text-xl mb-6">
                            Universidad de La Frontera
                        </h3>

                        <address className="not-italic text-base space-y-1 font-light">
                            <p>Av. Francisco Salazar 01145, Temuco-Chile</p>
                            <p>Casilla 54-D</p>
                            <p>Fono: (56) (45) 23224009</p>
                            <a
                                href="mailto:secretaria.vincfica@ufrontera.cl"
                                className="hover:underline"
                            >
                                email: secretaria.vincfica@ufrontera.cl
                            </a>
                        </address>

                        {/* ÍCONOS REDES SOCIALES */}
                        <div className="flex gap-4 mt-8">
                            {socialIcons.map((icon) => (
                                <a
                                    key={icon.alt}
                                    href="#"
                                    aria-label={icon.alt}
                                    className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                                >
                                    {icon.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="flex justify-center md:justify-end">
                        <img
                            className="w-[430px] object-contain"
                            alt="Institución acreditada"
                            src={accreditationBanner}
                        />
                    </div>

                </div>

                {/* COPYRIGHT */}
                <div className="mt-8 pt-5 border-t border-white/20 text-center text-base">
                    © 2026 Universidad de la Frontera - Sistema de Gestión de Prácticas FICA
                </div>

            </div>
        </footer>
    );
};
