const HeroCarousel = () => {
    const scrollToSlide = (slideId) => {
        const slide = document.getElementById(slideId)
        if (slide) {
            // block: 'nearest' es el truco para que NO salte verticalmente
            slide.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start',
            })
        }
    }

    return (
        <div className="carousel w-full overflow-hidden">
            {/* SLIDE 1 */}
            <div
                id="slide1"
                className="carousel-item relative w-full h-[60vh] md:h-[70vh]"
            >
                <img
                    src="https://res.cloudinary.com/df44tcwb2/image/upload/v1787013672/SFHero3_gs2zkz.jpg"
                    alt="Colección Verano"
                    className="w-full h-full object-cover object-center block"
                />

                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 md:px-8">
                    {/* El Título principal (Gigante e impactante) */}
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-xl mb-2 sm:mb-4 uppercase italic tracking-wider leading-tight">
                        ¡Retro Socks en tu pies!
                    </h1>

                    {/* El Subtítulo */}
                    <p className="text-sm sm:text-base md:text-xl text-white/90 font-medium drop-shadow-md mb-6 md:mb-8 max-w-2xl px-2">
                        Arte original de Ryu, impreso en HD.
                    </p>

                    {/* El Botón de Llamado a la Acción (CTA) */}
                    <button className="btn btn-accent rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-sm px-6 min-h-[2.5rem] h-10 sm:min-h-[3rem] sm:h-12 sm:text-base sm:px-8">
                        Ver Colección Limitada
                    </button>
                </div>

                {/* Flechas de navegación del carrusel */}
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                    <button
                        onClick={() => scrollToSlide('slide2')}
                        className="btn btn-circle btn-ghost bg-black/30 text-white hover:bg-black/50"
                    >
                        ❮
                    </button>
                    <button
                        onClick={() => scrollToSlide('slide2')}
                        className="btn btn-circle btn-ghost bg-black/30 text-white hover:bg-black/50"
                    >
                        ❯
                    </button>
                </div>
            </div>

            {/* SLIDE 2 (Repetir estructura) */}
            <div
                id="slide2"
                className="carousel-item relative w-full h-[60vh] md:h-[70vh]"
            >
                <img
                    src="https://res.cloudinary.com/df44tcwb2/image/upload/v1787013672/SFHero3_gs2zkz.jpg"
                    alt="Colección Verano"
                    className="w-full h-full object-cover object-center block"
                />

                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 md:px-8">
                    {/* TÍTULO MOBILE FIRST: Empieza en text-3xl y leading-tight */}
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white drop-shadow-xl mb-2 sm:mb-4 uppercase italic tracking-wider leading-tight">
                        ¡Calcetines Para Lucir Pro!
                    </h1>

                    {/* SUBTÍTULO MOBILE FIRST */}
                    <p className="text-sm sm:text-base md:text-xl text-white/90 font-medium drop-shadow-md mb-6 md:mb-8 max-w-2xl px-2">
                        Street Fighter 2 ha vuelto y en forma de calcetines. ¡No
                        te quedes sin los tuyos!
                    </p>

                    {/* BOTÓN MOBILE FIRST: Respetamos tu btn-primary */}
                    <button className="btn btn-primary rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-sm px-6 min-h-[2.5rem] h-10 sm:min-h-[3rem] sm:h-12 sm:text-base sm:px-8">
                        Ver Colección Limitada
                    </button>
                </div>

                {/* Flechas de navegación del carrusel */}
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                    <button
                        onClick={() => scrollToSlide('slide1')}
                        className="btn btn-circle btn-ghost bg-black/30 text-white hover:bg-black/50"
                    >
                        ❮
                    </button>
                    <button
                        onClick={() => scrollToSlide('slide1')}
                        className="btn btn-circle btn-ghost bg-black/30 text-white hover:bg-black/50"
                    >
                        ❯
                    </button>
                </div>
            </div>
            {/* Agrega los slides que necesites */}
        </div>
    )
}

export default HeroCarousel
