import { useState } from 'react'
import { useUser, registerService } from '../../../entities/user'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const RegisterForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: 'onChange', // validacion en tiempo real
    })

    const { userInfo, checkSession } = useUser()
    // const { userInfo, checkSession } = useContext(UserContext)
    const [showPassword, setShowPassword] = useState(false)
    const [redirect, setRedirect] = useState(false)
    const fieldClass = (hasError) =>
        `input input-bordered w-full ${hasError ? 'input-error' : ''}`

    const onSubmit = async (data) => {
        // Registrando al usuario
        const result = await registerService(data)

        if (result.success) {
            // Verificar la sesión real del servidor después del registro
            await checkSession()
            reset()
            setRedirect(true)
            toast.success('Registro exitoso.')
        } else {
            toast.error(result.message || 'Error. Intente más tarde.')
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
                    {...register('username', {
                        required: 'El nombre de usuario es requerido.',
                        minLength: {
                            value: 3,
                            message: 'Mínimo 3 caracteres.',
                        },
                        maxLength: {
                            value: 20,
                            message: 'Máximo 20 caracteres.',
                        },
                    })}
                    className={fieldClass(Boolean(errors.username))}
                    autoComplete="usernames"
                    name="username"
                    placeholder="Nombre de Usuario"
                    type="text"
                />
                {errors.username && (
                    <p className="mt-2 ml-1 text-sm text-error">
                        {errors.username.message}
                    </p>
                )}
            </div>
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
                Registrarse
            </button>
        </form>
    )
}

export default RegisterForm
