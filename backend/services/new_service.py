import random
from datetime import datetime, timedelta
import re
import requests
import xml.etree.ElementTree as ET

class NewsService:
    def __init__(self):
        self.feeds = [
            {
                "url": "https://ge.globo.com/rss/futebol/futebol-feminino/",
                "fonte": "Globo Esporte - Feminino",
                "type": "direct"
            },
            {
                "url": "https://www.cbf.com.br/futebol-feminino/feed",
                "fonte": "CBF Feminino", 
                "type": "direct"
            },
            {
                "url": "https://www.espn.com.br/espn/rss/news",
                "fonte": "ESPN Brasil",
                "type": "search"
            }
        ]
        
        self.keywords_feminino = [
            'feminino', 'feminina', 'mulher', 'mulheres', 'woman', 'women',
            'womens', 'female', 'menina', 'meninas', 'craque', 'atacante',
            'meio-campo', 'zagueira', 'goleira', 'treinadora', 'árbitra',
            'corinthians', 'são paulo', 'flamengo', 'palmeiras', 'santos',
            'grêmio', 'internacional', 'bahia', 'fluminense', 'botafogo', 
            'vasco', 'sport', 'brasileirão', 'libertadores', 'copa do brasil',
            'paulistão', 'carioca', 'gaúcho', 'seleção', 'selecao'
        ]

    def get_news(self, limit=6):
        print("Iniciando busca por notícias reais...")
        
        real_news = self._get_real_news_optimized()
        
        if real_news and len(real_news) > 2:  
            print(f"{len(real_news)} notícias reais encontradas!")
            return real_news[:limit]
        else:
            print("Poucas notícias reais, completando com fallback")
            fallback = self._get_fallback_news(limit)
            
            if real_news:
                mixed_news = real_news + fallback[len(real_news):]
                return mixed_news[:limit]
            else:
                return fallback

    def _get_real_news_optimized(self):
        news_list = []
        
        for feed in self.feeds:
            try:
                print(f"Tentando: {feed['fonte']}")
                
                if feed['type'] == 'direct':
                    news = self._fetch_feed(feed['url'], feed['fonte'])
                else:
                    news = self._fetch_and_filter_feed(feed['url'], feed['fonte'])
                
                news_list.extend(news)
                print(f"{feed['fonte']}: {len(news)} notícias")
                
            except Exception as e:
                print(f"Erro em {feed['fonte']}: {e}")
                continue
        
        return news_list

    def _fetch_feed(self, url, fonte):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml'
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            news_items = []
            
            for item in root.findall('.//item')[:10]:
                title_elem = item.find('title')
                if title_elem is not None:
                    title = title_elem.text or ""
                    
                    news_item = self._create_news_item(
                        title, 
                        item.find('link').text if item.find('link') is not None else "#",
                        item.find('description').text if item.find('description') is not None else title,
                        fonte
                    )
                    
                    if news_item:
                        news_items.append(news_item)
            
            return news_items
            
        except Exception as e:
            print(f"Erro ao buscar feed {fonte}: {e}")
            return []

    def _fetch_and_filter_feed(self, url, fonte):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            news_items = []
            
            for item in root.findall('.//item')[:20]:
                title_elem = item.find('title')
                if title_elem is not None:
                    title = title_elem.text or ""
                    
                    if self._is_futebol_feminino(title):
                        news_item = self._create_news_item(
                            title,
                            item.find('link').text if item.find('link') is not None else "#",
                            item.find('description').text if item.find('description') is not None else title,
                            fonte
                        )
                        
                        if news_item:
                            news_items.append(news_item)
            
            return news_items
            
        except Exception as e:
            print(f"Erro no feed {fonte}: {e}")
            return []

    def _create_news_item(self, title, link, description, fonte):
        try:
            return {
                "id": abs(hash(title + fonte)) % 10000,
                "titulo": title.strip(),
                "resumo": self._clean_summary(description),
                "link": link if link else "#",
                "fonte": fonte,
                "data": datetime.now().isoformat(),
                "imagem": self._get_image_for_news(title),
                "timestamp": datetime.now().timestamp()
            }
        except Exception as e:
            print(f"Erro ao criar item: {e}")
            return None

    def _is_futebol_feminino(self, title):
        if not title:
            return False
            
        title_lower = title.lower()
        
        palavras_futebol = ['futebol', 'futbol', 'football', 'jogadora', 'craque', 'gol', 'campo', 'estádio']
        palavras_femininas = ['feminino', 'feminina', 'mulher', 'mulheres', 'woman', 'women', 'female']
        
        tem_futebol = any(palavra in title_lower for palavra in palavras_futebol)
        tem_feminino = any(palavra in title_lower for palavra in palavras_femininas)
        
        return tem_futebol and tem_feminino

    def _get_image_for_news(self, title):
        title_lower = title.lower()
        
        time_images = {
            'corinthians': '/images/news-corinthians.jpg',
            'são paulo': '/images/news-saopaulo.jpg',
            'sao paulo': '/images/news-saopaulo.jpg',
            'flamengo': '/images/news-flamengo.jpg',
            'palmeiras': '/images/news-palmeiras.jpg',
            'santos': '/images/news-default1.jpg',
            'grêmio': '/images/news-default2.jpg',
            'internacional': '/images/news-default3.jpg',
            'bahia': '/images/news-default1.jpg',
            'fluminense': '/images/news-default2.jpg',
            'botafogo': '/images/news-default3.jpg',
            'vasco': '/images/news-default1.jpg',
            'sport': '/images/news-default2.jpg',
            'seleção': '/images/news-selecao.jpg',
            'selecao': '/images/news-selecao.jpg'
        }
        
        for time, imagem in time_images.items():
            if time in title_lower:
                return imagem
        
        if any(word in title_lower for word in ['campeonato', 'brasileirão', 'libertadores']):
            return '/images/news-default1.jpg'
        elif any(word in title_lower for word in ['seleção', 'selecao', 'cbf']):
            return '/images/news-selecao.jpg'
        else:
            return f'/images/news-default{random.randint(1, 3)}.jpg'

    def _clean_summary(self, text):
        if not text:
            return "Notícia sobre futebol feminino."
        
        clean = re.compile('<.*?>')
        cleaned = re.sub(clean, '', text)
       
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        if len(cleaned) > 150:
            return cleaned[:147] + "..."
        
        return cleaned

    def _get_fallback_news(self, limit):
        print("🔄 Carregando notícias de fallback...")
        
        base_time = datetime.now()
        
        return [
            {
                "id": 1,
                "titulo": "Corinthians vence São Paulo no clássico feminino",
                "resumo": "Time alvinegro vence por 2x1 e segue na liderança do Brasileirão Feminino",
                "link": "#",
                "fonte": "Globo Esporte",
                "data": (base_time - timedelta(hours=2)).isoformat(),
                "imagem": "/images/news-corinthians.jpg",
                "timestamp": (base_time - timedelta(hours=2)).timestamp()
            },
            {
                "id": 2, 
                "titulo": "Seleção Feminina se prepara para amistosos",
                "resumo": "Arthur Elias convoca jogadoras para etapa de preparação na Europa",
                "link": "#",
                "fonte": "CBF",
                "data": (base_time - timedelta(hours=5)).isoformat(),
                "imagem": "/images/news-selecao.jpg",
                "timestamp": (base_time - timedelta(hours=5)).timestamp()
            },
            {
                "id": 3,
                "titulo": "Flamengo anuncia novas contratações",
                "resumo": "Clube reforça elenco para disputa da Libertadores Feminina",
                "link": "#",
                "fonte": "ESPN",
                "data": (base_time - timedelta(hours=8)).isoformat(),
                "imagem": "/images/news-flamengo.jpg",
                "timestamp": (base_time - timedelta(hours=8)).timestamp()
            },
            {
                "id": 4,
                "titulo": "Palmeiras conquista título paulista",
                "resumo": "Time verde vence campeonato estadual de forma invicta",
                "link": "#",
                "fonte": "GE",
                "data": (base_time - timedelta(days=1)).isoformat(),
                "imagem": "/images/news-palmeiras.jpg",
                "timestamp": (base_time - timedelta(days=1)).timestamp()
            }
        ][:limit]


news_service = NewsService()