import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginService } from '../../services/authServices'
import { useUser } from '../../context/UserContext'
import toast from 'react-hot-toast'
import { Navigate } from 'react-router-dom'

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: 'onChange', // validacion en tiempo real
    })

    const { setUserInfo, userInfo } = useUser()
    const [showPassword, setShowPassword] = useState(false)
    const [redirect, setRedirect] = useState(false)
    const fieldClass = (hasError) =>
        `input input-bordered w-full ${hasError ? 'input-error' : ''}`

    const onSubmit = async (data) => {
        // Logueando usuario
        const result = await loginService(data)

        if (result.success) {
            setUserInfo(result.data)
            reset()
            setRedirect(true)
            toast.success('Inicio de Sesión Exitoso.')
        } else {
            toast.error(result.message)
        }
    }

    if (redirect) {
        return (
            <Navigate
                to={userInfo?.isAdmin ? '/admin/dashboard/products' : '/'}
            />
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto mt-8 flex max-w-[500px] flex-col gap-4 lg:gap-6"
        >
            <div>
                <input
                    {...register('email', {
                        required: 'El correo electrónico es requerido.',
                        pattern: {
                            value: /^(?!\.)(?!.*\.\.)([a-z0-9_'+.-]*)[a-z0-9_+-]@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,}$/,
                            message: 'Correo electrónico inválido.',
                        },
                        minLength: {
                            value: 6,
                            message: 'Mínimo 6 caracteres.',
                        },
                        maxLength: {
                            value: 254,
                            message: 'Máximo 254 caracteres.',
                        },
                    })}
                    className={fieldClass(Boolean(errors.email))}
                    autoComplete="email"
                    name="email"
                    placeholder="Correo Electrónico"
                    type="email"
                />
                {errors.email && (
                    <p className="mt-2 ml-1 text-sm text-error">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <div className="relative">
                <input
                    {...register('password', {
                        required:
                            'La contraseña es requerida [6-20 caracteres de longitud].',
                        minLength: {
                            value: 6,
                            message: 'Mínimo 6 caracteres.',
                        },
                        maxLength: {
                            value: 20,
                            message: 'Máximo 20 caracteres.',
                        },
                    })}
                    className={fieldClass(Boolean(errors.password))}
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                />
                <button
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                        showPassword
                            ? 'Ocultar contraseña.'
                            : 'Mostrar contraseña.'
                    }
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-base-content/60"
                >
                    {showPassword ? (
                        <FaEyeSlash size={23} />
                    ) : (
                        <FaEye size={23} />
                    )}
                </button>
                {errors.password && (
                    <p className="mt-2 ml-1 text-sm text-error">
                        {errors.password.message}
                    </p>
                )}
            </div>
            <button className="btn btn-primary" type="submit">
                Iniciar Sesión
            </button>
        </form>
    )
}

export default LoginForm

