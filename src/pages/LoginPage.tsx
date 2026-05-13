import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn, Shield } from 'lucide-react'
import { PlatoonBrand } from '../components/PlatoonBrand'
import { Button, Field, Panel, TextInput } from '../components/ui'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate replace to="/admin" />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const allowed = login(username, password)

    if (!allowed) {
      setError('Usuário ou senha inválidos.')
      return
    }

    navigate('/admin')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PlatoonBrand compact />
      <div className="mx-auto grid min-h-[calc(100vh-112px)] w-full max-w-md place-items-center px-4 py-8">
        <div className="w-full">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-50">
              Escala de Limpeza - 6º Pelotão
            </h1>
            <p className="text-sm font-semibold text-slate-400">Acesso administrativo</p>
          </div>
        </div>

        <Panel>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Field label="Usuário">
              <TextInput
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                value={username}
              />
            </Field>
            <Field label="Senha">
              <TextInput
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </Field>
            {error && (
              <div className="rounded-md border border-red-700/60 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">
                {error}
              </div>
            )}
            <Button icon={<LogIn size={16} />} type="submit">
              Entrar
            </Button>
          </form>
        </Panel>
        </div>
      </div>
    </main>
  )
}
