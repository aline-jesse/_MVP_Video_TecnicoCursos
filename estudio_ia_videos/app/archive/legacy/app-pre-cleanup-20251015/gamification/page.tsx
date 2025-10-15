
/**
 * 🎮 Estúdio IA de Vídeos - Sprint 10
 * Página de Gamificação e Engajamento
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Medal,
  Crown,
  Flame,
  Shield,
  Book,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserStats, LeaderboardEntry, Achievement, Challenge, BadgeItem } from '@/types/sprint10';

export default function GamificationPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);

  useEffect(() => {
    loadUserStats();
    loadLeaderboard();
    loadAchievements();
    loadChallenges();
    loadBadges();
  }, []);

  const loadUserStats = () => {
    setUserStats({
      level: 12,
      xp: 2847,
      xpToNext: 3000,
      streak: 7,
      completedCourses: 15,
      totalVideos: 42,
      hoursWatched: 28.5,
      rank: 3,
      points: 12450
    });
  };

  const loadLeaderboard = () => {
    setLeaderboard([
      {
        id: 1,
        name: 'Marina Silva',
        avatar: '/avatar-1.jpg',
        level: 15,
        points: 18750,
        streak: 12,
        badge: 'Especialista NR-35'
      },
      {
        id: 2,
        name: 'João Santos', 
        avatar: '/avatar-2.jpg',
        level: 14,
        points: 16200,
        streak: 8,
        badge: 'Mestre Elétrica'
      },
      {
        id: 3,
        name: 'Ana Costa',
        avatar: '/avatar-3.jpg', 
        level: 12,
        points: 12450,
        streak: 7,
        badge: 'Técnico Expert'
      }
    ]);
  };

  const loadAchievements = () => {
    setAchievements([
      {
        id: 'first-video',
        name: 'Primeiro Vídeo',
        description: 'Criou seu primeiro vídeo de treinamento',
        icon: PlayCircle,
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        rarity: 'common',
        xp: 100
      },
      {
        id: 'safety-expert',
        name: 'Especialista em Segurança',
        description: 'Completou 10 cursos de segurança do trabalho',
        icon: Shield,
        unlocked: true,
        unlockedAt: new Date('2024-02-20'),
        rarity: 'rare',
        xp: 500
      }
    ]);
  };

  const loadChallenges = () => {
    setChallenges([
      {
        id: 'weekly-nr35',
        name: 'Desafio NR-35 Semanal',
        description: 'Complete 3 módulos sobre trabalho em altura esta semana',
        type: 'weekly',
        progress: 2,
        total: 3,
        reward: '500 XP + Badge Altura',
        timeLeft: '2 dias',
        difficulty: 'medium'
      }
    ]);
  };

  const loadBadges = () => {
    setBadges([
      {
        id: 'safety-first',
        name: 'Segurança em Primeiro',
        description: 'Completou curso básico de segurança',
        icon: Shield,
        color: 'bg-blue-500',
        earned: true
      }
    ]);
  };

  const acceptChallenge = (challengeId: string) => {
    toast.success('Desafio aceito! Boa sorte!');
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      uncommon: 'text-green-600 bg-green-100',
      rare: 'text-blue-600 bg-blue-100',
      legendary: 'text-purple-600 bg-purple-100'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              Gamificação & Engajamento
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Torne o aprendizado em segurança divertido com desafios, conquistas e rankings
          </p>
        </div>

        {/* Stats do Usuário */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  Nível {userStats.level}
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={(userStats.xp / userStats.xpToNext) * 100} 
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600">
                    {userStats.xp} / {userStats.xpToNext} XP
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.streak} dias
                </div>
                <p className="text-sm text-gray-600">Sequência Atual</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Medal className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  #{userStats.rank}
                </div>
                <p className="text-sm text-gray-600">Posição no Ranking</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.points.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Pontos Totais</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Ranking Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1">
                        {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-orange-600" />}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          Nível {user.level}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user.points.toLocaleString()} pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.badge}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span className="text-xs">{user.streak}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-purple-600" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div 
                    key={achievement.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <IconComponent className={`h-8 w-8 ${
                      achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Desbloqueada em {achievement.unlockedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">
                        +{achievement.xp}
                      </div>
                      <p className="text-xs text-gray-600">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
