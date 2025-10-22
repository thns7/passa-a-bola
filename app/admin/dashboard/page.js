'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Activity, 
  Trash2, 
  Shield,
  ShieldOff,
  BarChart3,
  TrendingUp,
  Home,
  Calendar,
  Eye,
  Search,
  Filter,
  Menu,
  X,
  MapPin,
  DollarSign
} from "lucide-react"
import ExportMenu from "@/app/components/ExportButton"
import EventForm from "@/app/components/EventForm"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [events, setEvents] = useState([])
  const [eventRegistrations, setEventRegistrations] = useState({})
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data a definir';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora
  const formatarHora = (horaISO) => {
    if (!horaISO) return 'Hora a definir';
    return horaISO.substring(0, 5); // Extrai HH:MM
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const fetchEngagementData = async () => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const [postsResponse, commentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/posts`),
        fetch(`${API_BASE_URL}/comments`) 
      ])

      const postsData = await postsResponse.json()
      const commentsData = await commentsResponse.json()
      
      if (postsData && commentsData && Array.isArray(postsData) && Array.isArray(commentsData)) {
        const postsByDay = {
          'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0, 'Dom': 0
        }
        
        const commentsByDay = {
          'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0, 'Dom': 0
        }

        postsData.forEach(post => {
          if (post && post.created_at) {
            const postDate = new Date(post.created_at)
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            const dayName = dayNames[postDate.getDay()]
            postsByDay[dayName]++
          }
        })

        commentsData.forEach(comment => {
          if (comment && comment.created_at) {
            const commentDate = new Date(comment.created_at)
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            const dayName = dayNames[commentDate.getDay()]
            commentsByDay[dayName]++
          }
        })

        return Object.entries(postsByDay).map(([day, posts]) => ({
          day,
          posts,
          comments: commentsByDay[day] || 0 
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar dados de engajamento:', error)
    }
    
    return [
      { day: 'Seg', posts: 0, comments: 0 },
      { day: 'Ter', posts: 0, comments: 0 },
      { day: 'Qua', posts: 0, comments: 0 },
      { day: 'Qui', posts: 0, comments: 0 },
      { day: 'Sex', posts: 0, comments: 0 },
      { day: 'Sáb', posts: 0, comments: 0 },
      { day: 'Dom', posts: 0, comments: 0 }
    ]
  }

  // Funções para Eventos
  const fetchEvents = async () => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const response = await fetch(`${API_BASE_URL}/api/events`)
      const eventsData = await response.json()
      
      if (Array.isArray(eventsData)) {
        setEvents(eventsData)
        
        // Carrega inscrições para cada evento
        const registrationsPromises = eventsData.map(event => 
          fetch(`${API_BASE_URL}/api/events/${event.id}/registrations`)
            .then(res => res.json())
            .catch(err => {
              console.error(`Erro ao buscar inscrições do evento ${event.id}:`, err)
              return []
            })
        )
        
        const registrationsData = await Promise.all(registrationsPromises)
        const registrationsMap = {}
        
        eventsData.forEach((event, index) => {
          registrationsMap[event.id] = Array.isArray(registrationsData[index]) ? registrationsData[index] : []
        })
        
        setEventRegistrations(registrationsMap)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      setEvents([])
    }
  }

  const deleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Todas as inscrições também serão removidas.')) {
      return
    }

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Evento excluído com sucesso!')
        fetchEvents()
      } else {
        throw new Error('Erro ao excluir evento')
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      alert('Erro ao excluir evento')
    }
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'

      const [statsRes, usersRes, postsRes, commentsRes, engagementData] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`),
        fetch(`${API_BASE_URL}/admin/users`),
        fetch(`${API_BASE_URL}/posts`),
        fetch(`${API_BASE_URL}/comments`), 
        fetchEngagementData()
      ])
        
      const usersData = await usersRes.json()
      if (usersData.success && Array.isArray(usersData.users)) {
        setUsers(usersData.users)
      } else {
        console.error('Erro ao buscar usuários:', usersData.error)
        setUsers([])
      }

      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.stats)
      }

      const postsData = await postsRes.json()
      if (Array.isArray(postsData)) {
        setPosts(postsData.slice(0, 10))
      } else {
        setPosts([])
      }

      const commentsData = await commentsRes.json()
      if (Array.isArray(commentsData)) {
        setComments(commentsData)
      } else {
        setComments([])
      }

      setEngagementData(engagementData)

      // Carrega eventos também
      await fetchEvents()

    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setUsers([])
      setPosts([])
      setComments([])
      setEvents([])
      setStats({
        total_users: 0,
        total_posts: 0,
        total_comments: 0,
        active_users: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const [engagementData, setEngagementData] = useState([])

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        alert('Usuário deletado com sucesso!')
        fetchAllData()
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      alert('Erro ao deletar usuário')
    }
  }

  const deletePost = async (postId) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) {
      return
    }

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.message) {
        alert('Post deletado com sucesso!')
        fetchAllData()
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error)
      alert('Erro ao deletar post')
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://passa-a-bola.onrender.com'
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role?role=${newRole}`, {
        method: 'PUT'
      })
      const data = await response.json()

      if (data.success) {
        alert(`Usuário agora é ${newRole}!`)
        fetchAllData()
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
    }
  }

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      
      if (!user || !user.id || user.role !== 'admin') {
        router.push('/home')
        return
      }
      
      setIsAdmin(true)
      await fetchAllData()
    }

    checkAdminAndLoad()
  }, [router])

  if (!isAdmin && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5E2E8C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  const realMetrics = {
    postsPerUser: stats ? (stats.total_posts / Math.max(stats.total_users, 1)).toFixed(1) : '0',
    activeRate: stats ? ((stats.active_users / Math.max(stats.total_users, 1)) * 100).toFixed(1) : '0',
    commentsPerPost: stats && stats.total_posts > 0 ? (stats.total_comments / stats.total_posts).toFixed(1) : '0',
    totalComments: comments.length 
  }

  // Tabs para mobile
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'Usuários', icon: <Users size={18} /> },
    { id: 'events', label: 'Eventos', icon: <Calendar size={18} /> },
    { id: 'content', label: 'Conteúdo', icon: <FileText size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Mobile */}
      <div className="bg-white shadow-lg lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-600">Passa a Bola</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white px-3 py-2 rounded-lg text-sm"
            >
              <Home size={16} />
              <span className="hidden xs:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 border-t border-gray-200 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#5E2E8C] border border-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Header Desktop */}
      <div className="bg-white shadow-lg hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-2">Gerencie seu aplicativo Passa a Bola</p>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white px-6 py-3 rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home size={20} />
              <span>Voltar para Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Tabs de Navegação - Desktop */}
        <div className="hidden lg:flex space-x-1 bg-white rounded-2xl p-2 shadow-lg mb-8 border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#5E2E8C]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                { 
                  title: 'Usuários', 
                  value: stats?.total_users || 0, 
                  subtitle: 'Registrados',
                  icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
                  color: 'from-blue-500 to-blue-600'
                },
                { 
                  title: 'Posts', 
                  value: stats?.total_posts || 0, 
                  subtitle: `${realMetrics.postsPerUser} por usuário`,
                  icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" />,
                  color: 'from-green-500 to-green-600'
                },
                { 
                  title: 'Comentários', 
                  value: realMetrics.totalComments || 0,
                  subtitle: `${realMetrics.commentsPerPost} por post`,
                  icon: <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />,
                  color: 'from-purple-500 to-purple-600'
                },
                { 
                  title: 'Atividade', 
                  value: `${realMetrics.activeRate}%`, 
                  subtitle: `${stats?.active_users || 0} ativos`,
                  icon: <Activity className="h-5 w-5 sm:h-6 sm:w-6" />,
                  color: 'from-orange-500 to-orange-600'
                }
              ].map((card, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{card.value}</p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">{card.subtitle}</p>
                    </div>
                    <div className={`bg-gradient-to-r ${card.color} p-2 sm:p-3 rounded-lg sm:rounded-xl text-white ml-3 flex-shrink-0`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                  Engajamento Semanal
                </h3>
                <span className="text-xs sm:text-sm text-gray-500">Dados reais</span>
              </div>
              <div className="flex items-end space-x-2 sm:space-x-4 h-32 sm:h-48 overflow-x-auto pb-2">
                {engagementData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '40px' }}>
                    <div className="flex space-x-1 sm:space-x-2 h-24 sm:h-40 items-end w-full justify-center">
                      <div 
                        className="w-3 sm:w-4 lg:w-6 bg-gradient-to-t from-[#5E2E8C] to-[#7E3EB4] rounded-t transition-all duration-300 hover:from-[#4A2370] hover:to-[#6B3299] cursor-pointer"
                        style={{ height: `${Math.max(item.posts * 8, 15)}px` }}
                        title={`${item.posts} posts`}
                      />
                      <div 
                        className="w-3 sm:w-4 lg:w-6 bg-gradient-to-t from-green-500 to-green-600 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-700 cursor-pointer"
                        style={{ height: `${Math.max(item.comments * 4, 15)}px` }}
                        title={`${item.comments} comentários`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 mt-2">{item.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-6 mt-4 sm:mt-6 text-xs sm:text-sm gap-2 sm:gap-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] rounded"></div>
                  <span>Posts ({engagementData.reduce((sum, day) => sum + day.posts, 0)})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                  <span>Comentários ({engagementData.reduce((sum, day) => sum + day.comments, 0)})</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas e Atividades */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                  Ações Rápidas
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 text-[#5E2E8C] hover:from-purple-100 hover:to-blue-100 transition-all duration-200 border border-purple-100 flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Gerenciar Usuários</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 transition-all duration-200 border border-orange-100 flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Gerenciar Eventos</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('content')}
                    className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-100 flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base"
                  >
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Moderar Conteúdo</span>
                  </button>
                  <div className="w-full">
                    <ExportMenu
                      users={users}
                      posts={posts}
                      stats={stats}
                      engagementData={engagementData}
                    />
                  </div>
                </div>
              </div>

              {/* Últimas Atividades */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                    Últimas Atividades
                  </h3>
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {posts.slice(0, 3).map(post => (
                    <div key={post.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.user_name}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {truncateText(post.content, 60)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestão de Usuários */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] rounded-t-xl sm:rounded-t-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Gestão de Usuários
                  </h2>
                  <p className="text-purple-200 text-xs sm:text-sm mt-1">
                    {filteredUsers.length} de {users.length} usuários
                    {searchTerm && ` • "${searchTerm}"`}
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-200" />
                  <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-white font-medium">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 w-full">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Pesquisar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-[#5E2E8C] focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-[#5E2E8C]" />
                    <span>
                      {filteredUsers.filter(u => u.role === 'admin').length} admins
                    </span>
                  </div>
                  <div className="h-3 sm:h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#5E2E8C]" />
                    <span>
                      {filteredUsers.filter(u => u.role === 'user').length} users
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-[#5E2E8C] border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 text-sm sm:text-lg">Carregando usuários...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
              <div className="p-8 sm:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                    {searchTerm 
                      ? `Não encontramos resultados para "${searchTerm}".`
                      : 'Não há usuários registrados no sistema ainda.'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all duration-200 text-sm sm:text-base"
                    >
                      Limpar pesquisa
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tabela com dados - Mobile Cards / Desktop Table */}
            {!loading && filteredUsers.length > 0 && (
              <div className="overflow-hidden">
                {/* Mobile View - Cards */}
                <div className="lg:hidden">
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="p-4 border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.name}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#5E2E8C] to-[#7E3EB4] rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {user.name || 'Nome não informado'}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">@{user.username || 'semusername'}</p>
                                <p className="text-xs text-gray-600 mt-1 truncate">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === 'admin' 
                                      ? 'bg-[#5E2E8C] text-white' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              {(user.role === 'user' || !user.role) ? (
                                <button
                                  onClick={() => updateUserRole(user.id, 'admin')}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-[#5E2E8C] hover:bg-[#4A2370] transition-all duration-200"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Promover
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserRole(user.id, 'user')}
                                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                                >
                                  <ShieldOff className="w-3 h-3 mr-1" />
                                  Rebaixar
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Deletar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-[#5E2E8C] uppercase tracking-wider border-b border-gray-200">
                          Usuário
                        </th>
                        <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-[#5E2E8C] uppercase tracking-wider border-b border-gray-200">
                          Contato
                        </th>
                        <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-[#5E2E8C] uppercase tracking-wider border-b border-gray-200">
                          Registro
                        </th>
                        <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-[#5E2E8C] uppercase tracking-wider border-b border-gray-200">
                          Permissão
                        </th>
                        <th className="px-6 lg:px-8 py-4 text-left text-xs font-bold text-[#5E2E8C] uppercase tracking-wider border-b border-gray-200">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-white transition-all duration-200 group">
                          <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {user.avatar ? (
                                  <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#5E2E8C] to-[#7E3EB4] rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-[#5E2E8C] transition-colors">
                                  {user.name || 'Nome não informado'}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  <span className="text-[#5E2E8C] font-medium">@</span>
                                  {user.username || 'semusername'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: #{user.id}</div>
                          </td>
                          <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.created_at ? new Date(user.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </td>
                          <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === 'admin' 
                                ? 'bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white shadow-lg' 
                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                            }`}>
                              {user.role === 'admin' ? (
                                <>
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  Usuário
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 lg:px-8 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {(user.role === 'user' || !user.role) ? (
                                <button
                                  onClick={() => updateUserRole(user.id, 'admin')}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-[#5E2E8C] hover:bg-[#4A2370] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E2E8C] transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Promover
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserRole(user.id, 'user')}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5E2E8C] transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <ShieldOff className="w-3 h-3 mr-1" />
                                  Rebaixar
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Deletar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer da tabela */}
            {!loading && filteredUsers.length > 0 && (
              <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl sm:rounded-b-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-600 gap-2 sm:gap-0">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      Mostrando {filteredUsers.length} de {users.length} usuários
                      {searchTerm && ` • "${searchTerm}"`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-[#5E2E8C]" />
                    <span className="font-semibold">
                      Atualizado agora
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gestão de Eventos */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] rounded-t-xl sm:rounded-t-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Gestão de Eventos
                  </h2>
                  <p className="text-purple-200 text-xs sm:text-sm mt-1">
                    {events.length} eventos cadastrados • {Object.values(eventRegistrations).flat().length} inscrições totais
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="bg-white text-[#5E2E8C] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center space-x-2"
                  >
                    <Calendar size={18} />
                    <span>Novo Evento</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Eventos */}
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div key={event.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Informações do Evento */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            {event.titulo}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              event.tipo === 'peneira' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : event.tipo === 'copa'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {event.tipo?.toUpperCase()}
                            </span>
                            {event.categoria && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                {event.categoria}
                              </span>
                            )}
                            {event.tipo === 'peneira' && event.clube && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                {event.clube}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#5E2E8C]">
                            {event.inscricoes_atuais || 0}
                            {event.max_inscricoes && `/${event.max_inscricoes}`}
                          </div>
                          <div className="text-xs text-gray-500">Inscrições</div>
                        </div>
                      </div>

                      {/* Detalhes do Evento */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span>
                            {formatarData(event.data_evento)}
                            {event.hora && ` • ${formatarHora(event.hora)}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="truncate">{event.local}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign size={16} className="text-gray-400" />
                          <span>{event.valor || 'Gratuito'}</span>
                        </div>
                        {event.idade && (
                          <div className="flex items-center space-x-2">
                            <Users size={16} className="text-gray-400" />
                            <span>{event.idade}</span>
                          </div>
                        )}
                      </div>

                      {event.descricao && (
                        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                          {truncateText(event.descricao, 150)}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                      <button
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        className="flex-1 lg:flex-none bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Users size={16} />
                        <span>Inscritos ({eventRegistrations[event.id]?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="flex-1 lg:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Trash2 size={16} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Inscritos */}
                  {selectedEvent?.id === event.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Users size={16} />
                        <span>Inscritos no Evento ({eventRegistrations[event.id]?.length || 0})</span>
                      </h4>
                      
                      {eventRegistrations[event.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {eventRegistrations[event.id].map(registration => (
                            <div key={registration.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{registration.user_name}</div>
                                <div className="text-sm text-gray-500">{registration.user_email}</div>
                                {registration.user_phone && (
                                  <div className="text-sm text-gray-500">{registration.user_phone}</div>
                                )}
                                {registration.user_position && (
                                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {registration.user_position}
                                  </span>
                                )}
                                {registration.user_age && (
                                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded ml-2">
                                    {registration.user_age} anos
                                  </span>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                {new Date(registration.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Nenhuma inscrição ainda</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="p-8 sm:p-12 text-center">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Nenhum evento cadastrado
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-4">
                  Comece criando seu primeiro evento para aparecer aqui.
                </p>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] text-white px-6 py-3 rounded-xl hover:from-[#4A2370] hover:to-[#6B3299] transition-all duration-200"
                >
                  Criar Primeiro Evento
                </button>
              </div>
            )}
          </div>
        )}

        {/* Moderação de Conteúdo */}
        {activeTab === 'content' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] rounded-t-xl sm:rounded-t-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Moderação de Conteúdo</h2>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">
                  Gerencie posts da comunidade
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#5E2E8C] to-[#7E3EB4] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {post.user_name ? post.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base">{post.user_name}</span>
                              <span className="text-xs sm:text-sm text-gray-500 truncate">@{post.user_email}</span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {new Date(post.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {truncateText(post.content, 200)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>❤️ {post.likes_count} curtidas</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                            <span>💬 {post.comments_count || 0} comentários</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col sm:space-x-0 sm:space-y-2 ml-0 sm:ml-4 flex-shrink-0">
                        <button
                          onClick={() => deletePost(post.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-1 sm:w-auto justify-center"
                        >
                          <Trash2 size={14} />
                          <span>Deletar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics REAIS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                Distribuição de Usuários
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Usuários Regulares</span>
                    <span className="font-bold text-[#5E2E8C] text-base sm:text-lg">
                      {users.filter(u => u.role === 'user').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${(users.filter(u => u.role === 'user').length / Math.max(users.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Administradores</span>
                    <span className="font-bold text-[#5E2E8C] text-base sm:text-lg">
                      {users.filter(u => u.role === 'admin').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] h-2 sm:h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${(users.filter(u => u.role === 'admin').length / Math.max(users.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6 bg-gradient-to-r from-[#5E2E8C] to-[#7E3EB4] bg-clip-text text-transparent">
                Métricas de Engajamento
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between mb-2 sm:mb-3">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Posts por Usuário</span>
                    <span className="font-bold text-[#5E2E8C] text-base sm:text-lg">{realMetrics.postsPerUser}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(realMetrics.postsPerUser * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2 sm:mb-3">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Taxa de Usuários Ativos</span>
                    <span className="font-bold text-[#5E2E8C] text-base sm:text-lg">{realMetrics.activeRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${realMetrics.activeRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2 sm:mb-3">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Comentários por Post</span>
                    <span className="font-bold text-[#5E2E8C] text-base sm:text-lg">{realMetrics.commentsPerPost}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(realMetrics.commentsPerPost * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal Criar Evento */}
        {showEventModal && (
          <div className="fixed inset-0 bg-[var(--black-opacity)] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <EventForm 
                onSuccess={() => {
                  setShowEventModal(false)
                  fetchEvents() 
                }}
                onCancel={() => setShowEventModal(false)}
              />
            </div>
          </div>
        )}
    </div>
  )
}