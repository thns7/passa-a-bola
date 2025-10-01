'use client'

import { useEffect, useState } from "react"
import { 
  Download,
  FileDown,
  Sheet
} from "lucide-react"


const ExportButton = ({ 
  data, 
  type, 
  filename, 
  className = "",
  variant = "default" 
}) => {
  const [isExporting, setIsExporting] = useState(false)

  
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    try {
      // Cabeçalhos do CSV
      const headers = Object.keys(data[0]).join(',')
      
      // Dados
      const csvData = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      ).join('\n')

      const csvContent = `${headers}\n${csvData}`
      
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('Erro ao exportar dados')
    }
  }

  
  const exportToPDF = (data, filename) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    try {
      
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #5E2E8C; border-bottom: 2px solid #5E2E8C; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #5E2E8C; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .logo { color: #5E2E8C; font-weight: bold; font-size: 18px; }
            .timestamp { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Passa a Bola - Dashboard Admin</div>
            <div class="timestamp">Exportado em: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
          <h1>${filename}</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `

      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(content)
      printWindow.document.close()
      
      
      setTimeout(() => {
        printWindow.print()
      }, 500)
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert('Erro ao gerar PDF. Tente exportar como CSV.')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (type === 'csv') {
        exportToCSV(data, filename)
      } else if (type === 'pdf') {
        exportToPDF(data, filename)
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao exportar dados')
    } finally {
      setIsExporting(false)
    }
  }

  const buttonText = type === 'csv' ? 'CSV' : 'PDF'
  const buttonIcon = type === 'csv' ? <Sheet size={16} /> : <FileDown size={16} />

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !data || data.length === 0}
      className={`
        inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${variant === 'primary' 
          ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white hover:from-[#4A2370] hover:to-[#6B3299] shadow-lg hover:shadow-xl' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-[#5E2E8C] hover:text-[#5E2E8C]'
        }
        ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isExporting ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        buttonIcon
      )}
      <span>
        {isExporting ? 'Exportando...' : buttonText}
      </span>
    </button>
  )
}

// COMPONENTE DE MENU DE EXPORTAÇÃO
const ExportMenu = ({ users, posts, stats, engagementData }) => {
  const [isOpen, setIsOpen] = useState(false)

  
  const prepareUsersData = () => {
    return users.map(user => ({
      'ID': user.id,
      'Nome': user.name || 'N/A',
      'Username': user.username || 'N/A',
      'Email': user.email,
      'Tipo': user.role === 'admin' ? 'Administrador' : 'Usuário',
      'Data de Registro': user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A',
      'Última Atualização': user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'
    }))
  }

  const preparePostsData = () => {
    return posts.map(post => ({
      'ID': post.id,
      'Conteúdo': post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : 'N/A',
      'Autor': post.user_name || 'N/A',
      'Email do Autor': post.user_email || 'N/A',
      'Curtidas': post.likes_count || 0,
      'Comentários': post.comments_count || 0,
      'Data de Criação': post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR') : 'N/A',
      'Possui Imagem': post.image ? 'Sim' : 'Não'
    }))
  }

  const prepareStatsData = () => {
    if (!stats) return []
    
    return [{
      'Total de Usuários': stats.total_users,
      'Total de Posts': stats.total_posts,
      'Total de Comentários': stats.total_comments,
      'Usuários Ativos': stats.active_users,
      'Taxa de Atividade': `${((stats.active_users / Math.max(stats.total_users, 1)) * 100).toFixed(1)}%`,
      'Posts por Usuário': (stats.total_posts / Math.max(stats.total_users, 1)).toFixed(1),
      'Data da Exportação': new Date().toLocaleString('pt-BR')
    }]
  }

  const prepareEngagementData = () => {
    return engagementData.map(day => ({
      'Dia da Semana': day.day,
      'Posts': day.posts,
      'Comentários': day.comments,
      'Total de Interações': day.posts + day.comments
    }))
  }

  const exportOptions = [
    {
      label: 'Dados de Usuários',
      data: prepareUsersData(),
      filename: 'usuarios-passa-a-bola'
    },
    {
      label: 'Posts da Comunidade',
      data: preparePostsData(),
      filename: 'posts-comunidade'
    },
    {
      label: 'Estatísticas Gerais',
      data: prepareStatsData(),
      filename: 'estatisticas-gerais'
    },
    {
      label: 'Engajamento Semanal',
      data: prepareEngagementData(),
      filename: 'engajamento-semanal'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white px-4 py-3 rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Download size={18} />
        <span>Exportar Dados</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu de Exportação */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Exportar Dados</h3>
              <p className="text-sm text-gray-600 mt-1">Escolha o formato e os dados</p>
            </div>
            
            <div className="p-4 space-y-3">
              {exportOptions.map((option, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{option.label}</p>
                  <div className="flex space-x-2">
                    <ExportButton
                      data={option.data}
                      type="csv"
                      filename={option.filename}
                      variant="default"
                      className="flex-1"
                    />
                    <ExportButton
                      data={option.data}
                      type="pdf"
                      filename={option.filename}
                      variant="default"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                CSV para análise em planilhas, PDF para relatórios
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ExportMenu