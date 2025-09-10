import CardSection from "../components/CardSection";

export default function RegisterPage() {
  return (
    <CardSection title="Registro">
      <form className="flex flex-col gap-3">
        <input type="text" placeholder="Nome" className="border p-2 rounded" />
        <input type="text" placeholder="Username" className="border p-2 rounded" />
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Senha" className="border p-2 rounded" />
        <button className="bg-purple-600 text-white rounded p-2">
          Registrar
        </button>
      </form>

      <p className="text-center text-sm mt-3">
        Já tem uma conta?{" "}
        <span className="text-purple-600 cursor-pointer">Login</span>
      </p>
    </CardSection>
  );
}
