'use client'

import { useState, useEffect } from 'react'

const EventForm = ({ onSuccess, onCancel, eventToEdit = null }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'torneio',
    data_evento: '',
    hora: '',
    local: '',
    endereco: '',
    valor: '',
    categoria: '',
    idade: '',
    clube: '',
    max_inscricoes: '',
    imagem_url: ''
  })

  // Preenche o formulário se estiver editando
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        titulo: eventToEdit.titulo || '',
        descricao: eventToEdit.descricao || '',
        tipo: eventToEdit.tipo || 'torneio',
        data_evento: eventToEdit.data_evento ? eventToEdit.data_evento.split('T')[0] : '',
        hora: eventToEdit.hora || '',
        local: eventToEdit.local || '',
        endereco: eventToEdit.endereco || '',
        valor: eventToEdit.valor || '',
        categoria: eventToEdit.categoria || '',
        idade: eventToEdit.idade || '',
        clube: eventToEdit.clube || '',
        max_inscricoes: eventToEdit.max_inscricoes || '',
        imagem_url: eventToEdit.imagem_url || ''
      })
    }
  }, [eventToEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'

      // Preparar dados para envio
      const submitData = {
        ...formData,
        max_inscricoes: formData.max_inscricoes ? parseInt(formData.max_inscricoes) : null
      }

      let response
      if (eventToEdit) {
        // Editar evento existente
        response = await fetch(`${API_BASE_URL}/api/events/${eventToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        })
      } else {
        // Criar novo evento
        response = await fetch(`${API_BASE_URL}/api/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        })
      }

      if (response.ok) {
        const result = await response.json()
        alert(eventToEdit ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!')
        onSuccess(result)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao salvar evento')
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getTituloByTipo = (tipo) => {
    const titulos = {
      torneio: 'Torneio',
      copa: 'Copa', 
      peneira: 'Peneira',
      workshop: 'Workshop'
    }
    return titulos[tipo] || 'Evento'
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {eventToEdit ? 'Editar Evento' : 'Criar Novo Evento'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mt-2">
          {eventToEdit 
            ? 'Atualize as informações do evento' 
            : 'Preencha os dados abaixo para criar um novo evento'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Tipo de Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Evento *
          </label>
          <select
            name="tipo"
            required
            value={formData.tipo}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
          >
            <option value="torneio">Torneio</option>
            <option value="copa">Copa</option>
            <option value="peneira">Peneira</option>
            <option value="workshop">Workshop</option>
          </select>
        </div>

        {/* Título do Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título do {getTituloByTipo(formData.tipo)} *
          </label>
          <input
            type="text"
            name="titulo"
            required
            value={formData.titulo}
            onChange={handleChange}
            placeholder={`Ex: ${getTituloByTipo(formData.tipo)} de Futebol Society...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
          />
        </div>

        {/* Grid de Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do Evento *
            </label>
            <input
              type="date"
              name="data_evento"
              required
              value={formData.data_evento}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora do Evento *
            </label>
            <input
              type="time"
              name="hora"
              required
              value={formData.hora}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        {/* Local e Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local *
            </label>
            <input
              type="text"
              name="local"
              required
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: Arena Limão - São Paulo/SP"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço Completo
            </label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        {/* Valor e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor
            </label>
            <input
              type="text"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="Ex: R$ Gratuito, R$ 50 por pessoa..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            >
              <option value="">Selecione uma categoria</option>
              <option value="SOCIAL">Social</option>
              <option value="SUB-15">Sub-15</option>
              <option value="SUB-17">Sub-17</option>
              <option value="SUB-20">Sub-20</option>
              <option value="ADULTO">Adulto</option>
              <option value="LIGA">Liga</option>
              <option value="COPA">Copa</option>
              <option value="PENEIRA">Peneira</option>
            </select>
          </div>
        </div>

        {/* Campos específicos para Peneira */}
        {formData.tipo === 'peneira' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Clube *
              </label>
              <input
                type="text"
                name="clube"
                required={formData.tipo === 'peneira'}
                value={formData.clube}
                onChange={handleChange}
                placeholder="Ex: São Paulo FC, Corinthians..."
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Faixa Etária *
              </label>
              <select
                name="idade"
                required={formData.tipo === 'peneira'}
                value={formData.idade}
                onChange={handleChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Selecione a idade</option>
                <option value="Sub-15">Sub-15</option>
                <option value="Sub-17">Sub-17</option>
                <option value="Sub-20">Sub-20</option>
                <option value="Adulto">Adulto</option>
              </select>
            </div>
          </div>
        )}

        {/* Idade (para outros tipos de evento) */}
        {formData.tipo !== 'peneira' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa Etária
            </label>
            <select
              name="idade"
              value={formData.idade}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            >
              <option value="">Todas as idades</option>
              <option value="Sub-15">Sub-15</option>
              <option value="Sub-17">Sub-17</option>
              <option value="Sub-20">Sub-20</option>
              <option value="Adulto">Adulto</option>
            </select>
          </div>
        )}

        {/* Limite de Inscrições e Imagem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de Inscrições
            </label>
            <input
              type="number"
              name="max_inscricoes"
              min="1"
              value={formData.max_inscricoes}
              onChange={handleChange}
              placeholder="Deixe vazio para ilimitado"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número máximo de participantes. Deixe em branco para não ter limite.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              name="imagem_url"
              value={formData.imagem_url}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link para imagem do evento (opcional)
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição do Evento *
          </label>
          <textarea
            name="descricao"
            required
            rows="4"
            value={formData.descricao}
            onChange={handleChange}
            placeholder={`Descreva detalhes do ${getTituloByTipo(formData.tipo).toLowerCase()}, regras, formato, etc...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2E8C] focus:border-transparent transition duration-200 resize-vertical"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.descricao.length}/500 caracteres
          </p>
        </div>

        {/* Preview Rápido */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-2">Prévia do Evento:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Título:</strong> {formData.titulo || '(não definido)'}</p>
            <p><strong>Data:</strong> {formData.data_evento ? new Date(formData.data_evento).toLocaleDateString('pt-BR') : '(não definida)'}</p>
            <p><strong>Local:</strong> {formData.local || '(não definido)'}</p>
            <p><strong>Tipo:</strong> {getTituloByTipo(formData.tipo)}</p>
            {formData.tipo === 'peneira' && (
              <p><strong>Clube:</strong> {formData.clube || '(não definido)'}</p>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white rounded-lg hover:from-[#4A2370] hover:to-[#6B3299] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <span>{eventToEdit ? 'Atualizar Evento' : 'Criar Evento'}</span>
            )}
          </button>
        </div>

        {/* Informações de Ajuda */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-700">
              <strong>Dica:</strong> Campos marcados com * são obrigatórios. 
              Para peneiras, preencha também o clube e a faixa etária.
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EventForm