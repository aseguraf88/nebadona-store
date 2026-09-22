const ComingSoon = () => {
    return (
        <a
            href="https://www.instagram.com/nebadon_a/"
            target="_blank"
            rel="noreferrer"
            className="fixed inset-0 block"
        >
            <img
                src="/ProntoAperturaVersionDesktop.png"
                alt="Nebadon - Próxima apertura, síguenos en Instagram"
                className="hidden lg:block h-full w-full object-cover"
            />
            <img
                src="/ProntoAperturaVersionMobile.jpg"
                alt="Nebadon - Próxima apertura, síguenos en Instagram"
                className="block lg:hidden h-full w-full object-cover"
            />
        </a>
    )
}

export default ComingSoon
