const ComingSoon = () => {
    return (
        <a
            href="https://www.instagram.com/nebadon_a/"
            target="_blank"
            rel="noreferrer"
            className="block h-screen w-screen"
        >
            <img
                src="/ProntoAperturaVersionDesktop.png"
                alt="Nebadon - Próxima apertura, síguenos en Instagram"
                className="hidden lg:block h-screen w-screen object-cover"
            />
            <img
                src="/ProntoAperturaVersionMobile.jpg"
                alt="Nebadon - Próxima apertura, síguenos en Instagram"
                className="block lg:hidden h-screen w-screen object-cover"
            />
        </a>
    )
}

export default ComingSoon
