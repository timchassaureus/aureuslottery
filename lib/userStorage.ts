'use client';

import { AureusUser } from './auth';

/**
 * Stockage local des utilisateurs (en production, utiliser une vraie base de données)
 */
const STORAGE_KEY = 'aureus_users';
const CURRENT_USER_KEY = 'aureus_current_user';

export function saveUser(user: AureusUser): void {
  if (typeof window === 'undefined') return;
  
  // Récupérer tous les utilisateurs
  const users = getAllUsers();
  
  // Mettre à jour ou ajouter l'utilisateur
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  
  // Sauvegarder
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): AureusUser | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAllUsers(): AureusUser[] {
  if (typeof window === 'undefined') return [];
  
  const usersStr = localStorage.getItem(STORAGE_KEY);
  if (!usersStr) return [];
  
  try {
    return JSON.parse(usersStr);
  } catch {
    return [];
  }
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const user = getAllUsers().find(u => u.id === userId);
  if (!user) return;
  
  user.usdcBalance = newBalance;
  saveUser(user);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}


