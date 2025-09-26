import os
import httpx
from datetime import datetime, timedelta
import random

class FootballServiceHybrid:
    def __init__(self):
        self.api_key = os.getenv("API_FOOTBALL_KEY")
        self.base_url = "https://v3.football.api-sports.io"
        self.headers = {
            'x-rapidapi-key': self.api_key,
            'x-rapidapi-host': 'v3.football.api-sports.io'
        }
        
        self.has_premium_access = False
        self._check_api_access()
        
        print(f"Modo: {'PREMIUM' if self.has_premium_access else 'MOCK'}")
    
    def _check_api_access(self):
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self._test_api_access())
            loop.close()
            self.has_premium_access = result
        except:
            self.has_premium_access = False
    
    async def _test_api_access(self):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/leagues",
                    headers=self.headers,
                    params={'search': 'women', 'season': 2024},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('results', 0) > 0 and not data.get('errors'):
                        print("API Premium detectada!")
                        return True
                
                print("Usando dados mockados (API Free)")
                return False
                
        except Exception as e:
            print(f"Erro na API, usando mock: {e}")
            return False
    
    async def get_live_matches(self):
        if self.has_premium_access:
            real_data = await self._get_real_live_matches()
            if real_data and len(real_data) > 0:
                return {"data": real_data, "source": "api"}
        
   
        mock_data = self._get_mock_live_matches()
        return {"data": mock_data, "source": "mock"}
    
    async def get_upcoming_matches(self):
        if self.has_premium_access:
            real_data = await self._get_real_upcoming_matches()
            if real_data and len(real_data) > 0:
                return {"data": real_data, "source": "api"}

        mock_data = self._get_mock_upcoming_matches()
        return {"data": mock_data, "source": "mock"}
    
    # === MÉTODOS PARA DADOS REAIS (PREMIUM) ===
    
    async def _get_real_live_matches(self):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/fixtures",
                    headers=self.headers,
                    params={
                        'live': 'all',
                        'league': 74,
                        'season': 2024
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('results', 0) > 0:
                        print("Dados reais encontrados (Ao vivo)")
                        return data.get('response', [])
                
                return []
                
        except Exception as e:
            print(f"❌ Erro API real (live): {e}")
            return []
    
    async def _get_real_upcoming_matches(self):
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            next_week = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/fixtures",
                    headers=self.headers,
                    params={
                        'from': today,
                        'to': next_week,
                        'league': 74,
                        'season': 2024,
                        'status': 'NS'
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('results', 0) > 0:
                        print("Dados reais encontrados (Próximos)")
                        return data.get('response', [])
                
                return []
                
        except Exception as e:
            print(f"❌ Erro API real (upcoming): {e}")
            return []
    
    # === MÉTODOS PARA DADOS MOCK (FALLBACK) ===
    
    def _get_mock_live_matches(self):
        print("Usando dados mockados (Ao vivo)")
        
        times_femininos = [
            {"id": 119, "name": "Corinthians", "logo": "https://media.api-sports.io/football/teams/119.png"},
            {"id": 120, "name": "São Paulo", "logo": "https://media.api-sports.io/football/teams/120.png"},
            {"id": 124, "name": "Flamengo", "logo": "https://media.api-sports.io/football/teams/124.png"},
            {"id": 121, "name": "Santos", "logo": "https://media.api-sports.io/football/teams/121.png"}
        ]
        
        home, away = random.sample(times_femininos, 2)
        
        return [{
            "fixture": {
                "id": random.randint(1000, 9999),
                "date": datetime.now().isoformat(),
                "status": {"elapsed": 65, "short": "LIVE"}
            },
            "teams": {
                "home": {"id": home["id"], "name": home["name"], "logo": home["logo"]},
                "away": {"id": away["id"], "name": away["name"], "logo": away["logo"]}
            },
            "goals": {"home": random.randint(0, 3), "away": random.randint(0, 2)},
            "league": {
                "id": 74,
                "name": "Brasileirão Feminino A1",
                "logo": "https://media.api-sports.io/football/leagues/74.png"
            }
        }]
    
    def _get_mock_upcoming_matches(self):
        print("Usando dados mockados (Próximos)")
        
        times_femininos = [
            {"id": 117, "name": "Palmeiras", "logo": "https://media.api-sports.io/football/teams/117.png"},
            {"id": 122, "name": "Grêmio", "logo": "https://media.api-sports.io/football/teams/122.png"},
            {"id": 123, "name": "Internacional", "logo": "https://media.api-sports.io/football/teams/123.png"},
            {"id": 118, "name": "Ferroviária", "logo": "https://media.api-sports.io/football/teams/118.png"},
            {"id": 119, "name": "Corinthians", "logo": "https://media.api-sports.io/football/teams/119.png"},
            {"id": 120, "name": "São Paulo", "logo": "https://media.api-sports.io/football/teams/120.png"}
        ]
        
        matches = []
        for i in range(3):
            home, away = random.sample(times_femininos, 2)
            match_date = datetime.now() + timedelta(days=random.randint(1, 14))
            
            matches.append({
                "fixture": {
                    "id": random.randint(1000, 9999),
                    "date": match_date.isoformat(),
                    "status": {"short": "NS"}
                },
                "teams": {
                    "home": {"id": home["id"], "name": home["name"], "logo": home["logo"]},
                    "away": {"id": away["id"], "name": away["name"], "logo": away["logo"]}
                },
                "goals": {"home": None, "away": None},
                "league": {
                    "id": 74,
                    "name": "Brasileirão Feminino A1", 
                    "logo": "https://media.api-sports.io/football/leagues/74.png"
                }
            })
        
        return matches

football_service = FootballServiceHybrid()